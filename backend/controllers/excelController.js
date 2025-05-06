const ExcelJS = require("exceljs");
const Job = require("../models/Job");
const Application = require("../models/Application");
const User = require("../models/User");

exports.downloadApplicantsExcel = async (req, res) => {
  const jobId = req.params.id;
  console.log("[FLAG] Entered downloadApplicantsExcel route for job:", jobId);

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      console.log("[FLAG] Job not found:", jobId);
      return res.status(404).json({ error: "Job not found" });
    }

    // Populate student data with proper field names
    const applications = await Application.find({ job: jobId }).populate("student", "name email profile");

    console.log(`[FLAG] Found ${applications.length} applications`);
    console.log("[FLAG] Required Fields:", job.requiredFields);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Applicants");

    // Create basic columns that are always included
    let columns = [
      { header: "Student Name", key: "studentName", width: 25 },
      { header: "Email", key: "email", width: 25 },
    ];
    
    // Add required fields columns
    const requiredFieldColumns = job.requiredFields.map((field) => ({
      header: field,
      key: field,
      width: 25,
    }));
    
    // Set all columns
    sheet.columns = [...columns, ...requiredFieldColumns];

    // Add each student application row
    applications.forEach((app, index) => {
      console.log(`\n[DEBUG] Application ${index + 1}:`);

      const studentName = app.student?.name || "Unknown";
      const studentEmail = app.student?.email || "Unknown";

      // Show student data
      console.log("[DEBUG] Name:", studentName);
      console.log("[DEBUG] Email:", studentEmail);
      console.log("[DEBUG] fieldData:", app.fieldData);

      // Safely get field data
      const fieldData = app.fieldData || {};

      // Create row with basic info
      const row = {
        studentName,
        email: studentEmail,
      };

      // Add required fields from application data or from user profile
      job.requiredFields.forEach((field) => {
        // First try to get from application fieldData
        if (fieldData[field]) {
          row[field] = fieldData[field];
        }
        // If not in fieldData, try to get from user profile
        else if (app.student?.profile && app.student.profile[field]) {
          row[field] = app.student.profile[field];
        }
        // If not found anywhere
        else {
          row[field] = "Not Provided";
        }
      });

      console.log("[DEBUG] Row to insert:", row);
      sheet.addRow(row);
    });

    // Send file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=job_${jobId}_applicants.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
    console.log("[FLAG] Excel file sent successfully");
  } catch (err) {
    console.error("[FLAG] Excel download error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
