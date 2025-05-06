const express = require("express");
const Job = require("../models/Job");
const Application = require("../models/Application");
const { isAuthenticated } = require("../middlewares/auth");
const User = require("../models/User");

const router = express.Router();

// Apply for a job (for students)
router.post("/:id/apply", isAuthenticated, async (req, res) => {
  try {
    const jobId = req.params.id;

    // Find the job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    
    // Find the user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Check if user is a student
    if (user.role !== 'student') {
      return res.status(403).json({ error: "Only students can apply for jobs" });
    }
    
    // CGPA CHECK - this must be satisfied first
    if (job.minCGPA && (user.cgpa === undefined || user.cgpa < job.minCGPA)) {
      return res.status(403).json({ 
        error: `Your CGPA (${user.cgpa || 'Not provided'}) does not meet the minimum requirement (${job.minCGPA})` 
      });
    }
    
    // DEPARTMENT CHECK - this must be satisfied next
    if (job.eligibleDepartments && job.eligibleDepartments.length > 0) {
      // If 'ALL' is in the eligibleDepartments array, any department is eligible
      if (!job.eligibleDepartments.includes('ALL') && 
          !job.eligibleDepartments.includes(user.department)) {
        return res.status(403).json({ 
          error: `Your department (${user.department || 'Not provided'}) is not eligible for this job` 
        });
      }
    }
    
    // At this point, the student is eligible based on CGPA and department
    
    // Check if the user has already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      student: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({ error: "You have already applied for this job" });
    }
    
    // REQUIRED FIELDS CHECK
    const fieldData = {};
    const missingFields = [];
    
    // If job has required fields, check if they exist in user profile
    if (job.requiredFields && job.requiredFields.length > 0) {
      for (const field of job.requiredFields) {
        // Check if the field is provided in request body
        if (req.body[field]) {
          fieldData[field] = req.body[field];
        }
        // Otherwise check if it exists in user profile
        else if (user.profile && user.profile.get && user.profile.get(field)) {
          fieldData[field] = user.profile.get(field);
        }
        // Or if profile is a regular object (not a Map)
        else if (user.profile && user.profile[field]) {
          fieldData[field] = user.profile[field];
        }
        // If not found anywhere, add to missing fields
        else {
          missingFields.push(field);
        }
      }
      
      // If any required fields are missing, return error
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          error: `Your profile is missing the following required fields: ${missingFields.join(', ')}. Please update your profile.` 
        });
      }
    }
    
    // If all eligibility criteria are met and required fields are present, proceed with the application
    const application = new Application({
      job: jobId,
      student: req.user._id,
      status: "pending",
      appliedAt: new Date(),
      fieldData: fieldData
    });

    // Save the application
    await application.save();
    
    // Add this application to the job's applicants list
    job.applicants.push({ student: req.user._id });
    await job.save();
    
    res.status(201).json({ 
      message: "Applied successfully! You meet all eligibility criteria.", 
      application 
    });
  } catch (err) {
    console.error("Error applying for job:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
