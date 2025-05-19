import React, { useContext } from 'react';
import { AlertContext } from '../../context/AlertContext';

const Alert = () => {
  const { alerts, removeAlert } = useContext(AlertContext);

  return (
    <div className="alert-container">
      {alerts.length > 0 &&
        alerts.map(alert => (
          <div key={alert.id} className={`alert alert-${alert.type}`}>
            <span>{alert.msg}</span>
            <button 
              className="close-btn" 
              onClick={() => removeAlert(alert.id)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                float: 'left',
                fontSize: '16px'
              }}
            >
              &times;
            </button>
          </div>
        ))}
    </div>
  );
};

export default Alert;
