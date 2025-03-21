import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/database';
import { logger } from '../utils/logger';

/**
 * API Key authentication middleware
 * Validates API key from the X-API-Key header and attaches
 * the associated company to the request object
 */
export const apiKeyAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      return res.status(401).json({
        status: 'error',
        message: 'API key is required'
      });
    }
    
    // Find the API key in the database
    const key = await prisma.apiKey.findUnique({
      where: { key: apiKey, isActive: true },
      include: { company: true }
    });
    
    if (!key) {
      return res.status(403).json({
        status: 'error',
        message: 'Invalid or inactive API key'
      });
    }
    
    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: key.id },
      data: { lastUsed: new Date() }
    }).catch(err => {
      // Non-critical error, just log it
      logger.warn('Failed to update API key lastUsed timestamp:', err);
    });
    
    // Attach company to request object for use in route handlers
    req.company = key.company;
    req.apiKeyId = key.id;
    
    next();
  } catch (error) {
    logger.error('API key authentication error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Authentication error'
    });
  }
}; 