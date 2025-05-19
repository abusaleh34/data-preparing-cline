const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Helper function to convert text data to CSV format
const convertToCSV = (data) => {
  const header = 'page,text\n';
  const rows = data.map(item => `${item.page},"${item.text.replace(/"/g, '""')}"`).join('\n');
  return header + rows;
};

// Helper function to convert text data to JSON format
const convertToJSON = (data) => {
  return JSON.stringify(data, null, 2);
};

// @route   POST /api/dataset/create
// @desc    Create a structured dataset from processed files
// @access  Public
router.post('/create', async (req, res) => {
  try {
    const { filenames, format = 'json', outputName = 'dataset' } = req.body;
    
    if (!filenames || !Array.isArray(filenames) || filenames.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one filename is required'
      });
    }
    
    const uploadPath = process.env.FILE_UPLOAD_PATH || './uploads';
    const datasetDir = path.join(uploadPath, 'datasets');
    
    // Create dataset directory if it doesn't exist
    if (!fs.existsSync(datasetDir)) {
      fs.mkdirSync(datasetDir, { recursive: true });
    }
    
    // Collect data from all processed files
    const allData = [];
    
    for (const filename of filenames) {
      const processedDir = path.join(uploadPath, 'processed', path.parse(filename).name);
      const combinedPath = path.join(processedDir, 'combined.txt');
      
      // Check if file has been processed
      if (!fs.existsSync(processedDir) || !fs.existsSync(combinedPath)) {
        continue; // Skip unprocessed files
      }
      
      // Get individual page results
      const files = fs.readdirSync(processedDir);
      const pageFiles = files.filter(file => file.startsWith('page_') && file.endsWith('.txt'))
                            .sort((a, b) => {
                              const pageA = parseInt(a.split('_')[1]);
                              const pageB = parseInt(b.split('_')[1]);
                              return pageA - pageB;
                            });
      
      // Read page data
      for (const file of pageFiles) {
        const pageNum = parseInt(file.split('_')[1]);
        const pagePath = path.join(processedDir, file);
        const text = fs.readFileSync(pagePath, 'utf8');
        
        allData.push({
          filename,
          page: pageNum,
          text
        });
      }
    }
    
    if (allData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No processed data found for the specified files'
      });
    }
    
    // Create dataset file based on format
    let outputPath;
    let outputContent;
    
    if (format.toLowerCase() === 'csv') {
      outputPath = path.join(datasetDir, `${outputName}.csv`);
      outputContent = convertToCSV(allData);
    } else {
      outputPath = path.join(datasetDir, `${outputName}.json`);
      outputContent = convertToJSON(allData);
    }
    
    // Write dataset file
    fs.writeFileSync(outputPath, outputContent);
    
    res.status(200).json({
      success: true,
      format: format.toLowerCase(),
      outputPath,
      count: allData.length,
      message: `Dataset created successfully with ${allData.length} entries`
    });
  } catch (error) {
    console.error('Error creating dataset:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating dataset',
      error: error.message
    });
  }
});

// @route   GET /api/dataset/list
// @desc    List all available datasets
// @access  Public
router.get('/list', (req, res) => {
  try {
    const uploadPath = process.env.FILE_UPLOAD_PATH || './uploads';
    const datasetDir = path.join(uploadPath, 'datasets');
    
    // Check if dataset directory exists
    if (!fs.existsSync(datasetDir)) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }
    
    // Get list of dataset files
    const files = fs.readdirSync(datasetDir);
    const datasets = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ext === '.json' || ext === '.csv';
    }).map(file => {
      const filePath = path.join(datasetDir, file);
      const stats = fs.statSync(filePath);
      
      return {
        name: path.parse(file).name,
        format: path.extname(file).substring(1),
        path: filePath,
        size: stats.size,
        createdAt: stats.birthtime
      };
    });
    
    res.status(200).json({
      success: true,
      count: datasets.length,
      data: datasets
    });
  } catch (error) {
    console.error('Error listing datasets:', error);
    res.status(500).json({
      success: false,
      message: 'Error listing datasets',
      error: error.message
    });
  }
});

// @route   GET /api/dataset/:name
// @desc    Download a specific dataset
// @access  Public
router.get('/:name', (req, res) => {
  try {
    const { name } = req.params;
    const { format = 'json' } = req.query;
    
    const uploadPath = process.env.FILE_UPLOAD_PATH || './uploads';
    const datasetDir = path.join(uploadPath, 'datasets');
    const filePath = path.join(datasetDir, `${name}.${format.toLowerCase()}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found'
      });
    }
    
    // Set appropriate content type
    const contentType = format.toLowerCase() === 'csv' 
      ? 'text/csv' 
      : 'application/json';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${name}.${format.toLowerCase()}`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading dataset:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading dataset',
      error: error.message
    });
  }
});

// @route   DELETE /api/dataset/:name
// @desc    Delete a specific dataset
// @access  Public
router.delete('/:name', (req, res) => {
  try {
    const { name } = req.params;
    const { format = 'json' } = req.query;
    
    const uploadPath = process.env.FILE_UPLOAD_PATH || './uploads';
    const datasetDir = path.join(uploadPath, 'datasets');
    const filePath = path.join(datasetDir, `${name}.${format.toLowerCase()}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found'
      });
    }
    
    // Delete the file
    fs.unlinkSync(filePath);
    
    res.status(200).json({
      success: true,
      message: 'Dataset deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting dataset:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting dataset',
      error: error.message
    });
  }
});

module.exports = router;
