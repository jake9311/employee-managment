const Guard = require("../models/Guard");
const {sendEmail} = require('../utils/sendEmail');
const User = require("../models/User");


exports.createGuard = async (req, res) => {
    try{
    if(!req.user) 
        return res.status(403).json({error: 'Unauthorized- no user info'});
   
       const {name}= req.body;
       const user= await User.findOne({googleId: req.user.googleId});
       if(!user) return res.status(403).json({error: 'User not familiar with the system'});
       
       const guard= new Guard({ 
         name,
        orgId: user.orgId, 
        sickDays: [], lateEntries: [], cancellations: [] });
       await guard.save();
       res.status(201).json(guard);
       }
    catch(error){
        console.error('error creating guard',error);
        res.status(500).json({ error: error.message });
    }
};

exports.getGuards=async (req,res)=>{
    try{
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized- no user info' });
        }


        const user= await User.findOne({googleId: req.user.googleId});
        if(!user){
            return res.status(403).json({error: 'User not familiar with the system'});
        }
        const guards =await Guard.find({orgId: user.orgId}).sort({name: 1});
  
        res.json(guards);
    }
    catch(error){
        res.status(500).json({ error: error.message });
    }
};


exports.updateGuard= async (req, res)=>{
    try{
        const {id} =req.params;
        const update = await Guard.findByIdAndUpdate(id, req.body, {new: true});
        return res.json(update);
    }
    catch(error){
        res.status(500).json({ error: error.message });
    }
};


exports.deleteGuard=async (req, res)=>{
    try{
        const {id} =req.params;
        await Guard.findByIdAndDelete(id);
        res.json({message: "Guard deleted"});
    }
    catch(error){
        res.status(500).json({ error: error.message });
    }
};

exports.addLateEntry= async (req, res)=>{
    const {id}= req.params;
    const {date,reason,scheduledHour,actualHour}= req.body;
    try{
        const guard= await Guard.findById(id);
        if(!guard){
            return res.status(404).json({error: "Guard not found"});
        }
        if(scheduledHour>actualHour){
            return res.status(400).json({error: "Scheduled hour must be before actual hour"});
        }
        guard.lateEntries.push({date,reason,scheduledHour,actualHour});
        await guard.save();
        res.json({message: "Late entry added", guard});
    }catch (err){
res.status(500).json({error: err.message});
    }
    };





    exports.addSickDay= async (req,res)=>{
        const {id}= req.params;
        const {startDate, endDate, reason}= req.body;
        try{
            const guard= await Guard.findById(id);
            if(!guard){
                return res.status(404).json({error: "Guard not found"});
            }
            const start=new Date(startDate);
            const end=new Date(endDate);
            if(start>end){
                return res.status(400).json({error: "Start date must be before end date"});
               
            }
            const overlap= guard.sickDays.some((sickDay)=>{
                const existingStart= new Date(sickDay.startDate);
                const existingEnd= new Date(sickDay.endDate);
                return start<=existingEnd && end>=existingStart;
            });
            if (overlap){
                return res.status(400).json({error: "Sick day overlaps with existing sick day"});
            }



            guard.sickDays.push({
                startDate, endDate, reason, hasApproval : false, notified: false});
            await guard.save();
            res.json({message: "Sick day added", guard});
        }catch (err){
            res.status(500).json({error: err.message});
        }
    }

    exports.checkSickDayApprovals= async()=>{
        const guards= await Guard.find();
        const now=new Date();
        for (const guard of guards){
            let update= false;

            for (const sickDay of guard.sickDays){
                const end= new Date(sickDay.endDate);
                const MS_IN_DAY= 1000*60*60*24;
                const differentDays= Math.floor(
                (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())-
                Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()))/MS_IN_DAY);
                // const differentDays= Math.floor((now-end)/(1000*60*60*24));

                
                if(!sickDay.hasApproval && !sickDay.notified && differentDays>=4){
                    const userInOrg= await User.find({orgId: guard.orgId});
                    let sentAtLeastOne= false;
                    for (const u of userInOrg){
                        if (u.email){
                            try{
                                await sendEmail(
                                    u.email,`תזכורת להבאת אישור מחלה התראה:`,`  ${guard.name} סיים מחלה לפני ${differentDays} ימים ולא הביא אישור מחלה`);
                                    sentAtLeastOne= true;
                                console.log(`התראה: מאבטח ${guard.name} סיים מחלה לפני ${differentDays} ימים ולא הביא אישור מחלה`);
                            }catch (err){
                                console.error('שגיאה בשליחת המייל',err);
                            }
                        }
                        if(sentAtLeastOne){
                            sickDay.notified= true;
                            update= true;
                            console.log(`התראה נשלחה עבור ${guard.name} (${differentDays} ימים)`);
                        }
                    }
                }
            }
            if (update) await guard.save();
        }
    };

    exports.updateSickDayApproval = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { id, sickDayId } = req.params;
    const { hasApproval } = req.body;

    const user = await User.findOne({ googleId: req.user.googleId });
    if (!user) return res.status(403).json({ error: 'User not familiar with the system' });

    const guard = await Guard.findOne({ _id: id, orgId: user.orgId });
    if (!guard) return res.status(404).json({ error: 'Guard not found or access denied' });

    const sickDay = guard.sickDays.id(sickDayId);
    if (!sickDay) return res.status(404).json({ error: 'Sick day not found' });

    sickDay.hasApproval = !!hasApproval;

    if (sickDay.hasApproval) sickDay.notified = true;

    await guard.save();

    return res.json({
      message: 'Sick approval updated',
      guardId: guard._id,
      sickDayId,
      hasApproval: sickDay.hasApproval,
      notified: sickDay.notified
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


    exports.addCancellation=async (req, res)=>{
        const {id}= req.params;
        const {date, reason}= req.body;
        try{
            const guard= await Guard.findById(id);
            if(!guard){
                return res.status(404).json({error: "Guard not found"});
            }
            guard.cancellations.push({date, reason});
            await guard.save();
            res.json({message: "Cancellation added", guard});
        }catch (err){
            res.status(500).json({error: err.message});
        }
    }



    exports.getLastReports=async (req,res)=>{
        try{
            if (!req.user ) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const user= await User.findOne({googleId: req.user.googleId});
            if(!user){
                return res.status(403).json({error: 'User not familiar with the system'});
            }
            const guards= await Guard.find({orgId: user.orgId});

            const reports= guards.map(guard=>{
                const late= guard.lateEntries.map(entry=>({type:"איחור", rnteyId:entry._id,date:entry.date, reason:entry.reason, scheduledHour:entry.scheduledHour, actualHour:entry.actualHour, guardName:guard.name, guardId:guard._id}));
                const sick= guard.sickDays.map(sickDay=>({type:"מחלה", sickDayId:sickDay._id,
                    startDate:sickDay.startDate, endDate:sickDay.endDate, reason:sickDay.reason, guardName:guard.name, guardId:guard._id, hasApproval: sickDay.hasApproval, notified: sickDay.notified}));
                const cancellations= guard.cancellations.map(cancellation=>({type:"ביטול", cancellationId:cancellation._id,date:cancellation.date, reason:cancellation.reason, guardName:guard.name, guardId:guard._id}));
                return [...late, ...sick, ...cancellations];
                    
                });
            res.json(reports.flat());
            }catch (err){
                res.status(500).json({error: 'failed to get reports'});
        }
    };

exports.getReportsByGuardId = async (req, res) => {
  try {
    if (!req.user ) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const {guardId } = req.params;

    const user = await User.findOne({ googleId: req.user.googleId });
    if (!user) {
      return res.status(403).json({ error: 'User not familiar with the system' });
    }
 
  
    const guard = await Guard.findOne({ _id: guardId, orgId: user.orgId });
    if (!guard) {
      return res.status(403).json({ error: 'Guard not found or access denied' });
    }

    const late = guard.lateEntries.map(entry => ({
      type: "איחור",
      entryId: entry._id,
      date: entry.date,
      reason: entry.reason,
      scheduledHour: entry.scheduledHour,
      actualHour: entry.actualHour,
      guardName: guard.name,
      guardId: guard._id
    }));

    const sick = guard.sickDays.map(entry => ({
      type: "מחלה",
      sickDayId: entry._id,
      date: entry.startDate, 
      startDate: entry.startDate,
      endDate: entry.endDate,
      reason: entry.reason,
      guardName: guard.name,
      hasApproval: entry.hasApproval,
      notified: entry.notified,
      guardId: guard._id
    }));

    const cancellations = guard.cancellations.map(cancellation => ({
      type: "ביטול",
      cancellationId: cancellation._id,
      date: cancellation.date,
      reason: cancellation.reason,
      guardName: guard.name,
      guardId: guard._id
    }));

    const allReports = [...late, ...sick, ...cancellations];

    allReports.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(allReports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to get reports' });
  }
};
