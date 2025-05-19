import React, { createContext, useReducer } from 'react';

// Create context
export const AlertContext = createContext();

// Initial state
const initialState = {
  alerts: []
};

// Generate unique ID for alerts
const generateId = () => {
  return Math.floor(Math.random() * 1000000);
};

// Reducer
const alertReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ALERT':
      return {
        ...state,
        alerts: [...state.alerts, { id: generateId(), ...action.payload }]
      };
    case 'REMOVE_ALERT':
      return {
        ...state,
        alerts: state.alerts.filter(alert => alert.id !== action.payload)
      };
    default:
      return state;
  }
};

// Provider component
export const AlertProvider = ({ children }) => {
  const [state, dispatch] = useReducer(alertReducer, initialState);

  // Set alert
  const setAlert = (msg, type, timeout = 5000) => {
    const id = generateId();
    
    dispatch({
      type: 'SET_ALERT',
      payload: { msg, type, id }
    });

    setTimeout(() => {
      dispatch({
        type: 'REMOVE_ALERT',
        payload: id
      });
    }, timeout);
    
    return id;
  };

  // Remove alert
  const removeAlert = (id) => {
    dispatch({
      type: 'REMOVE_ALERT',
      payload: id
    });
  };

  return (
    <AlertContext.Provider
      value={{
        alerts: state.alerts,
        setAlert,
        removeAlert
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};
