"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeyAuth = void 0;
const database_1 = __importDefault(require("../utils/database"));
const logger_1 = require("../utils/logger");
/**
 * API Key authentication middleware
 * Validates API key from the X-API-Key header and attaches
 * the associated company to the request object
 */
const apiKeyAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const apiKey = req.headers['x-api-key'];
        if (!apiKey) {
            return res.status(401).json({
                status: 'error',
                message: 'API key is required'
            });
        }
        // Find the API key in the database
        const key = yield database_1.default.apiKey.findUnique({
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
        yield database_1.default.apiKey.update({
            where: { id: key.id },
            data: { lastUsed: new Date() }
        }).catch(err => {
            // Non-critical error, just log it
            logger_1.logger.warn('Failed to update API key lastUsed timestamp:', err);
        });
        // Attach company to request object for use in route handlers
        req.company = key.company;
        req.apiKeyId = key.id;
        next();
    }
    catch (error) {
        logger_1.logger.error('API key authentication error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Authentication error'
        });
    }
});
exports.apiKeyAuth = apiKeyAuth;
