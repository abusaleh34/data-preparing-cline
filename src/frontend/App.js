import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './components/pages/Home';
import Upload from './components/pages/Upload';
import Process from './components/pages/Process';
import Dataset from './components/pages/Dataset';
import NotFound from './components/pages/NotFound';
import { AlertProvider } from './context/AlertContext';

const App = () => {
  return (
    <AlertProvider>
      <div className="app">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/process" element={<Process />} />
            <Route path="/dataset" element={<Dataset />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </AlertProvider>
  );
};

export default App;
