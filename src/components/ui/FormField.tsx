import React from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'textarea' | 'select';
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  error?: string;
  required?: boolean;
  autoComplete?: string;
  options?: { value: string; label: string }[];
  rows?: number;
  className?: string;
}

export function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  autoComplete,
  options = [],
  rows = 3,
  className = ''
}: FormFieldProps) {
  const baseClasses = `mt-1 appearance-none relative block w-full px-3 py-2 border ${
    error ? 'border-red-300' : 'border-gray-300'
  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${className}`;

  const renderField = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            name={name}
            rows={rows}
            className={baseClasses}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
          />
        );
      
      case 'select':
        return (
          <select
            name={name}
            className={baseClasses}
            value={value}
            onChange={onChange}
            required={required}
          >
            <option value="">Select an option</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      default:
        return (
          <input
            type={type}
            name={name}
            className={baseClasses}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            autoComplete={autoComplete}
          />
        );
    }
  };

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
} 