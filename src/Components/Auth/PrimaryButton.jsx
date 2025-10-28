// src/Components/Auth/PrimaryButton.jsx
import React from 'react';
import '../AuthStyles.css';

const PrimaryButton = ({ children, onClick, type = 'button', className = '' }) => {
  return (
    <button
      type={type}
      className={`primary-button full-width ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;