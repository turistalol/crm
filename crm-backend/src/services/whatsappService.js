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
exports.processWebhook = exports.sendMediaMessage = exports.sendTextMessage = exports.getInstanceStatus = exports.initializeWhatsApp = void 0;
const axios_1 = __importDefault(require("axios"));
const chatService_1 = require("./chatService");
const chat_1 = require("../models/chat");
const logger_1 = require("../utils/logger");
// Configuration for the Evolution API
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || '';
const INSTANCE_NAME = process.env.WHATSAPP_INSTANCE || 'default';
// Headers for Evolution API requests
const headers = {
    'Content-Type': 'application/json',
    'apikey': EVOLUTION_API_KEY
};
/**
 * Initialize WhatsApp instance
 */
const initializeWhatsApp = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.post(`${EVOLUTION_API_URL}/instance/init`, {
            instanceName: INSTANCE_NAME,
            webhook: `${process.env.API_URL}/api/whatsapp/webhook`
        }, { headers });
        return response.data;
    }
    catch (error) {
        logger_1.logger.error(`Error initializing WhatsApp instance: ${error.message}`);
        throw error;
    }
});
exports.initializeWhatsApp = initializeWhatsApp;
/**
 * Get WhatsApp instance status
 */
const getInstanceStatus = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(`${EVOLUTION_API_URL}/instance/info`, {
            params: { instanceName: INSTANCE_NAME },
            headers
        });
        return response.data;
    }
    catch (error) {
        logger_1.logger.error(`Error getting WhatsApp instance status: ${error.message}`);
        throw error;
    }
});
exports.getInstanceStatus = getInstanceStatus;
/**
 * Send a text message through WhatsApp
 */
const sendTextMessage = (to, message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.post(`${EVOLUTION_API_URL}/message/text`, {
            number: to,
            options: {
                delay: 1200,
                presence: 'composing'
            },
            textMessage: {
                text: message
            }
        }, {
            params: { instanceName: INSTANCE_NAME },
            headers
        });
        return response.data;
    }
    catch (error) {
        logger_1.logger.error(`Error sending WhatsApp message: ${error.message}`);
        throw error;
    }
});
exports.sendTextMessage = sendTextMessage;
/**
 * Send a media message through WhatsApp
 */
const sendMediaMessage = (to, url, caption, mediaType) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.post(`${EVOLUTION_API_URL}/message/media`, {
            number: to,
            options: {
                delay: 1200
            },
            mediaMessage: {
                mediatype: mediaType,
                media: url,
                caption: caption
            }
        }, {
            params: { instanceName: INSTANCE_NAME },
            headers
        });
        return response.data;
    }
    catch (error) {
        logger_1.logger.error(`Error sending WhatsApp media message: ${error.message}`);
        throw error;
    }
});
exports.sendMediaMessage = sendMediaMessage;
/**
 * Process incoming webhook events from Evolution API
 */
const processWebhook = (webhookEvent) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Only process message events
        if (webhookEvent.event !== 'messages.upsert') {
            return { success: true, message: 'Non-message event ignored' };
        }
        const { data } = webhookEvent;
        const phoneNumber = data.from;
        // Check if contact exists
        let contact = yield (0, chatService_1.getContactByPhoneNumber)(phoneNumber);
        // Create contact if it doesn't exist
        if (!contact) {
            contact = yield (0, chatService_1.createContact)({
                name: phoneNumber, // Use phone number as initial name
                phoneNumber
            });
            // Create a new chat for this contact
            yield (0, chatService_1.createChat)({
                contactId: contact.id
            });
        }
        // Find the chat for this contact
        const chat = yield (0, chatService_1.createChat)({
            contactId: contact.id
        });
        // Create a message record
        const messageData = {
            content: data.body,
            mediaUrl: data.mediaUrl,
            direction: chat_1.MessageDirection.INBOUND,
            contactId: contact.id,
            chatId: chat.id
        };
        const message = yield (0, chatService_1.createMessage)(messageData);
        return {
            success: true,
            message: 'Message processed successfully',
            data: message
        };
    }
    catch (error) {
        logger_1.logger.error(`Error processing webhook: ${error.message}`);
        throw error;
    }
});
exports.processWebhook = processWebhook;
