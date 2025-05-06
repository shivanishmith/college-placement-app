const User = require('../models/User'); // Assuming the User model is being used
const cloudinary = require('cloudinary').v2; // Assuming Cloudinary is set up

// Get student profile (for teachers and superadmins)
exports.getStudentProfile = async (req, res) => {
  try {
    // Check if the user is authorized to view the student's profile
    if (req.user.role !== 'teacher' && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Unauthorized to view student profile' });
    }

    // Fetch student by userId (or by _id if required)
    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ msg: "Student not found" });

    // Ensure the user is actually a student
    if (student.role !== 'student') {
      return res.status(400).json({ error: 'Requested user is not a student' });
    }

    // Return the student data
    res.json({
      success: true,
      data: student
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all students (for teachers and superadmins)
exports.getAllStudents = async (req, res) => {
  try {
    // Check if the user is authorized to view student profiles
    if (req.user.role !== 'teacher' && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Unauthorized to view student profiles' });
    }

    // Get search query if provided
    const searchQuery = req.query.search || '';
    
    // Find all students, optionally filtered by search query
    const query = { role: 'student' };
    
    // If search query provided, search in name field
    if (searchQuery) {
      query.name = { $regex: searchQuery, $options: 'i' }; // Case-insensitive search
    }
    
    // Fetch only necessary fields for the list view
    const students = await User.find(query, 'name email imageUrl');
    
    // Return the students data
    res.json({
      success: true,
      data: students
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update student profile (for students themselves)
exports.updateStudentProfile = async (req, res) => {
  try {
    // Check if the logged-in user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can update their profile' });
    }

    const data = req.body; // Data to be updated in the student's profile

    // Handle file uploads (photo, resume) via Cloudinary
    if (req.files) {
      if (req.files.photo) {
        const result = await cloudinary.uploader.upload(req.files.photo.tempFilePath);
        data.profilePhoto = result.secure_url;
      }
      if (req.files.resume) {
        const result = await cloudinary.uploader.upload(req.files.resume.tempFilePath, {
          resource_type: "raw",
        });
        data.resume = result.secure_url;
      }
    }

    // If there are custom fields, parse them (if they are passed as a string)
    if (data.customFields && typeof data.customFields === "string") {
      try {
        data.customFields = JSON.parse(data.customFields);
      } catch (err) {
        return res.status(400).json({ error: "Invalid customFields format" });
      }
    }

    // Update the student's profile in the database
    const updated = await User.findOneAndUpdate(
      { _id: req.user.id }, // Find student by user ID
      data,                  // Update with new data
      { new: true, upsert: true } // Return the updated document
    );

    // Return success message with the updated student profile
    res.json({
      success: true,
      message: "Profile updated successfully",
      student: updated
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
