import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AlertContext } from '../../context/AlertContext';
import Alert from '../layout/Alert';
import Spinner from '../layout/Spinner';

const Dataset = () => {
  const [files, setFiles] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [datasetName, setDatasetName] = useState('dataset');
  const [datasetFormat, setDatasetFormat] = useState('json');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [isLoadingDatasets, setIsLoadingDatasets] = useState(true);
  
  const { setAlert } = useContext(AlertContext);
  
  // Fetch uploaded files and datasets on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch uploaded files
        const filesRes = await axios.get('/api/upload');
        setFiles(filesRes.data.data);
        setIsLoadingFiles(false);
        
        // Fetch existing datasets
        const datasetsRes = await axios.get('/api/dataset/list');
        setDatasets(datasetsRes.data.data);
        setIsLoadingDatasets(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setAlert('حدث خطأ أثناء جلب البيانات', 'danger');
        setIsLoadingFiles(false);
        setIsLoadingDatasets(false);
      }
    };
    
    fetchData();
  }, [setAlert]);
  
  // Handle file selection
  const handleFileSelect = (filename) => {
    setSelectedFiles(prev => {
      if (prev.includes(filename)) {
        return prev.filter(file => file !== filename);
      } else {
        return [...prev, filename];
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
  
  // Create dataset
  const createDataset = async () => {
    if (selectedFiles.length === 0) {
      setAlert('يرجى اختيار ملفات لإنشاء مجموعة البيانات', 'warning');
      return;
    }
    
    if (!datasetName.trim()) {
      setAlert('يرجى إدخال اسم لمجموعة البيانات', 'warning');
      return;
    }
    
    setIsCreating(true);
    
    try {
      const res = await axios.post('/api/dataset/create', {
        filenames: selectedFiles,
        format: datasetFormat,
        outputName: datasetName
      });
      
      // Fetch updated datasets list
      const datasetsRes = await axios.get('/api/dataset/list');
      setDatasets(datasetsRes.data.data);
      
      setAlert('تم إنشاء مجموعة البيانات بنجاح', 'success');
      setSelectedFiles([]);
      setDatasetName('dataset');
    } catch (error) {
      console.error('Error creating dataset:', error);
      setAlert('حدث خطأ أثناء إنشاء مجموعة البيانات', 'danger');
    } finally {
      setIsCreating(false);
    }
  };
  
  // Delete dataset
  const deleteDataset = async (name, format) => {
    try {
      await axios.delete(`/api/dataset/${name}?format=${format}`);
      
      // Update datasets list
      setDatasets(prev => prev.filter(dataset => 
        !(dataset.name === name && dataset.format === format)
      ));
      
      setAlert('تم حذف مجموعة البيانات بنجاح', 'success');
    } catch (error) {
      console.error('Error deleting dataset:', error);
      setAlert('حدث خطأ أثناء حذف مجموعة البيانات', 'danger');
    }
  };
  
  // Download dataset
  const downloadDataset = (name, format) => {
    window.open(`/api/dataset/${name}?format=${format}`, '_blank');
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
      <h1 className="mb-3">مجموعات البيانات</h1>
      <Alert />
      
      <div className="grid">
        <div className="col-6">
          <div className="card mb-3">
            <h2 className="mb-2">إنشاء مجموعة بيانات جديدة</h2>
            
            <div className="form-group">
              <label htmlFor="datasetName">اسم مجموعة البيانات</label>
              <input 
                type="text" 
                id="datasetName"
                className="form-control"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="datasetFormat">تنسيق مجموعة البيانات</label>
              <select 
                id="datasetFormat"
                className="form-control"
                value={datasetFormat}
                onChange={(e) => setDatasetFormat(e.target.value)}
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
            </div>
            
            <button 
              className="btn btn-primary btn-block mb-3"
              onClick={createDataset}
              disabled={isCreating || selectedFiles.length === 0}
            >
              {isCreating ? 'جاري الإنشاء...' : 'إنشاء مجموعة البيانات'}
            </button>
            
            <h3 className="mb-2">اختر الملفات المعالجة</h3>
            
            {isLoadingFiles ? (
              <Spinner text="جاري تحميل الملفات..." />
            ) : files.length === 0 ? (
              <p className="text-center p-3">لا توجد ملفات مرفوعة</p>
            ) : (
              <>
                <div className="mb-2">
                  <button 
                    className="btn btn-secondary"
                    onClick={handleSelectAll}
                  >
                    {selectedFiles.length === files.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                  </button>
                  <span className="mr-2">تم تحديد {selectedFiles.length} من {files.length}</span>
                </div>
                
                <ul className="file-list">
                  {files.map((file, index) => (
                    <li 
                      key={index} 
                      className="file-item"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleFileSelect(file.filename)}
                    >
                      <input 
                        type="checkbox"
                        checked={selectedFiles.includes(file.filename)}
                        onChange={() => {}}
                        className="mr-2"
                      />
                      <div className="file-name">{file.filename}</div>
                      <div className="file-size">{formatFileSize(file.size)}</div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
        
        <div className="col-6">
          <div className="card">
            <h2 className="mb-2">مجموعات البيانات المتاحة</h2>
            
            {isLoadingDatasets ? (
              <Spinner text="جاري تحميل مجموعات البيانات..." />
            ) : datasets.length === 0 ? (
              <p className="text-center p-3">لا توجد مجموعات بيانات متاحة</p>
            ) : (
              <ul className="file-list">
                {datasets.map((dataset, index) => (
                  <li key={index} className="file-item">
                    <div className="file-info">
                      <div className="file-name">
                        {dataset.name}.{dataset.format}
                      </div>
                      <div className="file-details">
                        <span className="file-size">{formatFileSize(dataset.size)}</span>
                        <span className="file-date mr-2">{formatDate(dataset.createdAt)}</span>
                      </div>
                    </div>
                    <div className="file-actions">
                      <button 
                        className="btn btn-secondary ml-1"
                        onClick={() => downloadDataset(dataset.name, dataset.format)}
                      >
                        تنزيل
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => deleteDataset(dataset.name, dataset.format)}
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
