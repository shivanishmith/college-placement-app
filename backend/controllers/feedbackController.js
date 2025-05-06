const Feedback = require('../models/Feedback');
const User = require('../models/User');
const ErrorHandler = require('../utils/error');

// Create new feedback (student only)
exports.createFeedback = async (req, res, next) => {
  try {
    // Verify user is a student
    if (req.user.role !== 'student') {
      return next(new ErrorHandler('Only students can send feedback', 403));
    }

    const { message, subject } = req.body;
    
    if (!message) {
      return next(new ErrorHandler('Message is required', 400));
    }

    // Create feedback record
    const feedback = new Feedback({
      studentId: req.user.id,
      studentName: req.user.name,
      subject: subject || 'General Feedback',
      message,
      status: 'unread'
    });

    await feedback.save();
    
    res.status(201).json({
      success: true,
      message: 'Feedback sent successfully',
      feedback
    });
  } catch (err) {
    next(new ErrorHandler('Error sending feedback', 500));
  }
};

// Get all feedback (superadmin only)
exports.getAllFeedback = async (req, res, next) => {
  try {
    // Verify user is a superadmin
    if (req.user.role !== 'superadmin') {
      return next(new ErrorHandler('Unauthorized access', 403));
    }

    // Get all feedback ordered by date (newest first)
    const feedback = await Feedback.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedback.length,
      data: feedback
    });
  } catch (err) {
    next(new ErrorHandler('Error fetching feedback', 500));
  }
};

// Mark feedback as read (superadmin only)
exports.updateFeedbackStatus = async (req, res, next) => {
  try {
    // Verify user is a superadmin
    if (req.user.role !== 'superadmin') {
      return next(new ErrorHandler('Unauthorized access', 403));
    }

    const { id } = req.params;
    const { status } = req.body;

    // Update feedback status
    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { status: status || 'read' },
      { new: true }
    );

    if (!feedback) {
      return next(new ErrorHandler('Feedback not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Feedback status updated',
      feedback
    });
  } catch (err) {
    next(new ErrorHandler('Error updating feedback status', 500));
  }
};

// Get feedback by ID (superadmin only)
exports.getFeedbackById = async (req, res, next) => {
  try {
    // Verify user is a superadmin
    if (req.user.role !== 'superadmin') {
      return next(new ErrorHandler('Unauthorized access', 403));
    }

    const { id } = req.params;
    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return next(new ErrorHandler('Feedback not found', 404));
    }

    res.status(200).json({
      success: true,
      feedback
    });
  } catch (err) {
    next(new ErrorHandler('Error fetching feedback', 500));
  }
}; 