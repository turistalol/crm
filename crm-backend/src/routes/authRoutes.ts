import { Router } from 'express';
import * as authController from '../controllers/authController';
import { validate, validators } from '../middlewares/validationMiddleware';

const router = Router();

// Register validation schema
const registerValidation = {
  email: (value: any) => 
    validators.required(value) !== true ? validators.required(value) : validators.email(value),
  password: (value: any) => 
    validators.required(value) !== true ? validators.required(value) : validators.minLength(8)(value),
  firstName: validators.required,
  lastName: validators.required
};

// Login validation schema
const loginValidation = {
  email: (value: any) => 
    validators.required(value) !== true ? validators.required(value) : validators.email(value),
  password: validators.required
};

// Refresh token validation schema
const refreshTokenValidation = {
  refreshToken: validators.required
};

// Register route
router.post('/register', validate(registerValidation), authController.register);

// Login route
router.post('/login', validate(loginValidation), authController.login);

// Refresh token route
router.post('/refresh-token', validate(refreshTokenValidation), authController.refreshToken);

// Logout route
router.post('/logout', validate(refreshTokenValidation), authController.logout);

export default router; 