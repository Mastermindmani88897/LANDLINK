import React, { useState, useRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordInput({
  value,
  onChange,
  placeholder = '••••••••',
  required = false,
  className = 'glass-input',
  style = {},
  disabled = false,
  id,
  name,
  autoComplete = 'current-password',
  leftIcon = null,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef(null);

  const toggleVisibility = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Preserve selection / cursor position if input is currently focused
    const inputEl = inputRef.current;
    const start = inputEl ? inputEl.selectionStart : null;
    const end = inputEl ? inputEl.selectionEnd : null;

    setShowPassword((prev) => !prev);

    // Restore focus & cursor position after type state change
    setTimeout(() => {
      if (inputEl && document.activeElement === inputEl && start !== null && end !== null) {
        inputEl.setSelectionRange(start, end);
      }
    }, 0);
  };

  const hasLeftIcon = Boolean(leftIcon);

  return (
    <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
      {/* Optional Left Icon */}
      {leftIcon && (
        <div
          style={{
            position: 'absolute',
            left: '0.875rem',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#818cf8',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          {leftIcon}
        </div>
      )}

      {/* Main Password Input */}
      <input
        ref={inputRef}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        id={id}
        name={name}
        autoComplete={autoComplete}
        className={className}
        style={{
          width: '100%',
          paddingLeft: hasLeftIcon ? '2.5rem' : style.paddingLeft || '0.875rem',
          paddingRight: '2.5rem',
          fontSize: '0.875rem',
          ...style,
        }}
        {...props}
      />

      {/* Show/Hide Password Toggle Icon Button */}
      <button
        type="button"
        onClick={toggleVisibility}
        disabled={disabled}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        title={showPassword ? 'Hide password' : 'Show password'}
        style={{
          position: 'absolute',
          right: '0.75rem',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          padding: '0.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: showPassword ? '#818cf8' : '#94a3b8',
          cursor: disabled ? 'not-allowed' : 'pointer',
          borderRadius: '0.375rem',
          transition: 'color 0.2s ease, opacity 0.2s ease',
          opacity: disabled ? 0.5 : 1,
          zIndex: 3,
        }}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
