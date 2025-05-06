const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const userRoutes = require('./routes/UserRoutes');
const jobRoutes = require('./routes/jobs');
const feedbackRoutes = require('./routes/feedbackRoutes');
const profileFieldRoutes = require('./routes/profileFieldRoutes');
const studentRoutes = require('./routes/studentRoutes');
const excelRoutes = require('./routes/ExcelRoutes');
const jobApplyRoutes = require('./routes/jobApply');

// Import middleware
const authMiddleware = require('./middlewares/auth');
const roleAuthorization = require('./middlewares/roleAuthorization');

// Initialize express
const app = express();

// Middleware
app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ["POST", "GET", "PUT", "DELETE"],
  credentials: true,
}));

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/apply', jobApplyRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/profile-fields', profileFieldRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/excel', excelRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ success: false, message });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college-placement-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to database.'))
.catch(err => console.error('Database connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
