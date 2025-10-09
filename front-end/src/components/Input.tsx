import React from "react";

type InputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  className?: string;
};

const Input: React.FC<InputProps> = ({ value, onChange, placeholder = '', type = 'text', disabled = false, className = '' }) => {
  return (
    <input value={value} onChange={onChange} placeholder={placeholder} type={type} disabled={disabled} className={`${className}`} />
  );
}

export default Input;
