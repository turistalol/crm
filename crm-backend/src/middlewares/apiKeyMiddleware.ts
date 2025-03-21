import { Request, Response, NextFunction } from 'express';
import apiKeyService from '../services/apiKeyService';
import { logger } from '../utils/logger';

// Extend Express Request interface to include company
declare global {
  namespace Express {
    interface Request {
      company?: {
        id: string;
        name: string;
      };
    }
  }
}

/**
 * Middleware to authenticate requests using API key
 * Looks for API key in X-API-Key header
 */
export const authenticateApiKey = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return res.status(401).json({ message: 'API key is required' });
  }
  
  try {
    const validApiKey = await apiKeyService.validateApiKey(apiKey);
    
    if (!validApiKey) {
      return res.status(401).json({ message: 'Invalid or inactive API key' });
    }
    
    // Attach company to request
    req.company = {
      id: validApiKey.companyId,
      name: validApiKey.company.name
    };
    
    return next();
  } catch (error) {
    logger.error('Error validating API key:', error);
    return res.status(500).json({ message: 'Error validating API key' });
  }
};

/**
 * Rate limiting middleware for API requests
 * Simple implementation with in-memory storage
 * For production, consider using Redis-based solution
 */
const apiRequestCounts = new Map<string, { count: number, resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 60; // 60 requests per minute

export const rateLimitApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return next(); // Will be caught by authenticateApiKey
  }
  
  const now = Date.now();
  
  if (!apiRequestCounts.has(apiKey)) {
    apiRequestCounts.set(apiKey, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return next();
  }
  
  const requestData = apiRequestCounts.get(apiKey)!;
  
  // Reset count if window has expired
  if (now > requestData.resetTime) {
    requestData.count = 1;
    requestData.resetTime = now + RATE_LIMIT_WINDOW;
    return next();
  }
  
  // Check if rate limit exceeded
  if (requestData.count >= RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((requestData.resetTime - now) / 1000);
    
    res.set('Retry-After', String(retryAfter));
    return res.status(429).json({
      message: 'Rate limit exceeded',
      retryAfter
    });
  }
  
  // Increment count
  requestData.count += 1;
  return next();
};

// Cleanup for rate limiting data
// Run every 10 minutes to remove expired entries
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of apiRequestCounts.entries()) {
    if (now > data.resetTime) {
      apiRequestCounts.delete(key);
    }
  }
}, 10 * 60 * 1000); 