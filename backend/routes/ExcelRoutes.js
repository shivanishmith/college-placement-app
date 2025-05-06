// routes/ExcelRoutes.js

const express = require("express");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");
const Student = require("../models/Student");
const { downloadApplicantsExcel } = require("../controllers/excelController");

const router = express.Router();

// Route 1: Download all opted-in students with optional field filtering
router.get("/download-excel", async (req, res) => {
  try {
    if (!['teacher', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only teachers and superadmins can download student data.' });
    }

    const allowedFields = ["name", "email", "phone", "resumeLink", "marks", "skills", "github"];
    const requestedFields = (req.query.fields)?.split(",") || allowedFields;
    const selectedFields = requestedFields.filter(field => allowedFields.includes(field));

    if (selectedFields.length === 0) {
      return res.status(400).json({ message: "Invalid fields requested." });
    }

    const students = await Student.find({ optedIn: true }).select(selectedFields.join(" "));
    if (students.length === 0) {
      return res.status(404).json({ message: "No students available." });
    }

    const worksheet = XLSX.utils.json_to_sheet(students.map(s => s.toObject()));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

    const filePath = path.join(__dirname, "../../public/students.xlsx");
    XLSX.writeFile(workbook, filePath);

    res.json({ downloadUrl: `/public/students.xlsx` });
  } catch (error) {
    console.error("Error generating Excel:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
});

// ✅ Route 2: Download applicants for specific job
router.get("/job/:id/download", downloadApplicantsExcel);

module.exports = router;
