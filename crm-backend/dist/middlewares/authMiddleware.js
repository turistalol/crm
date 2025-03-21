import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Get authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'No authorization header provided' });
  }

  // Check if format is Bearer <token>
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Token format should be: Bearer <token>' });
  }

  const token = parts[1];
  
  try {
    if (!process.env.JWT_SECRET) {
      logger.error('JWT_SECRET is not defined');
      return res.status(500).json({ message: 'Internal server error' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    
    // Attach user data to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
    
    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    logger.error(`Auth error: ${error}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Middleware to check if user has specified role
 */
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    return next();
  };
}; 