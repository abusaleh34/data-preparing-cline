const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In serverless environment, we can't use disk storage
// Use memory storage instead
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Mock data for files since we can't persist to disk in serverless
let mockFiles = [
  {
    filename: 'sample-arabic-1.pdf',
    size: 1024 * 1024 * 2.5, // 2.5MB
    uploadedAt: new Date('2025-05-15T10:30:00')
  },
  {
    filename: 'sample-arabic-2.pdf',
    size: 1024 * 1024 * 1.8, // 1.8MB
    uploadedAt: new Date('2025-05-16T14:20:00')
  }
];

// Routes
app.get('/upload', (req, res) => {
  try {
    // Return mock files instead of reading from disk
    res.json({ success: true, data: mockFiles });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch files' });
  }
});

app.post('/upload', upload.array('files'), (req, res) => {
  try {
    // Create mock file entries instead of saving to disk
    const files = req.files.map(file => {
      const mockFile = {
        filename: Date.now() + '-' + file.originalname,
        size: file.size,
        uploadedAt: new Date()
      };
      
      // Add to our mock files array
      mockFiles.push(mockFile);
      
      return mockFile;
    });

    res.json({ 
      success: true, 
      message: 'Files uploaded successfully', 
      count: files.length,
      data: files 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: 'Failed to upload files' });
  }
});

app.delete('/upload/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    
    // Remove from mock files array instead of deleting from disk
    const initialLength = mockFiles.length;
    mockFiles = mockFiles.filter(file => file.filename !== filename);
    
    if (mockFiles.length < initialLength) {
      res.json({ success: true, message: 'File deleted successfully' });
    } else {
      res.status(404).json({ success: false, error: 'File not found' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete file' });
  }
});

// OCR Routes
app.get('/ocr/status/:filename', (req, res) => {
  // In a real app, this would check the actual status
  // For demo purposes, we'll return a random status
  const statuses = ['pending', 'processing', 'completed'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  
  res.json({ 
    success: true, 
    filename: req.params.filename,
    status: randomStatus
  });
});

app.get('/ocr/result/:filename', (req, res) => {
  // In a real app, this would fetch actual OCR results
  // For demo purposes, we'll return mock data
  res.json({
    success: true,
    filename: req.params.filename,
    data: [
      {
        page: 1,
        text: 'هذا نص عربي تجريبي للصفحة الأولى. يمكن استخدامه لاختبار استخراج النصوص من ملفات PDF.'
      },
      {
        page: 2,
        text: 'هذا نص عربي تجريبي للصفحة الثانية. يحتوي على بعض الكلمات والجمل باللغة العربية.'
      }
    ]
  });
});

app.post('/ocr/process', (req, res) => {
  const { filename } = req.body;
  
  if (!filename) {
    return res.status(400).json({ success: false, error: 'Filename is required' });
  }
  
  // In a real app, this would start the OCR process
  // For demo purposes, we'll return mock data after a delay
  setTimeout(() => {
    res.json({
      success: true,
      message: 'OCR processing completed',
      filename,
      data: [
        {
          page: 1,
          text: 'هذا نص عربي تجريبي للصفحة الأولى. يمكن استخدامه لاختبار استخراج النصوص من ملفات PDF.'
        },
        {
          page: 2,
          text: 'هذا نص عربي تجريبي للصفحة الثانية. يحتوي على بعض الكلمات والجمل باللغة العربية.'
        }
      ]
    });
  }, 2000);
});

// Dataset Routes
app.get('/dataset/list', (req, res) => {
  // In a real app, this would fetch actual datasets
  // For demo purposes, we'll return mock data
  res.json({
    success: true,
    data: [
      {
        name: 'dataset1',
        format: 'json',
        size: 1024,
        createdAt: new Date()
      },
      {
        name: 'dataset2',
        format: 'csv',
        size: 2048,
        createdAt: new Date()
      }
    ]
  });
});

app.post('/dataset/create', (req, res) => {
  const { filenames, format, outputName } = req.body;
  
  if (!filenames || !Array.isArray(filenames) || filenames.length === 0) {
    return res.status(400).json({ success: false, error: 'Filenames are required' });
  }
  
  if (!format) {
    return res.status(400).json({ success: false, error: 'Format is required' });
  }
  
  if (!outputName) {
    return res.status(400).json({ success: false, error: 'Output name is required' });
  }
  
  // In a real app, this would create the actual dataset
  // For demo purposes, we'll return mock data
  res.json({
    success: true,
    message: 'Dataset created successfully',
    data: {
      name: outputName,
      format,
      size: 1024 * filenames.length,
      createdAt: new Date()
    }
  });
});

app.delete('/dataset/:name', (req, res) => {
  const { name } = req.params;
  const { format } = req.query;
  
  if (!name) {
    return res.status(400).json({ success: false, error: 'Dataset name is required' });
  }
  
  if (!format) {
    return res.status(400).json({ success: false, error: 'Format is required' });
  }
  
  // In a real app, this would delete the actual dataset
  // For demo purposes, we'll just return success
  res.json({
    success: true,
    message: 'Dataset deleted successfully'
  });
});

// Export the serverless function
module.exports.handler = serverless(app);
