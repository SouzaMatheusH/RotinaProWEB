// src/Components/Auth/LavenderInput.jsx
import React from 'react';
import '../AuthStyles.css';

const LavenderInput = ({ label, id, name, type = 'text', value, onChange, placeholder, required = false }) => {
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="lavender-input"
        placeholder={placeholder}
        required={required}
      />
    </>
  );
};

export default LavenderInput;