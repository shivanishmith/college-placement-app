// routes/auth.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);  // Register user
router.post("/login", authController.login);        // Login user

module.exports = router;
