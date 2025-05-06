const express = require("express");
const router = express.Router();
const { isAuthenticated, isAuthorized } = require('../middlewares/auth'); // Import isAuthorized from auth.js
const { getStudentProfile, updateStudentProfile, getAllStudents } = require("../controllers/studentController");

// GET all students (for teacher/superadmin)
router.get("/", isAuthenticated, isAuthorized('teacher', 'superadmin'), getAllStudents);

// GET student profile by ID (for teacher/superadmin)
router.get("/:id", isAuthenticated, isAuthorized('teacher', 'superadmin'), getStudentProfile);

// PUT student profile update (for authenticated student)
router.put("/profile", isAuthenticated, updateStudentProfile);

module.exports = router;
