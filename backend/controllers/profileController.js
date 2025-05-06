// controllers/profileController.js
const Student = require('../models/Student');

// Controller for viewing all students' profiles (for both Admin and Teacher)
exports.viewStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Controller for viewing a single student profile (for both Admin and Teacher)
exports.viewStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId).populate('userId');
    if (!student) return res.status(404).json({ message: 'Student not found' });

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
