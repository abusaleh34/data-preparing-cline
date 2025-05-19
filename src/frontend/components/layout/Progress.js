import React from 'react';

const Progress = ({ value, max, label }) => {
  const percentage = Math.round((value / max) * 100);
  
  return (
    <div className="progress-container">
      <div className="progress">
        <div 
          className="progress-bar" 
          style={{ width: `${percentage}%` }}
        >
          {percentage}%
        </div>
      </div>
      {label && <p className="text-center">{label}</p>}
    </div>
  );
};

export default Progress;
