//profileFieldRoutes.js
const express = require('express');
const router = express.Router();
const ProfileField = require('../models/ProfileField');
const { isAuthenticated, isAuthorized } = require('../middlewares/auth');

// Add a new profile field (for teachers)
router.post('/add', isAuthenticated, isAuthorized('teacher'), async (req, res) => {
  try {
    const { field, description } = req.body;

    // Ensure that both fields are provided in the request body
    if (!field || !description) {
      return res.status(400).json({ error: 'Both field and description are required' });
    }

    const newField = new ProfileField({ field, description });
    await newField.save();
    res.status(201).json({ message: 'Profile field added successfully', profileField: newField });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error adding profile field' });
  }
});

// Get all profile fields (for students and teachers)
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const fields = await ProfileField.find();
    res.status(200).json({ fields });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching profile fields' });
  }
});

// Get a single profile field by ID (for students and teachers)
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const field = await ProfileField.findById(req.params.id);
    if (!field) {
      return res.status(404).json({ error: 'Profile field not found' });
    }
    res.status(200).json({ field });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching profile field' });
  }
});

// Update a profile field (for teachers)
router.put('/update/:id', isAuthenticated, isAuthorized('teacher'), async (req, res) => {
  try {
    const { field, description } = req.body;

    // Ensure both fields are provided
    if (!field || !description) {
      return res.status(400).json({ error: 'Both field and description are required' });
    }

    const updatedField = await ProfileField.findByIdAndUpdate(
      req.params.id,
      { field, description },
      { new: true }
    );

    if (!updatedField) {
      return res.status(404).json({ error: 'Profile field not found' });
    }

    res.status(200).json({ message: 'Profile field updated successfully', profileField: updatedField });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating profile field' });
  }
});

// Delete a profile field (for teachers)
router.delete('/delete/:id', isAuthenticated, isAuthorized('teacher'), async (req, res) => {
  try {
    const deletedField = await ProfileField.findByIdAndDelete(req.params.id);
    if (!deletedField) {
      return res.status(404).json({ error: 'Profile field not found' });
    }
    res.status(200).json({ message: 'Profile field deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting profile field' });
  }
});

module.exports = router;
