const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.FILE_UPLOAD_PATH || './uploads';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// File filter for PDFs only
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

// Initialize upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE || 10000000 // 10MB default
  }
});

// @route   POST /api/upload
// @desc    Upload PDF files
// @access  Public
router.post('/', upload.array('files', 100), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files were uploaded'
      });
    }

    // Return file information
    const fileInfos = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size
    }));

    res.status(200).json({
      success: true,
      count: fileInfos.length,
      data: fileInfos
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading files',
      error: error.message
    });
  }
});

// @route   GET /api/upload
// @desc    Get all uploaded files
// @access  Public
router.get('/', (req, res) => {
  try {
    const uploadPath = process.env.FILE_UPLOAD_PATH || './uploads';
    
    fs.readdir(uploadPath, (err, files) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error reading upload directory',
          error: err.message
        });
      }

      // Filter only PDF files
      const pdfFiles = files.filter(file => 
        path.extname(file).toLowerCase() === '.pdf' && 
        fs.statSync(path.join(uploadPath, file)).isFile()
      );

      // Get file details
      const fileDetails = pdfFiles.map(file => {
        const filePath = path.join(uploadPath, file);
        const stats = fs.statSync(filePath);
        
        return {
          filename: file,
          path: filePath,
          size: stats.size,
          uploadDate: stats.mtime
        };
      });

      res.status(200).json({
        success: true,
        count: fileDetails.length,
        data: fileDetails
      });
    });
  } catch (error) {
    console.error('Error getting files:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving files',
      error: error.message
    });
  }
});

// @route   DELETE /api/upload/:filename
// @desc    Delete a file
// @access  Public
router.delete('/:filename', (req, res) => {
  try {
    const uploadPath = process.env.FILE_UPLOAD_PATH || './uploads';
    const filePath = path.join(uploadPath, req.params.filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Delete the file
    fs.unlinkSync(filePath);
    
    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: error.message
    });
  }
});

module.exports = router;
