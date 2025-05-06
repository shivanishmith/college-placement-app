const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isAuthenticated, isAuthorized } = require('../middlewares/auth');
const ErrorHandler = require('../utils/error');

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return next(new ErrorHandler('User already exists', 400));

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    return next(new ErrorHandler('Error registering user', 500));
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new ErrorHandler('User not found', 404));

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next(new ErrorHandler('Invalid credentials', 401));

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      token
    });
  } catch (err) {
    return next(new ErrorHandler('Login error', 500));
  }
});

// View own profile
router.get('/profile', isAuthenticated, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return next(new ErrorHandler('User not found', 404));
    res.status(200).json({ user });
  } catch (err) {
    return next(new ErrorHandler('Error fetching user profile', 500));
  }
});

// Update own profile (student only)
router.put('/profile', isAuthenticated, async (req, res, next) => {
  try {
    if (req.user.role !== 'student') {
      return next(new ErrorHandler('Only students can update profile', 403));
    }

    const updateFields = {};
    const unsetFields = {};

    // Handle direct fields (cgpa and department)
    if (req.body.cgpa !== undefined) {
      updateFields.cgpa = req.body.cgpa;
    }
    
    if (req.body.department !== undefined) {
      updateFields.department = req.body.department;
    }

    // Handle profile fields (custom fields)
    if (req.body.profile && typeof req.body.profile === 'object') {
      for (const [key, value] of Object.entries(req.body.profile)) {
        updateFields[`profile.${key}`] = value;
      }
    }

    if (Array.isArray(req.body.deleteFields)) {
      for (const key of req.body.deleteFields) {
        unsetFields[`profile.${key}`] = "";
      }
    }

    const updateQuery = {};
    if (Object.keys(updateFields).length > 0) updateQuery.$set = updateFields;
    if (Object.keys(unsetFields).length > 0) updateQuery.$unset = unsetFields;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateQuery, { new: true });
    if (!updatedUser) return next(new ErrorHandler('User not found', 404));

    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    return next(new ErrorHandler('Error updating user profile', 500));
  }
});

// View student profile (teacher/superadmin only)
router.get('/students/:id', isAuthenticated, isAuthorized('teacher', 'superadmin'), async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) return next(new ErrorHandler('Student not found', 404));
    if (student.role !== 'student') return next(new ErrorHandler('Requested user is not a student', 400));

    res.status(200).json({ student });
  } catch (err) {
    return next(new ErrorHandler('Error fetching student profile', 500));
  }
});

// Admin Test
router.get('/admin', isAuthenticated, isAuthorized('admin', 'superadmin'), (req, res) => {
  res.status(200).json({ message: 'Welcome, Admin!' });
});

module.exports = router;
