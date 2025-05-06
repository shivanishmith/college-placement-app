const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorHandler = require('../utils/error');

// Middleware to check if the user is authenticated
exports.isAuthenticated = async (req, res, next) => {
  try {
    let token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(" ")[1]);
    
    if (!token) {
      return next(new ErrorHandler('Authentication token not found.', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new ErrorHandler('User not found.', 404));
    }

    req.user = user;  // Attach full user object
    next();
  } catch (err) {
    console.error('Authentication Error: ', err);
    return next(new ErrorHandler('Authentication failed. Invalid or expired token.', 401));
  }
};

// Middleware to check if user has required role
exports.isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorHandler('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ErrorHandler(`Role ${req.user.role} is not allowed to access this resource.`, 403));
    }

    next();
  };
};
