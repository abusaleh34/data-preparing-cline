import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { AlertContext } from '../../context/AlertContext';
import Alert from '../layout/Alert';
import Spinner from '../layout/Spinner';
import Progress from '../layout/Progress';
import { API_ENDPOINTS } from '../../config/api';

const Upload = () => {
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const fileInputRef = useRef(null);
  const { setAlert } = useContext(AlertContext);
  
  // Fetch already uploaded files on component mount
  useEffect(() => {
    const fetchUploadedFiles = async () => {
      try {
        const res = await axios.get(API_ENDPOINTS.UPLOAD.LIST);
        setUploadedFiles(res.data.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching files:', error);
        setAlert('حدث خطأ أثناء جلب الملفات المرفوعة', 'danger');
        setIsLoading(false);
      }
    };
    
    fetchUploadedFiles();
  }, [setAlert]);
  
  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    validateAndSetFiles(selectedFiles);
  };
  
  // Validate files (only PDF)
  const validateAndSetFiles = (selectedFiles) => {
    const validFiles = selectedFiles.filter(file => file.type === 'application/pdf');
    
    if (validFiles.length !== selectedFiles.length) {
      setAlert('يرجى اختيار ملفات PDF فقط', 'warning');
    }
    
    if (validFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
    }
  };
  
  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      validateAndSetFiles(droppedFiles);
    }
  };
  
  // Handle file upload
  const handleUpload = async () => {
    if (files.length === 0) {
      setAlert('يرجى اختيار ملفات للرفع', 'warning');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    try {
      const res = await axios.post(API_ENDPOINTS.UPLOAD.UPLOAD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: progressEvent => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });
      
      setUploadedFiles(prevFiles => [...prevFiles, ...res.data.data]);
      setFiles([]);
      setAlert(`تم رفع ${res.data.count} ملفات بنجاح`, 'success');
    } catch (error) {
      console.error('Upload error:', error);
      setAlert('حدث خطأ أثناء رفع الملفات', 'danger');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Handle file deletion
  const handleDelete = async (filename) => {
    try {
      await axios.delete(API_ENDPOINTS.UPLOAD.DELETE(filename));
      
      setUploadedFiles(prevFiles => 
        prevFiles.filter(file => file.filename !== filename)
      );
      
      setAlert('تم حذف الملف بنجاح', 'success');
    } catch (error) {
      console.error('Delete error:', error);
      setAlert('حدث خطأ أثناء حذف الملف', 'danger');
    }
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Clear selected files
  const handleClearSelected = () => {
    setFiles([]);
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="upload-page">
      <h1 className="mb-3">رفع الملفات</h1>
      <Alert />
      
      <div className="card mb-3">
        <h2 className="mb-2">رفع ملفات PDF</h2>
        <div 
          className={`upload-area mb-3 ${isDragging ? 'active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept=".pdf"
            style={{ display: 'none' }}
          />
          <i className="fas fa-cloud-upload-alt" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
          <p>اضغط هنا لاختيار الملفات أو اسحب الملفات وأفلتها هنا</p>
          <p className="text-muted">يمكنك رفع ملفات PDF فقط</p>
        </div>
        
        {files.length > 0 && (
          <div className="selected-files mb-3">
            <div className="flex justify-between align-center mb-2">
              <h3>الملفات المحددة ({files.length})</h3>
              <button 
                className="btn btn-danger"
                onClick={handleClearSelected}
              >
                مسح الكل
              </button>
            </div>
            
            <ul className="file-list card">
              {files.map((file, index) => (
                <li key={index} className="file-item">
                  <div className="file-name">{file.name}</div>
                  <div className="file-size">{formatFileSize(file.size)}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {isUploading && (
          <Progress 
            value={uploadProgress} 
            max={100} 
            label={`جاري الرفع... ${uploadProgress}%`} 
          />
        )}
        
        <button 
          className="btn btn-primary btn-block"
          onClick={handleUpload}
          disabled={isUploading || files.length === 0}
        >
          {isUploading ? 'جاري الرفع...' : 'رفع الملفات'}
        </button>
      </div>
      
      <div className="card">
        <h2 className="mb-2">الملفات المرفوعة</h2>
        
        {isLoading ? (
          <Spinner text="جاري تحميل الملفات..." />
        ) : uploadedFiles.length === 0 ? (
          <p className="text-center p-3">لا توجد ملفات مرفوعة</p>
        ) : (
          <ul className="file-list">
            {uploadedFiles.map((file, index) => (
              <li key={index} className="file-item">
                <div className="file-name">{file.filename}</div>
                <div className="file-size">{formatFileSize(file.size)}</div>
                <div className="file-actions">
                  <button 
                    className="btn btn-danger ml-1"
                    onClick={() => handleDelete(file.filename)}
                  >
                    حذف
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Upload;
