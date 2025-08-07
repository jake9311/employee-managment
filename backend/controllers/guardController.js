const Guard = require("../models/Guard");
const {sendEmail} = require('../utils/sendEmail');
const User = require("../models/User");

// exports.createGuard = async (req, res) => {
//     try {
//        const {ownerId,name}= req.body;
//        const guard= new Guard({ ownerId, name, sickDays: [], lateEntries: [], cancellations: [] });
//        await guard.save();
//        res.status(201).json(guard);
//     } catch (error) {
//         console.error('שגיאה ביצירת מאבטח: ', error);
//         res.status(500).json({ error: error.message });
//     }
// };

exports.createGuard = async (req, res) => {
    if(!req.user|| !req.user.orgId) 
        return res.status(403).json({error: 'Unauthorized- no user info'});
    // try {
       const {name}= req.body;
       const user= await User.findOne({googleId: req.user.googleId});
       if(!user) return res.status(403).json({error: 'User not familiar with the system'});
       
       const guard= new Guard({  name,
        orgId: user.orgId, 
        sickDays: [], lateEntries: [], cancellations: [] });
       await guard.save();
       res.status(201).json(guard);
    // } catch (error) {
    //     console.error('שגיאה ביצירת מאבטח: ', error);
    //     res.status(500).json({ error: error.message });
    // }
};

exports.getGuardsByUser=async (req,res)=>{
    try{
        const {userId}= req.params;
        const guards= await Guard.find({ ownerId: userId });
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
        res.json(update);
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



            guard.sickDays.push({startDate, endDate, reason});
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
                const differentDays= Math.floor((now-end)/(1000*60*60*24));
//
console.log(`בודק בעלים של ${guard.name}: ${guard.ownerId}`);
const owner = await User.findOne({ googleId: guard.ownerId });
if (!owner) {
  console.warn('⚠️ לא נמצא משתמש תואם ב-User למסד');
  continue;
}
console.log('נמצא משתמש:', owner);




//
                
                if(!sickDay.hasApproval && !sickDay.notified && differentDays>=4){
                    console.log(owner.email);
                    sickDay.notified= true;
                    update= true;
                    sendEmail(owner.email,`תזכורת להבאת אישור מחלה התראה:`,`  ${guard.name} סיים מחלה לפני ${differentDays} ימים ולא הביא אישור מחלה`);
                    console.log(`התראה: מאבטח ${guard.name} סיים מחלה לפני ${differentDays} ימים ולא הביא אישור מחלה`);
                    
                }
              
            }
            if (update) await guard.save();
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
            const ownerId= req.params.ownerId;
            const guards= await Guard.find({ownerId});

            const reports= guards.map(guard=>{
                const late= guard.lateEntries.map(entry=>({type:"איחור", date:entry.date, reason:entry.reason, scheduledHour:entry.scheduledHour, actualHour:entry.actualHour, guardName:guard.name, guardId:guard._id}));
                const sick= guard.sickDays.map(sickDay=>({type:"מחלה", startDate:sickDay.startDate, endDate:sickDay.endDate, reason:sickDay.reason, guardName:guard.name, guardId:guard._id}));
                const cancellations= guard.cancellations.map(cancellation=>({type:"ביטול", date:cancellation.date, reason:cancellation.reason, guardName:guard.name, guardId:guard._id}));
                return [...late, ...sick, ...cancellations];
                    
                });
            res.json(reports.flat());
            }catch (err){
                res.status(500).json({error: 'failed to get reports'});
        }
    };

exports.getReportsByGuardId = async (req, res) => {
  try {
    const { ownerId, guardId } = req.params;

    // בדיקה שהמאבטח שייך למנהל
    const guard = await Guard.findOne({ _id: guardId, ownerId });
    if (!guard) {
      return res.status(403).json({ error: 'Guard not found or access denied' });
    }

    const late = guard.lateEntries.map(entry => ({
      type: "איחור",
      date: entry.date,
      reason: entry.reason,
      scheduledHour: entry.scheduledHour,
      actualHour: entry.actualHour,
      guardName: guard.name
    }));

    const sick = guard.sickDays.map(entry => ({
      type: "מחלה",
      date: entry.startDate, 
      startDate: entry.startDate,
      endDate: entry.endDate,
      reason: entry.reason,
      guardName: guard.name
    }));

    const cancellations = guard.cancellations.map(entry => ({
      type: "ביטול",
      date: entry.date,
      reason: entry.reason,
      guardName: guard.name
    }));

    const allReports = [...late, ...sick, ...cancellations];

    allReports.sort((a, b) => new Date(b.date) - new Date(a.date)); // מיון לפי תאריך יורד

    res.json(allReports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to get reports' });
  }
};
