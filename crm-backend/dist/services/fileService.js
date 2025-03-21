import { S3 } from 'aws-sdk';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

// S3 Configuration
const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Disk storage configuration for local development
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

// Multer configuration
export const upload = multer({
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
    } else {
      cb(new Error(`Invalid file type. Only ${allowedMimes.join(', ')} are allowed.`));
    }
  }
});

/**
 * Upload file to S3
 */
export const uploadToS3 = async (file: Express.Multer.File) => {
  try {
    // Check if S3 is configured
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      logger.warn('AWS S3 not configured. Using local file storage.');
      return {
        url: `/uploads/${file.filename}`,
        key: file.filename
      };
    }
    
    // Upload to S3
    const params = {
      Bucket: process.env.AWS_S3_BUCKET || 'crm-uploads',
      Key: `uploads/${file.filename}`,
      Body: fs.createReadStream(file.path),
      ContentType: file.mimetype,
      ACL: 'public-read'
    };
    
    const result = await s3.upload(params).promise();
    
    // Delete local file after upload
    fs.unlinkSync(file.path);
    
    return {
      url: result.Location,
      key: result.Key
    };
  } catch (error) {
    logger.error(`Error uploading file to S3: ${(error as Error).message}`);
    throw error;
  }
};

/**
 * Delete file from S3
 */
export const deleteFromS3 = async (key: string) => {
  try {
    // Check if S3 is configured
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      // Delete local file
      const filePath = path.join(__dirname, '../../uploads', key);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return true;
    }
    
    // Delete from S3
    const params = {
      Bucket: process.env.AWS_S3_BUCKET || 'crm-uploads',
      Key: key
    };
    
    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    logger.error(`Error deleting file from S3: ${(error as Error).message}`);
    throw error;
  }
}; 