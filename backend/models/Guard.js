const mongoose = require('mongoose');


const SickDaySchema= new mongoose.Schema({
    startDate: {type: Date, required: true},
    endDate: {type: Date, required: true},
    reason: {type: String, required: true},
    hasApproval:{type: Boolean, default: false},
    notified:{ type: Boolean, default: false},
});

const LateEntrySchema=new mongoose.Schema({
date: {type: Date, required: true},
reason: {type: String},
scheduledHour: {type: String},
actualHour: {type: String},
});

const CancellationSchema=new mongoose.Schema({
    date: {type: String, required: true},
    reason: {type: String}
});

// const GuardSchema= new mongoose.Schema({
//     ownerId: {type: String, required: true},
//     name: String,
//     sickDays:[SickDaySchema],
//     lateEntries:[LateEntrySchema],
//     cancellations:[{ date: String, reason: String }],
// });

const GuardSchema= new mongoose.Schema({
    ownerId: {type: String, required: true},
    orgId: {type: String, required: true},
    name: String,
    sickDays:[SickDaySchema],
    lateEntries:[LateEntrySchema],
    cancellations:[{ date: String, reason: String }],
});


module.exports= mongoose.model("Guard", GuardSchema);