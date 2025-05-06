const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    default: "General Feedback"
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["unread", "read", "resolved"],
    default: "unread"
  }
}, { timestamps: true });

module.exports = mongoose.model("Feedback", feedbackSchema);
