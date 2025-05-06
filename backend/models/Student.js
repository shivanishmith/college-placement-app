// models/Student.js

const mongoose = require('mongoose');

const customFieldSchema = new mongoose.Schema({
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  value: mongoose.Schema.Types.Mixed,
});

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNumber: { type: String, required: true },
  birthDate: { type: Date },
  gender: { type: String },
  nationality: { type: String },
  yearLevel: { type: String },
  homeroom: { type: String },
  enrollmentDate: { type: Date },
  ssid: { type: String },
  identificationNumber: { type: String },
  resume: { type: String }, // URL after upload
  graduationYear: { type: Number },
  bloodGroup: { type: String },
  address: { type: String },
  phoneNumber: { type: String },
  emergencyContact: { type: String },
  studentStatus: { 
    type: String, 
    enum: ['Active', 'Inactive'], 
    default: 'Active' 
  },
  profilePhoto: { type: String }, // Profile image URL
  customFields: [customFieldSchema], // Additional dynamic fields
}, { timestamps: true }); // <-- timestamps for createdAt/updatedAt

module.exports = mongoose.model('Student', studentSchema);
