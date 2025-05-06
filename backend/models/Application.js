const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  appliedAt: { type: Date, default: Date.now },
  fieldData: { type: Object, default: {} }
});

module.exports = mongoose.model("Application", applicationSchema);
