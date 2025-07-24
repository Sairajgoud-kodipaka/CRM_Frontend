export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

export interface ValidationRules {
  [fieldName: string]: ValidationRule;
}

export interface ValidationErrors {
  [fieldName: string]: string;
}

export const validateField = (value: string, rules: ValidationRule): string | null => {
  // Required validation
  if (rules.required && !value.trim()) {
    return 'This field is required';
  }

  // Skip other validations if field is empty and not required
  if (!value.trim()) {
    return null;
  }

  // Min length validation
  if (rules.minLength && value.length < rules.minLength) {
    return `Minimum length is ${rules.minLength} characters`;
  }

  // Max length validation
  if (rules.maxLength && value.length > rules.maxLength) {
    return `Maximum length is ${rules.maxLength} characters`;
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(value)) {
    return 'Invalid format';
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
};

export const validateForm = (data: Record<string, string>, rules: ValidationRules): ValidationErrors => {
  const errors: ValidationErrors = {};

  Object.keys(rules).forEach(fieldName => {
    const value = data[fieldName] || '';
    const fieldRules = rules[fieldName];
    const error = validateField(value, fieldRules);
    
    if (error) {
      errors[fieldName] = error;
    }
  });

  return errors;
};

// Common validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  url: /^https?:\/\/.+/,
  numeric: /^\d+$/,
  decimal: /^\d+(\.\d{1,2})?$/
};

// Common validation rules
export const COMMON_RULES = {
  email: {
    required: true,
    pattern: VALIDATION_PATTERNS.email,
    custom: (value: string) => {
      if (!VALIDATION_PATTERNS.email.test(value)) {
        return 'Please enter a valid email address';
      }
      return null;
    }
  },
  
  password: {
    required: true,
    minLength: 8,
    custom: (value: string) => {
      if (value.length < 8) {
        return 'Password must be at least 8 characters long';
      }
      if (!/(?=.*[a-z])/.test(value)) {
        return 'Password must contain at least one lowercase letter';
      }
      if (!/(?=.*[A-Z])/.test(value)) {
        return 'Password must contain at least one uppercase letter';
      }
      if (!/(?=.*\d)/.test(value)) {
        return 'Password must contain at least one number';
      }
      return null;
    }
  },
  
  phone: {
    required: true,
    pattern: VALIDATION_PATTERNS.phone,
    custom: (value: string) => {
      if (!VALIDATION_PATTERNS.phone.test(value)) {
        return 'Please enter a valid phone number';
      }
      return null;
    }
  },
  
  required: {
    required: true
  },
  
  optional: {
    required: false
  }
};

// Custom validation functions
export const validatePasswordConfirmation = (password: string, confirmPassword: string): string | null => {
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
};

export const validateAge = (birthDate: string): string | null => {
  const today = new Date();
  const birth = new Date(birthDate);
  const age = today.getFullYear() - birth.getFullYear();
  
  if (age < 18) {
    return 'You must be at least 18 years old';
  }
  
  if (age > 120) {
    return 'Please enter a valid birth date';
  }
  
  return null;
};

export const validateFileSize = (file: File, maxSizeMB: number): string | null => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  if (file.size > maxSizeBytes) {
    return `File size must be less than ${maxSizeMB}MB`;
  }
  
  return null;
};

export const validateFileType = (file: File, allowedTypes: string[]): string | null => {
  if (!allowedTypes.includes(file.type)) {
    return `File type must be one of: ${allowedTypes.join(', ')}`;
  }
  
  return null;
}; 