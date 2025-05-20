// API configuration for both development and production environments

const isDevelopment = process.env.NODE_ENV === 'development';

// Base URL for API requests
const API_BASE_URL = isDevelopment
  ? 'http://localhost:3000/api'
  : '/api';

// API endpoints
const API_ENDPOINTS = {
  // Upload endpoints
  UPLOAD: {
    LIST: `${API_BASE_URL}/upload`,
    UPLOAD: `${API_BASE_URL}/upload`,
    DELETE: (filename) => `${API_BASE_URL}/upload/${filename}`,
  },
  
  // OCR endpoints
  OCR: {
    PROCESS: `${API_BASE_URL}/ocr/process`,
    STATUS: (filename) => `${API_BASE_URL}/ocr/status/${filename}`,
    RESULT: (filename) => `${API_BASE_URL}/ocr/result/${filename}`,
  },
  
  // Dataset endpoints
  DATASET: {
    LIST: `${API_BASE_URL}/dataset/list`,
    CREATE: `${API_BASE_URL}/dataset/create`,
    DELETE: (name) => `${API_BASE_URL}/dataset/${name}`,
  },
};

export { API_BASE_URL, API_ENDPOINTS };
