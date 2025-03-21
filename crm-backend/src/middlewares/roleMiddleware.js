"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = checkRole;
const logger_1 = require("../utils/logger");
/**
 * Middleware to check if user has one of the required roles
 * @param allowedRoles Array of roles that are allowed to access the resource
 */
function checkRole(allowedRoles) {
    return (req, res, next) => {
        try {
            const { user } = req;
            if (!user) {
                return res.status(401).json({ message: 'Authentication required' });
            }
            if (!allowedRoles.includes(user.role)) {
                logger_1.logger.warn(`Access denied for user ${user.id} with role ${user.role}, required one of: ${allowedRoles.join(', ')}`);
                return res.status(403).json({ message: 'Insufficient permissions' });
            }
            next();
        }
        catch (error) {
            logger_1.logger.error('Error in role middleware:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };
}
