const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  requiredFields: [{ type: String, required: true }],
  salary: { type: String, required: true },
  deadline: { type: Date, required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Add CGPA and department criteria
  minCGPA: { type: Number, min: 0, max: 10, default: 0 },
  eligibleDepartments: [{ 
    type: String, 
    enum: ['CSE', 'ECE', 'EEE', 'MECH', 'IT', 'MME', 'CIVIL', 'ALL']
  }],
  
  applicants: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    }
  ],
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
