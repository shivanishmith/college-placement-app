//User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,  // Ensure name is provided
  },
  email: {
    type: String,
    unique: true,
    required: true,  // Ensure email is provided
    match: [/.+@.+\..+/, 'Please provide a valid email address'], // Email validation regex
  },
  password: {
    type: String,
    required: true,  // Ensure password is provided
    minlength: 6, // Password should have a minimum length
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'superadmin'],
    default: 'student',  // Default role is 'student'
  },
  // Academic information (for students)
  cgpa: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  department: {
    type: String,
    enum: ['CSE', 'ECE', 'EEE', 'MECH', 'IT', 'MME', 'CIVIL', ''],
    default: ''
  },
  // Fields that can be added dynamically by teachers (Map)
  profile: {
    type: Map,
    of: String,
  },
  resumeUrl: String,  // URL to the user's resume (if applicable)
  imageUrl: String,   // URL to the user's profile image (if applicable)
}, {
  timestamps: true,  // Adds createdAt and updatedAt fields automatically
});

module.exports = mongoose.model('User', userSchema);
