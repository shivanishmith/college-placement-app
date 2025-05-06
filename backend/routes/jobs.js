const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { isAuthenticated } = require('../middlewares/auth');

// Middleware to check if user is teacher or superadmin
const isTeacherOrSuperadmin = (req, res, next) => {
  if (!['teacher', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Only teachers and superadmins are allowed' });
  }
  next();
};

// Get all jobs
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ error: "Error fetching jobs" });
  }
});

// Create a new job
router.post("/", isAuthenticated, isTeacherOrSuperadmin, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      requiredFields, 
      salary, 
      deadline,
      minCGPA,
      eligibleDepartments 
    } = req.body;

    if (!title || !description || !requiredFields || !salary || !deadline) {
      return res.status(400).json({ error: 'Please fill all required fields' });
    }

    const newJob = new Job({
      title,
      description,
      requiredFields,
      salary,
      deadline,
      postedBy: req.user._id,
      minCGPA: minCGPA || 0,
      eligibleDepartments: eligibleDepartments || ['ALL']
    });

    await newJob.save();
    res.status(201).json({ message: 'Job created successfully', job: newJob });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating job' });
  }
});

// Update an existing job
router.put("/:id", isAuthenticated, isTeacherOrSuperadmin, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      requiredFields, 
      salary, 
      deadline,
      minCGPA,
      eligibleDepartments 
    } = req.body;

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (req.user.role === 'teacher' && job.postedBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "You are not authorized to update this job" });
    }

    if (title) job.title = title;
    if (description) job.description = description;
    if (requiredFields) job.requiredFields = requiredFields;
    if (salary) job.salary = salary;
    if (deadline) job.deadline = deadline;
    if (minCGPA !== undefined) job.minCGPA = minCGPA;
    if (eligibleDepartments) job.eligibleDepartments = eligibleDepartments;

    await job.save();
    res.status(200).json({ message: 'Job updated successfully', job });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating job' });
  }
});

// Delete a job
router.delete("/:id", isAuthenticated, isTeacherOrSuperadmin, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (req.user.role === 'teacher' && job.postedBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "You are not authorized to delete this job" });
    }

    await job.deleteOne();
    res.status(200).json({ message: 'Job deleted successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting job' });
  }
});

module.exports = router;
