import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AlertContext } from '../../context/AlertContext';
import Alert from '../layout/Alert';
import Spinner from '../layout/Spinner';
import Progress from '../layout/Progress';
import { API_ENDPOINTS } from '../../config/api';

const Process = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [ocrResults, setOcrResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editableText, setEditableText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const { setAlert } = useContext(AlertContext);
  
  // Fetch uploaded files on component mount
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await axios.get(API_ENDPOINTS.UPLOAD.LIST);
        setFiles(res.data.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching files:', error);
        setAlert('حدث خطأ أثناء جلب الملفات', 'danger');
        setIsLoading(false);
      }
    };
    
    fetchFiles();
  }, [setAlert]);
  
  // Handle file selection
  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setOcrResults(null);
    setCurrentPage(1);
    setEditableText('');
    setIsEditing(false);
    
    try {
      // Check if file has already been processed
      const statusRes = await axios.get(API_ENDPOINTS.OCR.STATUS(file.filename));
      
      if (statusRes.data.status === 'completed') {
        const resultRes = await axios.get(API_ENDPOINTS.OCR.RESULT(file.filename));
        setOcrResults(resultRes.data.data);
        
        if (resultRes.data.data.length > 0) {
          setEditableText(resultRes.data.data[0].text);
        }
      }
    } catch (error) {
      console.error('Error checking OCR status:', error);
      // If error, we'll just proceed with processing
    }
  };
  
  // Process file with OCR
  const handleProcess = async () => {
    if (!selectedFile) {
      setAlert('يرجى اختيار ملف للمعالجة', 'warning');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const res = await axios.post(API_ENDPOINTS.OCR.PROCESS, {
        filename: selectedFile.filename
      });
      
      setOcrResults(res.data.data);
      
      if (res.data.data.length > 0) {
        setEditableText(res.data.data[0].text);
      }
      
      setAlert('تمت معالجة الملف بنجاح', 'success');
    } catch (error) {
      console.error('Processing error:', error);
      setAlert('حدث خطأ أثناء معالجة الملف', 'danger');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle page navigation
  const handlePageChange = (page) => {
    if (!ocrResults || page < 1 || page > ocrResults.length) return;
    
    // Save any edits to the current page before switching
    if (isEditing && currentPage !== page) {
      saveEdits();
    }
    
    setCurrentPage(page);
    setEditableText(ocrResults[page - 1].text);
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      saveEdits();
    }
    
    setIsEditing(!isEditing);
  };
  
  // Save edits to the current page
  const saveEdits = () => {
    if (!ocrResults) return;
    
    const updatedResults = [...ocrResults];
    updatedResults[currentPage - 1] = {
      ...updatedResults[currentPage - 1],
      text: editableText
    };
    
    setOcrResults(updatedResults);
    setAlert('تم حفظ التعديلات', 'success');
  };
  
  // Handle text changes in edit mode
  const handleTextChange = (e) => {
    setEditableText(e.target.value);
  };
  
  return (
    <div className="process-page">
      <h1 className="mb-3">معالجة النصوص</h1>
      <Alert />
      
      <div className="row">
        <div className="col-md-4">
          <div className="card mb-3">
            <h2 className="mb-2">الملفات المرفوعة</h2>
            
            {isLoading ? (
              <Spinner text="جاري تحميل الملفات..." />
            ) : files.length === 0 ? (
              <p className="text-center p-3">لا توجد ملفات مرفوعة</p>
            ) : (
              <ul className="file-list">
                {files.map((file, index) => (
                  <li 
                    key={index} 
                    className={`file-item clickable ${selectedFile && selectedFile.filename === file.filename ? 'active' : ''}`}
                    onClick={() => handleFileSelect(file)}
                  >
                    <div className="file-name">{file.filename}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {selectedFile && (
            <div className="card">
              <h3 className="mb-2">معالجة الملف</h3>
              <p>الملف المحدد: <strong>{selectedFile.filename}</strong></p>
              
              <button 
                className="btn btn-primary btn-block"
                onClick={handleProcess}
                disabled={isProcessing}
              >
                {isProcessing ? 'جاري المعالجة...' : 'معالجة الملف'}
              </button>
              
              {isProcessing && (
                <Progress 
                  value={50} 
                  max={100} 
                  label="جاري المعالجة..." 
                  indeterminate={true}
                />
              )}
            </div>
          )}
        </div>
        
        <div className="col-md-8">
          <div className="card">
            <h2 className="mb-2">نتائج المعالجة</h2>
            
            {!selectedFile ? (
              <p className="text-center p-3">يرجى اختيار ملف للمعالجة</p>
            ) : isProcessing ? (
              <Spinner text="جاري معالجة الملف..." />
            ) : !ocrResults ? (
              <p className="text-center p-3">لم تتم معالجة الملف بعد</p>
            ) : (
              <div className="ocr-results">
                <div className="ocr-controls mb-3">
                  <div className="pagination">
                    <button 
                      className="btn btn-sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      السابق
                    </button>
                    <span className="mx-2">
                      صفحة {currentPage} من {ocrResults.length}
                    </span>
                    <button 
                      className="btn btn-sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= ocrResults.length}
                    >
                      التالي
                    </button>
                  </div>
                  
                  <button 
                    className={`btn btn-sm ${isEditing ? 'btn-success' : 'btn-primary'}`}
                    onClick={toggleEditMode}
                  >
                    {isEditing ? 'حفظ التعديلات' : 'تعديل النص'}
                  </button>
                </div>
                
                <div className="ocr-text-container">
                  {isEditing ? (
                    <textarea 
                      className="ocr-text-editor"
                      value={editableText}
                      onChange={handleTextChange}
                      dir="rtl"
                      rows={15}
                    />
                  ) : (
                    <div className="ocr-text" dir="rtl">
                      {editableText}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Process;
