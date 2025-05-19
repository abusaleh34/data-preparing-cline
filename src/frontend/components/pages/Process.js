import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AlertContext } from '../../context/AlertContext';
import Alert from '../layout/Alert';
import Spinner from '../layout/Spinner';
import Progress from '../layout/Progress';

const Process = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('preview');
  const [editedText, setEditedText] = useState({});
  
  const { setAlert } = useContext(AlertContext);
  
  // Fetch uploaded files on component mount
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await axios.get('/api/upload');
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
  
  // Check OCR status when a file is selected
  useEffect(() => {
    if (selectedFile) {
      checkOcrStatus(selectedFile.filename);
    }
  }, [selectedFile]);
  
  // Check if a file has been processed with OCR
  const checkOcrStatus = async (filename) => {
    try {
      const res = await axios.get(`/api/ocr/status/${filename}`);
      
      if (res.data.status === 'completed') {
        fetchOcrResult(filename);
      }
    } catch (error) {
      console.error('Error checking OCR status:', error);
    }
  };
  
  // Fetch OCR result for a file
  const fetchOcrResult = async (filename) => {
    try {
      const res = await axios.get(`/api/ocr/result/${filename}`);
      setOcrResult(res.data);
      
      // Initialize edited text with original OCR results
      const initialEditedText = {};
      res.data.data.forEach(page => {
        initialEditedText[page.page] = page.text;
      });
      setEditedText(initialEditedText);
    } catch (error) {
      console.error('Error fetching OCR result:', error);
      setOcrResult(null);
    }
  };
  
  // Handle file selection
  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setOcrResult(null);
    setEditedText({});
    setActiveTab('preview');
  };
  
  // Process a file with OCR
  const processFile = async () => {
    if (!selectedFile) {
      setAlert('يرجى اختيار ملف للمعالجة', 'warning');
      return;
    }
    
    setIsProcessing(true);
    setProcessingProgress(0);
    
    // Simulate progress (in a real app, this would be based on actual progress updates)
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        const newProgress = prev + 5;
        return newProgress >= 95 ? 95 : newProgress;
      });
    }, 500);
    
    try {
      const res = await axios.post('/api/ocr/process', {
        filename: selectedFile.filename
      });
      
      clearInterval(progressInterval);
      setProcessingProgress(100);
      
      setTimeout(() => {
        setOcrResult(res.data);
        
        // Initialize edited text with original OCR results
        const initialEditedText = {};
        res.data.data.forEach(page => {
          initialEditedText[page.page] = page.text;
        });
        setEditedText(initialEditedText);
        
        setActiveTab('result');
        setAlert('تمت معالجة الملف بنجاح', 'success');
        setIsProcessing(false);
      }, 1000);
    } catch (error) {
      clearInterval(progressInterval);
      console.error('OCR processing error:', error);
      setAlert('حدث خطأ أثناء معالجة الملف', 'danger');
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };
  
  // Handle text editing
  const handleTextEdit = (page, text) => {
    setEditedText(prev => ({
      ...prev,
      [page]: text
    }));
  };
  
  // Save edited text
  const saveEditedText = async () => {
    // In a real application, you would send the edited text to the server
    // For now, we'll just show a success message
    setAlert('تم حفظ التعديلات بنجاح', 'success');
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <div className="process-page">
      <h1 className="mb-3">معالجة النصوص</h1>
      <Alert />
      
      <div className="grid">
        <div className="col-4">
          <div className="card">
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
                    className={`file-item ${selectedFile && selectedFile.filename === file.filename ? 'active' : ''}`}
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: selectedFile && selectedFile.filename === file.filename ? '#f0f0f0' : 'transparent'
                    }}
                    onClick={() => handleFileSelect(file)}
                  >
                    <div className="file-name">{file.filename}</div>
                    <div className="file-size">{formatFileSize(file.size)}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <div className="col-8">
          {selectedFile ? (
            <div className="card">
              <div className="flex justify-between align-center mb-3">
                <h2>{selectedFile.filename}</h2>
                
                {!isProcessing && !ocrResult && (
                  <button 
                    className="btn btn-primary"
                    onClick={processFile}
                  >
                    معالجة الملف
                  </button>
                )}
              </div>
              
              {isProcessing && (
                <div className="mb-3">
                  <Progress 
                    value={processingProgress} 
                    max={100} 
                    label={`جاري المعالجة... ${processingProgress}%`} 
                  />
                </div>
              )}
              
              <div className="tabs mb-3">
                <div 
                  className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('preview')}
                >
                  معاينة الملف
                </div>
                
                {ocrResult && (
                  <div 
                    className={`tab ${activeTab === 'result' ? 'active' : ''}`}
                    onClick={() => setActiveTab('result')}
                  >
                    نتائج المعالجة
                  </div>
                )}
                
                {ocrResult && (
                  <div 
                    className={`tab ${activeTab === 'edit' ? 'active' : ''}`}
                    onClick={() => setActiveTab('edit')}
                  >
                    تحرير النص
                  </div>
                )}
              </div>
              
              <div className="tab-content">
                {activeTab === 'preview' && (
                  <div className="preview-tab">
                    <iframe 
                      src={`/uploads/${selectedFile.filename}`}
                      className="pdf-preview"
                      title="PDF Preview"
                    ></iframe>
                  </div>
                )}
                
                {activeTab === 'result' && ocrResult && (
                  <div className="result-tab">
                    <div className="ocr-results">
                      {ocrResult.data.map((page, index) => (
                        <div key={index}>
                          {index > 0 && (
                            <div className="page-separator">
                              <span>صفحة {page.page}</span>
                            </div>
                          )}
                          <div className="page-content">
                            <pre style={{ 
                              fontFamily: 'Cairo, sans-serif',
                              whiteSpace: 'pre-wrap',
                              direction: 'rtl'
                            }}>
                              {page.text}
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {activeTab === 'edit' && ocrResult && (
                  <div className="edit-tab">
                    <div className="mb-3">
                      <p>يمكنك تحرير النص المستخرج لتصحيح أي أخطاء في التعرف الضوئي على الحروف.</p>
                    </div>
                    
                    {ocrResult.data.map((page, index) => (
                      <div key={index} className="mb-3">
                        <h3 className="mb-1">صفحة {page.page}</h3>
                        <textarea
                          className="text-editor"
                          value={editedText[page.page] || ''}
                          onChange={(e) => handleTextEdit(page.page, e.target.value)}
                          dir="rtl"
                        ></textarea>
                      </div>
                    ))}
                    
                    <button 
                      className="btn btn-success"
                      onClick={saveEditedText}
                    >
                      حفظ التعديلات
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card text-center p-5">
              <h3 className="mb-3">يرجى اختيار ملف للمعالجة</h3>
              <p>اختر ملفًا من القائمة على اليمين لبدء عملية المعالجة</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Process;
