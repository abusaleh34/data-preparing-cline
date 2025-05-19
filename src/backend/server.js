const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Create upload directories if they don't exist
const uploadPath = process.env.FILE_UPLOAD_PATH || './uploads';
const processedPath = path.join(uploadPath, 'processed');
const tempPath = path.join(uploadPath, 'temp');

[uploadPath, processedPath, tempPath].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Import routes
const uploadRoutes = require('./routes/uploadRoutes');
const ocrRoutes = require('./routes/ocrRoutes');
const datasetRoutes = require('./routes/datasetRoutes');

// Initialize express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Set static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Mount routes
app.use('/api/upload', uploadRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/dataset', datasetRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../dist', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
