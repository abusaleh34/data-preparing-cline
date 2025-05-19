import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  
  // Check if the current path matches the link
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">معالج البيانات العربية</Link>
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              الرئيسية
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/upload" 
              className={`nav-link ${isActive('/upload') ? 'active' : ''}`}
            >
              رفع الملفات
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/process" 
              className={`nav-link ${isActive('/process') ? 'active' : ''}`}
            >
              معالجة النصوص
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/dataset" 
              className={`nav-link ${isActive('/dataset') ? 'active' : ''}`}
            >
              مجموعات البيانات
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
