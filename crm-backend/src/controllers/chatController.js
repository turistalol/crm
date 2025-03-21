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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuickReply = exports.updateQuickReply = exports.createQuickReply = exports.getQuickReplies = exports.sendMessage = exports.getMessagesByChat = exports.toggleArchiveChat = exports.createChat = exports.getChatById = exports.getAllChats = exports.updateContact = exports.createContact = exports.getContactById = exports.getAllContacts = void 0;
const chatService = __importStar(require("../services/chatService"));
const logger_1 = require("../utils/logger");
/**
 * Get all contacts
 */
const getAllContacts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contacts = yield chatService.getAllContacts();
        res.json(contacts);
    }
    catch (error) {
        logger_1.logger.error(`Error fetching contacts: ${error.message}`);
        res.status(500).json({ message: 'Error fetching contacts', error: error.message });
    }
});
exports.getAllContacts = getAllContacts;
/**
 * Get contact by ID
 */
const getContactById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const contact = yield chatService.getContactById(id);
        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        res.json(contact);
    }
    catch (error) {
        logger_1.logger.error(`Error fetching contact: ${error.message}`);
        res.status(500).json({ message: 'Error fetching contact', error: error.message });
    }
});
exports.getContactById = getContactById;
/**
 * Create a new contact
 */
const createContact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contact = yield chatService.createContact(req.body);
        res.status(201).json(contact);
    }
    catch (error) {
        logger_1.logger.error(`Error creating contact: ${error.message}`);
        res.status(500).json({ message: 'Error creating contact', error: error.message });
    }
});
exports.createContact = createContact;
/**
 * Update a contact
 */
const updateContact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const contact = yield chatService.updateContact(id, req.body);
        res.json(contact);
    }
    catch (error) {
        logger_1.logger.error(`Error updating contact: ${error.message}`);
        res.status(500).json({ message: 'Error updating contact', error: error.message });
    }
});
exports.updateContact = updateContact;
/**
 * Get all chats
 */
const getAllChats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chats = yield chatService.getAllChats();
        res.json(chats);
    }
    catch (error) {
        logger_1.logger.error(`Error fetching chats: ${error.message}`);
        res.status(500).json({ message: 'Error fetching chats', error: error.message });
    }
});
exports.getAllChats = getAllChats;
/**
 * Get chat by ID
 */
const getChatById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const chat = yield chatService.getChatById(id);
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }
        res.json(chat);
    }
    catch (error) {
        logger_1.logger.error(`Error fetching chat: ${error.message}`);
        res.status(500).json({ message: 'Error fetching chat', error: error.message });
    }
});
exports.getChatById = getChatById;
/**
 * Create a new chat
 */
const createChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chat = yield chatService.createChat(req.body);
        res.status(201).json(chat);
    }
    catch (error) {
        logger_1.logger.error(`Error creating chat: ${error.message}`);
        res.status(500).json({ message: 'Error creating chat', error: error.message });
    }
});
exports.createChat = createChat;
/**
 * Archive/unarchive a chat
 */
const toggleArchiveChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { isArchived } = req.body;
        const chat = yield chatService.archiveChat(id, isArchived);
        res.json(chat);
    }
    catch (error) {
        logger_1.logger.error(`Error archiving chat: ${error.message}`);
        res.status(500).json({ message: 'Error archiving chat', error: error.message });
    }
});
exports.toggleArchiveChat = toggleArchiveChat;
/**
 * Get messages by chat ID
 */
const getMessagesByChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId } = req.params;
        const messages = yield chatService.getMessagesByChat(chatId);
        res.json(messages);
    }
    catch (error) {
        logger_1.logger.error(`Error fetching messages: ${error.message}`);
        res.status(500).json({ message: 'Error fetching messages', error: error.message });
    }
});
exports.getMessagesByChat = getMessagesByChat;
/**
 * Send a message
 */
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const message = yield chatService.createMessage(req.body);
        res.status(201).json(message);
    }
    catch (error) {
        logger_1.logger.error(`Error sending message: ${error.message}`);
        res.status(500).json({ message: 'Error sending message', error: error.message });
    }
});
exports.sendMessage = sendMessage;
/**
 * Get quick replies by company
 */
const getQuickReplies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { companyId } = req.params;
        const quickReplies = yield chatService.getQuickRepliesByCompany(companyId);
        res.json(quickReplies);
    }
    catch (error) {
        logger_1.logger.error(`Error fetching quick replies: ${error.message}`);
        res.status(500).json({ message: 'Error fetching quick replies', error: error.message });
    }
});
exports.getQuickReplies = getQuickReplies;
/**
 * Create a quick reply
 */
const createQuickReply = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const quickReply = yield chatService.createQuickReply(req.body);
        res.status(201).json(quickReply);
    }
    catch (error) {
        logger_1.logger.error(`Error creating quick reply: ${error.message}`);
        res.status(500).json({ message: 'Error creating quick reply', error: error.message });
    }
});
exports.createQuickReply = createQuickReply;
/**
 * Update a quick reply
 */
const updateQuickReply = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const quickReply = yield chatService.updateQuickReply(id, req.body);
        res.json(quickReply);
    }
    catch (error) {
        logger_1.logger.error(`Error updating quick reply: ${error.message}`);
        res.status(500).json({ message: 'Error updating quick reply', error: error.message });
    }
});
exports.updateQuickReply = updateQuickReply;
/**
 * Delete a quick reply
 */
const deleteQuickReply = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield chatService.deleteQuickReply(id);
        res.status(204).send();
    }
    catch (error) {
        logger_1.logger.error(`Error deleting quick reply: ${error.message}`);
        res.status(500).json({ message: 'Error deleting quick reply', error: error.message });
    }
});
exports.deleteQuickReply = deleteQuickReply;
