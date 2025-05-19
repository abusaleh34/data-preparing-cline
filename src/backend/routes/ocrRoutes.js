const express = require('express');
const path = require('path');
const fs = require('fs');
const { createWorker } = require('tesseract.js');
const { PDFExtract } = require('pdf.js-extract');
const sharp = require('sharp');

const router = express.Router();
const pdfExtract = new PDFExtract();

// Helper function to extract images from PDF pages
const extractImagesFromPDF = async (pdfPath, outputDir) => {
  return new Promise((resolve, reject) => {
    pdfExtract.extract(pdfPath, {}, async (err, data) => {
      if (err) return reject(err);
      
      try {
        const imagePromises = [];
        
        // Create output directory if it doesn't exist
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Process each page
        for (let i = 0; i < data.pages.length; i++) {
          const pageNum = i + 1;
          const outputPath = path.join(outputDir, `page_${pageNum}.png`);
          
          // We'll use pdf.js-extract to get page data and then sharp to convert to image
          // This is a simplified approach - in a real implementation, you might use
          // a more robust PDF to image conversion library
          
          // For now, we'll simulate this process
          imagePromises.push(
            new Promise(resolve => {
              // In a real implementation, this would convert PDF page to image
              // For now, we'll just create a placeholder
              fs.writeFileSync(outputPath, 'PDF page image placeholder');
              resolve(outputPath);
            })
          );
        }
        
        const imagePaths = await Promise.all(imagePromises);
        resolve(imagePaths);
      } catch (error) {
        reject(error);
      }
    });
  });
};

// Helper function to perform OCR on an image
const performOCR = async (imagePath, language = 'ara') => {
  const worker = await createWorker(language);
  
  try {
    const { data } = await worker.recognize(imagePath);
    await worker.terminate();
    return data.text;
  } catch (error) {
    await worker.terminate();
    throw error;
  }
};

// Helper function to clean and normalize Arabic text
const cleanArabicText = (text) => {
  if (!text) return '';
  
  // Remove non-Arabic characters except for punctuation and numbers
  let cleaned = text.replace(/[^\u0600-\u06FF\s\d.,!?;:'"()-]/g, '');
  
  // Normalize Arabic characters
  cleaned = cleaned.replace(/[يى]/g, 'ي')  // Normalize Yaa
                  .replace(/[ةه]/g, 'ه')   // Normalize Taa Marbouta and Haa
                  .replace(/[أإآا]/g, 'ا')  // Normalize Alef
                  
  // Remove extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
};

// @route   POST /api/ocr/process
// @desc    Process a PDF file with OCR
// @access  Public
router.post('/process', async (req, res) => {
  try {
    const { filename } = req.body;
    
    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Filename is required'
      });
    }
    
    const uploadPath = process.env.FILE_UPLOAD_PATH || './uploads';
    const pdfPath = path.join(uploadPath, filename);
    const tempDir = path.join(uploadPath, 'temp', path.parse(filename).name);
    const outputDir = path.join(uploadPath, 'processed', path.parse(filename).name);
    
    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Extract images from PDF
    const imagePaths = await extractImagesFromPDF(pdfPath, tempDir);
    
    // Process each image with OCR
    const ocrResults = [];
    
    for (const imagePath of imagePaths) {
      const pageNum = path.parse(imagePath).name.split('_')[1];
      
      // Perform OCR
      const rawText = await performOCR(imagePath);
      
      // Clean and normalize text
      const cleanedText = cleanArabicText(rawText);
      
      // Save processed text
      const outputTextPath = path.join(outputDir, `page_${pageNum}.txt`);
      fs.writeFileSync(outputTextPath, cleanedText);
      
      ocrResults.push({
        page: parseInt(pageNum),
        text: cleanedText,
        path: outputTextPath
      });
    }
    
    // Save combined results
    const combinedText = ocrResults.map(result => result.text).join('\n\n');
    const combinedPath = path.join(outputDir, 'combined.txt');
    fs.writeFileSync(combinedPath, combinedText);
    
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    
    res.status(200).json({
      success: true,
      filename,
      pages: ocrResults.length,
      outputDir,
      combinedPath,
      data: ocrResults
    });
  } catch (error) {
    console.error('OCR processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing file with OCR',
      error: error.message
    });
  }
});

// @route   GET /api/ocr/status/:filename
// @desc    Get OCR processing status for a file
// @access  Public
router.get('/status/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const uploadPath = process.env.FILE_UPLOAD_PATH || './uploads';
    const processedDir = path.join(uploadPath, 'processed', path.parse(filename).name);
    
    // Check if processed directory exists
    if (!fs.existsSync(processedDir)) {
      return res.status(200).json({
        success: true,
        filename,
        status: 'not_processed',
        message: 'File has not been processed yet'
      });
    }
    
    // Check for combined.txt to verify processing is complete
    const combinedPath = path.join(processedDir, 'combined.txt');
    if (!fs.existsSync(combinedPath)) {
      return res.status(200).json({
        success: true,
        filename,
        status: 'processing',
        message: 'File is still being processed'
      });
    }
    
    // Get list of processed pages
    const files = fs.readdirSync(processedDir);
    const pageFiles = files.filter(file => file.startsWith('page_') && file.endsWith('.txt'));
    
    res.status(200).json({
      success: true,
      filename,
      status: 'completed',
      pages: pageFiles.length,
      outputDir: processedDir,
      combinedPath
    });
  } catch (error) {
    console.error('Error checking OCR status:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking OCR status',
      error: error.message
    });
  }
});

// @route   GET /api/ocr/result/:filename
// @desc    Get OCR results for a processed file
// @access  Public
router.get('/result/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const uploadPath = process.env.FILE_UPLOAD_PATH || './uploads';
    const processedDir = path.join(uploadPath, 'processed', path.parse(filename).name);
    const combinedPath = path.join(processedDir, 'combined.txt');
    
    // Check if processed directory exists
    if (!fs.existsSync(processedDir)) {
      return res.status(404).json({
        success: false,
        message: 'File has not been processed yet'
      });
    }
    
    // Check for combined.txt
    if (!fs.existsSync(combinedPath)) {
      return res.status(404).json({
        success: false,
        message: 'Processing not complete or failed'
      });
    }
    
    // Read combined text
    const combinedText = fs.readFileSync(combinedPath, 'utf8');
    
    // Get individual page results
    const files = fs.readdirSync(processedDir);
    const pageFiles = files.filter(file => file.startsWith('page_') && file.endsWith('.txt'))
                          .sort((a, b) => {
                            const pageA = parseInt(a.split('_')[1]);
                            const pageB = parseInt(b.split('_')[1]);
                            return pageA - pageB;
                          });
    
    const pages = pageFiles.map(file => {
      const pageNum = parseInt(file.split('_')[1]);
      const pagePath = path.join(processedDir, file);
      const text = fs.readFileSync(pagePath, 'utf8');
      
      return {
        page: pageNum,
        text,
        path: pagePath
      };
    });
    
    res.status(200).json({
      success: true,
      filename,
      pages: pages.length,
      combinedText,
      data: pages
    });
  } catch (error) {
    console.error('Error retrieving OCR results:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving OCR results',
      error: error.message
    });
  }
});

module.exports = router;
