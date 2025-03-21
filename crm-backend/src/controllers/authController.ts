import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, companyId } = req.body;
    
    // Check if user already exists
    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    
    // Create user
    const user = await userService.createUser({
      email,
      password,
      firstName,
      lastName,
      companyId
    });
    
    // Generate tokens
    const { accessToken, refreshToken } = await authService.generateTokens(
      user.id,
      user.email,
      user.role
    );
    
    // Return user and tokens
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    logger.error(`Registration error: ${(error as Error).message}`);
    res.status(500).json({ message: 'Error registering user', error: (error as Error).message });
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Authenticate user using login method
    const tokens = await authService.login(email, password);
    if (!tokens) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Get user details
    const user = await userService.findByEmail(email);
    
    // Return user and tokens
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user!.id,
        email: user!.email,
        firstName: user!.firstName,
        lastName: user!.lastName,
        role: user!.role
      },
      ...tokens
    });
  } catch (error) {
    logger.error(`Login error: ${(error as Error).message}`);
    res.status(500).json({ message: 'Error logging in', error: (error as Error).message });
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
    
    // Validate refresh token and get new tokens
    const tokens = await authService.refreshToken(refreshToken);
    
    if (!tokens) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
    
    // Return new tokens
    res.status(200).json({
      message: 'Token refreshed successfully',
      ...tokens
    });
  } catch (error) {
    logger.error(`Token refresh error: ${(error as Error).message}`);
    res.status(500).json({ message: 'Error refreshing token', error: (error as Error).message });
  }
};

/**
 * Logout user
 */
export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
    
    // Invalidate refresh token
    const success = await authService.logout(refreshToken);
    
    if (success) {
      res.status(200).json({ message: 'Logged out successfully' });
    } else {
      res.status(400).json({ message: 'Invalid refresh token' });
    }
  } catch (error) {
    logger.error(`Logout error: ${(error as Error).message}`);
    res.status(500).json({ message: 'Error logging out', error: (error as Error).message });
  }
}; 