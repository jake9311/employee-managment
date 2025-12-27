const mongoose = require('mongoose');

const AllowedEmailSchema = new mongoose.Schema({
  orgId: { type: String, required: true, index: true },
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  role:  { type: String, enum: ['owner','admin','user'], default: 'user' },
}, { timestamps: true });

AllowedEmailSchema.index({ orgId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('AllowedEmail', AllowedEmailSchema);
