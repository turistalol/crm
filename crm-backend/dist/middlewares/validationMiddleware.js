import { Request, Response, NextFunction, RequestHandler } from 'express';
import { logger } from '../utils/logger';

// Generic type for validation schemas
type ValidationSchema = {
  [key: string]: (value: any) => boolean | string;
};

// Error response type
type ValidationError = {
  field: string;
  message: string;
};

/**
 * Creates a validation middleware for request data
 * @param schema Validation schema object with field name as key and validation function as value
 * @param source Request property to validate ('body', 'query', 'params')
 */
export const validate = (
  schema: ValidationSchema, 
  source: 'body' | 'query' | 'params' = 'body'
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const data = req[source];
    const errors: ValidationError[] = [];

    // Validate each field according to schema
    for (const [field, validator] of Object.entries(schema)) {
      const result = validator(data[field]);
      
      // If validation failed (returned string error message)
      if (typeof result === 'string') {
        errors.push({
          field,
          message: result
        });
      }
    }

    // If there are validation errors, return 400 with error details
    if (errors.length > 0) {
      logger.warn(`Validation failed: ${JSON.stringify(errors)}`);
      res.status(400).json({
        message: 'Validation failed',
        errors
      });
      return;
    }

    // Continue to the next middleware if validation passes
    next();
  };
};

// Common validation functions
export const validators = {
  required: (value: any): boolean | string => {
    return value !== undefined && value !== null && value !== '' 
      ? true 
      : 'This field is required';
  },
  
  email: (value: any): boolean | string => {
    if (!value) return true; // Skip if empty (use with required for mandatory emails)
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? true : 'Invalid email format';
  },
  
  minLength: (min: number) => (value: any): boolean | string => {
    if (!value) return true; // Skip if empty
    
    return String(value).length >= min 
      ? true 
      : `Must be at least ${min} characters`;
  },
  
  maxLength: (max: number) => (value: any): boolean | string => {
    if (!value) return true; // Skip if empty
    
    return String(value).length <= max 
      ? true 
      : `Must be no more than ${max} characters`;
  }
}; 