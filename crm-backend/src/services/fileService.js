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
exports.deleteFromS3 = exports.uploadToS3 = exports.upload = void 0;
const aws_sdk_1 = require("aws-sdk");
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const logger_1 = require("../utils/logger");
// S3 Configuration
const s3 = new aws_sdk_1.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
});
// Disk storage configuration for local development
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../uploads');
        // Create directory if it doesn't exist
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueName = `${(0, uuid_1.v4)()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});
// Multer configuration
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max size
    },
    fileFilter: (req, file, cb) => {
        // Accept images, videos, audio, and documents
        const allowedMimes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'video/mp4',
            'audio/mpeg',
            'audio/ogg',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error(`Invalid file type. Only ${allowedMimes.join(', ')} are allowed.`));
        }
    }
});
/**
 * Upload file to S3
 */
const uploadToS3 = (file) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if S3 is configured
        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
            logger_1.logger.warn('AWS S3 not configured. Using local file storage.');
            return {
                url: `/uploads/${file.filename}`,
                key: file.filename
            };
        }
        // Upload to S3
        const params = {
            Bucket: process.env.AWS_S3_BUCKET || 'crm-uploads',
            Key: `uploads/${file.filename}`,
            Body: fs_1.default.createReadStream(file.path),
            ContentType: file.mimetype,
            ACL: 'public-read'
        };
        const result = yield s3.upload(params).promise();
        // Delete local file after upload
        fs_1.default.unlinkSync(file.path);
        return {
            url: result.Location,
            key: result.Key
        };
    }
    catch (error) {
        logger_1.logger.error(`Error uploading file to S3: ${error.message}`);
        throw error;
    }
});
exports.uploadToS3 = uploadToS3;
/**
 * Delete file from S3
 */
const deleteFromS3 = (key) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if S3 is configured
        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
            // Delete local file
            const filePath = path_1.default.join(__dirname, '../../uploads', key);
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
            return true;
        }
        // Delete from S3
        const params = {
            Bucket: process.env.AWS_S3_BUCKET || 'crm-uploads',
            Key: key
        };
        yield s3.deleteObject(params).promise();
        return true;
    }
    catch (error) {
        logger_1.logger.error(`Error deleting file from S3: ${error.message}`);
        throw error;
    }
});
exports.deleteFromS3 = deleteFromS3;
