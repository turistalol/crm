import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { logger } from '../utils/logger';

/**
 * Middleware to check if user has one of the required roles
 * @param allowedRoles Array of roles that are allowed to access the resource
 */
export function checkRole(allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = req;

      if (!user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (!allowedRoles.includes(user.role as Role)) {
        logger.warn(`Access denied for user ${user.id} with role ${user.role}, required one of: ${allowedRoles.join(', ')}`);
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      logger.error('Error in role middleware:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
} 