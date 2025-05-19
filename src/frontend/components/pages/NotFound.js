import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="not-found-page text-center">
      <div className="card p-5">
        <h1 className="mb-3">404</h1>
        <h2 className="mb-3">الصفحة غير موجودة</h2>
        <p className="mb-3">عذراً، الصفحة التي تبحث عنها غير موجودة.</p>
        <Link to="/" className="btn btn-primary">
          العودة إلى الصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
