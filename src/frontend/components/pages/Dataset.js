import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AlertContext } from '../../context/AlertContext';
import Alert from '../layout/Alert';
import Spinner from '../layout/Spinner';
import { API_ENDPOINTS } from '../../config/api';

const Dataset = () => {
  const [files, setFiles] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [outputFormat, setOutputFormat] = useState('json');
  const [outputName, setOutputName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  const { setAlert } = useContext(AlertContext);
  
  // Fetch processed files and existing datasets on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch processed files
        const filesRes = await axios.get(API_ENDPOINTS.UPLOAD.LIST);
        setFiles(filesRes.data.data);
        
        // Fetch existing datasets
        const datasetsRes = await axios.get(API_ENDPOINTS.DATASET.LIST);
        setDatasets(datasetsRes.data.data);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setAlert('حدث خطأ أثناء جلب البيانات', 'danger');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [setAlert]);
  
  // Handle file selection
  const handleFileSelect = (filename) => {
    setSelectedFiles(prevSelected => {
      if (prevSelected.includes(filename)) {
        return prevSelected.filter(file => file !== filename);
      } else {
        return [...prevSelected, filename];
      }
    });
  };
  
  // Handle select all files
  const handleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map(file => file.filename));
    }
  };
  
  // Handle output format change
  const handleFormatChange = (e) => {
    setOutputFormat(e.target.value);
  };
  
  // Handle output name change
  const handleNameChange = (e) => {
    setOutputName(e.target.value);
  };
  
  // Create dataset
  const handleCreateDataset = async () => {
    if (selectedFiles.length === 0) {
      setAlert('يرجى اختيار ملفات للتضمين في مجموعة البيانات', 'warning');
      return;
    }
    
    if (!outputName.trim()) {
      setAlert('يرجى إدخال اسم لمجموعة البيانات', 'warning');
      return;
    }
    
    setIsCreating(true);
    
    try {
      const res = await axios.post(API_ENDPOINTS.DATASET.CREATE, {
        filenames: selectedFiles,
        format: outputFormat,
        outputName: outputName.trim()
      });
      
      setDatasets(prevDatasets => [...prevDatasets, res.data.data]);
      setSelectedFiles([]);
      setOutputName('');
      
      setAlert('تم إنشاء مجموعة البيانات بنجاح', 'success');
    } catch (error) {
      console.error('Error creating dataset:', error);
      setAlert('حدث خطأ أثناء إنشاء مجموعة البيانات', 'danger');
    } finally {
      setIsCreating(false);
    }
  };
  
  // Delete dataset
  const handleDeleteDataset = async (name, format) => {
    try {
      await axios.delete(API_ENDPOINTS.DATASET.DELETE(name), {
        params: { format }
      });
      
      setDatasets(prevDatasets => 
        prevDatasets.filter(dataset => !(dataset.name === name && dataset.format === format))
      );
      
      setAlert('تم حذف مجموعة البيانات بنجاح', 'success');
    } catch (error) {
      console.error('Error deleting dataset:', error);
      setAlert('حدث خطأ أثناء حذف مجموعة البيانات', 'danger');
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
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="dataset-page">
      <h1 className="mb-3">إنشاء مجموعات البيانات</h1>
      <Alert />
      
      <div className="row">
        <div className="col-md-6">
          <div className="card mb-3">
            <h2 className="mb-2">الملفات المعالجة</h2>
            
            {isLoading ? (
              <Spinner text="جاري تحميل الملفات..." />
            ) : files.length === 0 ? (
              <p className="text-center p-3">لا توجد ملفات معالجة</p>
            ) : (
              <>
                <div className="mb-2">
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={handleSelectAll}
                  >
                    {selectedFiles.length === files.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                  </button>
                  <span className="ml-2">
                    تم تحديد {selectedFiles.length} من {files.length}
                  </span>
                </div>
                
                <ul className="file-list">
                  {files.map((file, index) => (
                    <li 
                      key={index} 
                      className="file-item"
                    >
                      <div className="file-checkbox">
                        <input 
                          type="checkbox"
                          id={`file-${index}`}
                          checked={selectedFiles.includes(file.filename)}
                          onChange={() => handleFileSelect(file.filename)}
                        />
                        <label htmlFor={`file-${index}`}></label>
                      </div>
                      <div className="file-name">{file.filename}</div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          
          <div className="card">
            <h2 className="mb-2">إنشاء مجموعة بيانات جديدة</h2>
            
            <div className="form-group mb-3">
              <label htmlFor="outputName">اسم مجموعة البيانات:</label>
              <input 
                type="text"
                id="outputName"
                className="form-control"
                value={outputName}
                onChange={handleNameChange}
                placeholder="أدخل اسمًا لمجموعة البيانات"
              />
            </div>
            
            <div className="form-group mb-3">
              <label htmlFor="outputFormat">صيغة الإخراج:</label>
              <select 
                id="outputFormat"
                className="form-control"
                value={outputFormat}
                onChange={handleFormatChange}
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
            </div>
            
            <button 
              className="btn btn-primary btn-block"
              onClick={handleCreateDataset}
              disabled={isCreating || selectedFiles.length === 0 || !outputName.trim()}
            >
              {isCreating ? 'جاري الإنشاء...' : 'إنشاء مجموعة البيانات'}
            </button>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <h2 className="mb-2">مجموعات البيانات المتاحة</h2>
            
            {isLoading ? (
              <Spinner text="جاري تحميل مجموعات البيانات..." />
            ) : datasets.length === 0 ? (
              <p className="text-center p-3">لا توجد مجموعات بيانات</p>
            ) : (
              <ul className="dataset-list">
                {datasets.map((dataset, index) => (
                  <li key={index} className="dataset-item">
                    <div className="dataset-info">
                      <h3 className="dataset-name">{dataset.name}</h3>
                      <div className="dataset-meta">
                        <span className="dataset-format">{dataset.format.toUpperCase()}</span>
                        <span className="dataset-size">{formatFileSize(dataset.size)}</span>
                        <span className="dataset-date">{formatDate(dataset.createdAt)}</span>
                      </div>
                    </div>
                    <div className="dataset-actions">
                      <a 
                        href={`/api/dataset/download/${dataset.name}?format=${dataset.format}`}
                        className="btn btn-sm btn-primary ml-1"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        تنزيل
                      </a>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteDataset(dataset.name, dataset.format)}
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
      </div>
    </div>
  );
};

export default Dataset;
