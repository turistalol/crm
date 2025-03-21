"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validators = exports.validate = void 0;
const logger_1 = require("../utils/logger");
/**
 * Creates a validation middleware for request data
 * @param schema Validation schema object with field name as key and validation function as value
 * @param source Request property to validate ('body', 'query', 'params')
 */
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const data = req[source];
        const errors = [];
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
            logger_1.logger.warn(`Validation failed: ${JSON.stringify(errors)}`);
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
exports.validate = validate;
// Common validation functions
exports.validators = {
    required: (value) => {
        return value !== undefined && value !== null && value !== ''
            ? true
            : 'This field is required';
    },
    email: (value) => {
        if (!value)
            return true; // Skip if empty (use with required for mandatory emails)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? true : 'Invalid email format';
    },
    minLength: (min) => (value) => {
        if (!value)
            return true; // Skip if empty
        return String(value).length >= min
            ? true
            : `Must be at least ${min} characters`;
    },
    maxLength: (max) => (value) => {
        if (!value)
            return true; // Skip if empty
        return String(value).length <= max
            ? true
            : `Must be no more than ${max} characters`;
    }
};
