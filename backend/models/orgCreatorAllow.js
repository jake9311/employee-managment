const mongoose = require('mongoose');

const OrgCreatorAllowSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    note: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('OrgCreatorAllow', OrgCreatorAllowSchema);
