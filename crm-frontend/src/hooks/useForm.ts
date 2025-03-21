import { useState, ChangeEvent, FormEvent } from 'react';

interface FormErrors {
  [key: string]: string;
}

interface ValidationRules {
  [key: string]: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    validate?: (value: any, formValues: any) => boolean | string;
  };
}

export const useForm = <T extends Record<string, any>>(initialValues: T, validationRules?: ValidationRules) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validate = (): boolean => {
    if (!validationRules) return true;

    const newErrors: FormErrors = {};
    let isValid = true;

    // Check each field against validation rules
    Object.keys(validationRules).forEach(field => {
      const value = values[field];
      const rules = validationRules[field];

      // Required validation
      if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        newErrors[field] = 'This field is required';
        isValid = false;
        return;
      }

      if (value) {
        // MinLength validation
        if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
          newErrors[field] = `Must be at least ${rules.minLength} characters`;
          isValid = false;
          return;
        }

        // MaxLength validation
        if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
          newErrors[field] = `Must be less than ${rules.maxLength} characters`;
          isValid = false;
          return;
        }

        // Pattern validation
        if (rules.pattern && !rules.pattern.test(value)) {
          newErrors[field] = 'Invalid format';
          isValid = false;
          return;
        }

        // Custom validation
        if (rules.validate) {
          const result = rules.validate(value, values);
          if (typeof result === 'string') {
            newErrors[field] = result;
            isValid = false;
          } else if (!result) {
            newErrors[field] = 'Invalid value';
            isValid = false;
          }
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (onSubmit: (values: T) => void | Promise<void>) => {
    return async (e: FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      
      if (validate()) {
        try {
          await onSubmit(values);
        } catch (error) {
          console.error('Form submission error:', error);
        } finally {
          setIsSubmitting(false);
        }
      } else {
        setIsSubmitting(false);
      }
    };
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
  };

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    setValues,
    setErrors
  };
}; 