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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController = __importStar(require("../controllers/authController"));
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
const router = (0, express_1.Router)();
// Register validation schema
const registerValidation = {
    email: (value) => validationMiddleware_1.validators.required(value) !== true ? validationMiddleware_1.validators.required(value) : validationMiddleware_1.validators.email(value),
    password: (value) => validationMiddleware_1.validators.required(value) !== true ? validationMiddleware_1.validators.required(value) : validationMiddleware_1.validators.minLength(8)(value),
    firstName: validationMiddleware_1.validators.required,
    lastName: validationMiddleware_1.validators.required
};
// Login validation schema
const loginValidation = {
    email: (value) => validationMiddleware_1.validators.required(value) !== true ? validationMiddleware_1.validators.required(value) : validationMiddleware_1.validators.email(value),
    password: validationMiddleware_1.validators.required
};
// Refresh token validation schema
const refreshTokenValidation = {
    refreshToken: validationMiddleware_1.validators.required
};
// Register route
router.post('/register', (0, validationMiddleware_1.validate)(registerValidation), authController.register);
// Login route
router.post('/login', (0, validationMiddleware_1.validate)(loginValidation), authController.login);
// Refresh token route
router.post('/refresh-token', (0, validationMiddleware_1.validate)(refreshTokenValidation), authController.refreshToken);
// Logout route
router.post('/logout', (0, validationMiddleware_1.validate)(refreshTokenValidation), authController.logout);
exports.default = router;
