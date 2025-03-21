"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sentryErrorHandler = exports.stream = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const Sentry = __importStar(require("@sentry/node"));
const winston_transport_1 = __importDefault(require("winston-transport"));
// Initialize Sentry if in production and DSN is provided
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 1.0,
    });
    console.log('Sentry initialized for error tracking');
}
// Create a Sentry transport for Winston
class SentryTransport extends winston_transport_1.default {
    constructor(opts) {
        super(opts);
    }
    log(info, callback) {
        const { level, message } = info, meta = __rest(info, ["level", "message"]);
        if (level === 'error' || level === 'warn') {
            Sentry.captureMessage(message, {
                level: level === 'error' ? 'error' : 'warning',
                extra: meta,
            });
        }
        callback();
    }
}
// Define log format
const logFormat = winston_1.default.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});
// Create logger instance
exports.logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), logFormat),
    defaultMeta: { service: 'crm-backend' },
    transports: [
        // Write logs to console
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), logFormat),
        }),
        // Write to error log file (production only)
        ...(process.env.NODE_ENV === 'production'
            ? [
                new winston_1.default.transports.File({ filename: 'logs/error.log', level: 'error' }),
                new winston_1.default.transports.File({ filename: 'logs/combined.log' }),
                // Add Sentry transport in production if DSN exists
                ...(process.env.SENTRY_DSN ? [new SentryTransport({ level: 'warn' })] : [])
            ]
            : [])
    ],
});
// Export a stream object for Morgan middleware
exports.stream = {
    write: (message) => {
        exports.logger.info(message.trim());
    },
};
// Error handler middleware for Express
const sentryErrorHandler = (err, req, res, next) => {
    if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
        Sentry.captureException(err);
    }
    exports.logger.error(`${err.stack || err.message || err}`);
    next(err);
};
exports.sentryErrorHandler = sentryErrorHandler;
