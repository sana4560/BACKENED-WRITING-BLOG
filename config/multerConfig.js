// multerConfig.js

const multer = require('multer');
const path = require('path');


// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // Directory to save uploaded images
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`); // Ensure unique filenames
  }
});

// Multer upload configuration (no file type restriction)
const uploadimage = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Optional file size limit (5MB)
});

module.exports = uploadimage; 