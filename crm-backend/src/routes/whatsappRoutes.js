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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const whatsappController = __importStar(require("../controllers/whatsappController"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const fileService_1 = require("../services/fileService");
const router = express_1.default.Router();
// Protected routes (require authentication)
router.get('/status', authMiddleware_1.authenticate, whatsappController.getStatus);
router.post('/send-text', authMiddleware_1.authenticate, whatsappController.sendText);
router.post('/send-media', authMiddleware_1.authenticate, whatsappController.sendMedia);
router.post('/upload', authMiddleware_1.authenticate, fileService_1.upload.single('file'), whatsappController.uploadMedia);
router.get('/queue-status', authMiddleware_1.authenticate, whatsappController.getMessageQueueStatus);
// Admin routes (require manager role)
router.post('/initialize', authMiddleware_1.authenticate, whatsappController.initializeInstance);
// Webhook route (no authentication required for Evolution API callbacks)
router.post('/webhook', whatsappController.processWebhook);
exports.default = router;
