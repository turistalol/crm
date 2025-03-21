"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageStatus = exports.MessageDirection = exports.MediaType = void 0;
// Define enums locally since they might not be available from Prisma client yet after schema update
var MediaType;
(function (MediaType) {
    MediaType["IMAGE"] = "IMAGE";
    MediaType["VIDEO"] = "VIDEO";
    MediaType["AUDIO"] = "AUDIO";
    MediaType["DOCUMENT"] = "DOCUMENT";
})(MediaType || (exports.MediaType = MediaType = {}));
var MessageDirection;
(function (MessageDirection) {
    MessageDirection["INBOUND"] = "INBOUND";
    MessageDirection["OUTBOUND"] = "OUTBOUND";
})(MessageDirection || (exports.MessageDirection = MessageDirection = {}));
var MessageStatus;
(function (MessageStatus) {
    MessageStatus["SENT"] = "SENT";
    MessageStatus["DELIVERED"] = "DELIVERED";
    MessageStatus["READ"] = "READ";
    MessageStatus["FAILED"] = "FAILED";
})(MessageStatus || (exports.MessageStatus = MessageStatus = {}));
