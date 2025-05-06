// controllers/jobController.js

const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication'); // Correct model name
const Feedback = require('../models/Feedback'); // Assuming this exists
const Student = require('../models/Student'); // Needed for applicants details

// Create a Job (Teacher & Superadmin)
exports.createJob = async (req, res) => {
  try {
    const { title, description, requiredFields, salary, deadline } = req.body;

    const job = new Job({
      title,
      description,
      postedBy: req.user.id,
      requiredFields,
      salary,
      deadline,
    });

    await job.save();
    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update Job (Teacher & Superadmin)
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, requiredFields, salary, deadline } = req.body;

    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (String(job.postedBy) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to edit this job' });
    }

    job.title = title || job.title;
    job.description = description || job.description;
    job.requiredFields = requiredFields || job.requiredFields;
    job.salary = salary || job.salary;
    job.deadline = deadline || job.deadline;

    await job.save();
    res.status(200).json({ success: true, message: 'Job updated successfully', job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete Job (Teacher & Superadmin)
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (String(job.postedBy) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();
    res.status(200).json({ success: true, message: 'Job deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get All Jobs (Everyone)
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate('postedBy', 'name email');
    res.status(200).json({ success: true, jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get Applicants for a Job (Teacher & Superadmin)
exports.getApplicantsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);

    if (!job) return res.status(404).json({ message: 'Job not found' });

    const applicants = await JobApplication.find({ jobId })
      .populate('studentId', 'name email'); // Only name and email of student

    res.status(200).json({
      success: true,
      results: applicants.length,
      data: applicants,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error retrieving applicants' });
  }
};

// Add Feedback (Student)
exports.addFeedback = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const feedback = new Feedback({
      name,
      email,
      subject,
      message,
    });

    await feedback.save();
    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error submitting feedback' });
  }
};

// Get All Feedback (Only Superadmin)
exports.getAllFeedback = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view feedback' });
    }

    const feedbacks = await Feedback.find();
    res.status(200).json({
      success: true,
      results: feedbacks.length,
      data: feedbacks,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error retrieving feedback' });
  }
};
