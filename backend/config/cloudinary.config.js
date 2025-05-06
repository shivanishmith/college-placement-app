// cloudinary.config.js (located in the config folder)
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});
// Set up multer for file uploads
const storage = multer.memoryStorage();
const parser = multer({ storage: storage }).single('file');
module.exports = { cloudinary, parser };
