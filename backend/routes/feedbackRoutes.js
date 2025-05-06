const express = require('express');
const router = express.Router();
const { isAuthenticated, isAuthorized } = require('../middlewares/auth');
const { 
  createFeedback, 
  getAllFeedback, 
  getFeedbackById, 
  updateFeedbackStatus 
} = require('../controllers/feedbackController');

// Create feedback - student only
router.post('/', isAuthenticated, createFeedback);

// Get all feedback - superadmin only
router.get('/', isAuthenticated, isAuthorized('superadmin'), getAllFeedback);

// Get feedback by ID - superadmin only
router.get('/:id', isAuthenticated, isAuthorized('superadmin'), getFeedbackById);

// Update feedback status - superadmin only
router.patch('/:id/status', isAuthenticated, isAuthorized('superadmin'), updateFeedbackStatus);

module.exports = router;
