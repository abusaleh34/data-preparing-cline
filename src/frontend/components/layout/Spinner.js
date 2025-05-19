import React from 'react';

const Spinner = ({ text = 'جاري التحميل...' }) => {
  return (
    <div className="text-center p-3">
      <div className="spinner"></div>
      <p className="mt-2">{text}</p>
    </div>
  );
};

export default Spinner;
