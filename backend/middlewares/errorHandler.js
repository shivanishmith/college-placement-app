module.exports = (err, req, res, next) => {
  console.error(err);

  const message = err.message || 'Internal Server Error';
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err }), // Add error details for development
  });
};
