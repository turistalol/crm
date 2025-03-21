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
exports.getQuickRepliesByCompany = exports.deleteQuickReply = exports.updateQuickReply = exports.getQuickReplyById = exports.createQuickReply = exports.getMessagesByChat = exports.updateMessageStatus = exports.getMessageById = exports.createMessage = exports.archiveChat = exports.getAllChats = exports.getChatById = exports.createChat = exports.getAllContacts = exports.updateContact = exports.getContactByPhoneNumber = exports.getContactById = exports.createContact = void 0;
const database_1 = __importDefault(require("../utils/database"));
/**
 * Contact management
 */
const createContact = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return database_1.default.contact.create({
        data
    });
});
exports.createContact = createContact;
const getContactById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return database_1.default.contact.findUnique({
        where: { id }
    });
});
exports.getContactById = getContactById;
const getContactByPhoneNumber = (phoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    return database_1.default.contact.findUnique({
        where: { phoneNumber }
    });
});
exports.getContactByPhoneNumber = getContactByPhoneNumber;
const updateContact = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    return database_1.default.contact.update({
        where: { id },
        data
    });
});
exports.updateContact = updateContact;
const getAllContacts = () => __awaiter(void 0, void 0, void 0, function* () {
    return database_1.default.contact.findMany({
        orderBy: { updatedAt: 'desc' }
    });
});
exports.getAllContacts = getAllContacts;
/**
 * Chat management
 */
const createChat = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return database_1.default.chat.create({
        data,
        include: {
            contact: true
        }
    });
});
exports.createChat = createChat;
const getChatById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return database_1.default.chat.findUnique({
        where: { id },
        include: {
            contact: true,
            lastMessage: true
        }
    });
});
exports.getChatById = getChatById;
const getAllChats = () => __awaiter(void 0, void 0, void 0, function* () {
    return database_1.default.chat.findMany({
        include: {
            contact: true,
            lastMessage: true
        },
        orderBy: { updatedAt: 'desc' }
    });
});
exports.getAllChats = getAllChats;
const archiveChat = (id_1, ...args_1) => __awaiter(void 0, [id_1, ...args_1], void 0, function* (id, isArchived = true) {
    return database_1.default.chat.update({
        where: { id },
        data: { isArchived }
    });
});
exports.archiveChat = archiveChat;
/**
 * Message management
 */
const createMessage = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const message = yield database_1.default.message.create({
        data,
        include: {
            contact: true
        }
    });
    // Update the last message of the chat
    yield database_1.default.chat.update({
        where: { id: data.chatId },
        data: { lastMessageId: message.id }
    });
    return message;
});
exports.createMessage = createMessage;
const getMessageById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return database_1.default.message.findUnique({
        where: { id }
    });
});
exports.getMessageById = getMessageById;
const updateMessageStatus = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    return database_1.default.message.update({
        where: { id },
        data
    });
});
exports.updateMessageStatus = updateMessageStatus;
const getMessagesByChat = (chatId) => __awaiter(void 0, void 0, void 0, function* () {
    return database_1.default.message.findMany({
        where: { chatId },
        include: {
            contact: true
        },
        orderBy: { createdAt: 'asc' }
    });
});
exports.getMessagesByChat = getMessagesByChat;
/**
 * Quick Reply management
 */
const createQuickReply = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return database_1.default.quickReply.create({
        data
    });
});
exports.createQuickReply = createQuickReply;
const getQuickReplyById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return database_1.default.quickReply.findUnique({
        where: { id }
    });
});
exports.getQuickReplyById = getQuickReplyById;
const updateQuickReply = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    return database_1.default.quickReply.update({
        where: { id },
        data
    });
});
exports.updateQuickReply = updateQuickReply;
const deleteQuickReply = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return database_1.default.quickReply.delete({
        where: { id }
    });
});
exports.deleteQuickReply = deleteQuickReply;
const getQuickRepliesByCompany = (companyId) => __awaiter(void 0, void 0, void 0, function* () {
    return database_1.default.quickReply.findMany({
        where: { companyId },
        orderBy: { title: 'asc' }
    });
});
exports.getQuickRepliesByCompany = getQuickRepliesByCompany;
