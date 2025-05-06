//roleAuthorization.js
const ErrorHandler = require('../utils/error');  // Import your custom error handler (optional)
const isAuthorized = (roles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return next(new ErrorHandler('Authentication required', 401));
    }

    // Check if the user's role matches any of the allowed roles
    if (!roles.includes(req.user.role)) {
      return next(new ErrorHandler('You do not have permission to access this resource', 403));
    }

    // If the role matches, continue to the next middleware or route handler
    next();
  };
};

module.exports = isAuthorized;
