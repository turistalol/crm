import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/crm',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'supersecret-development-only',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
  },
  
  whatsapp: {
    evolutionApiUrl: process.env.EVOLUTION_API_URL || 'http://localhost:8080',
    apiKey: process.env.EVOLUTION_API_KEY || '',
  },
  
  s3: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    bucket: process.env.S3_BUCKET || 'crm-uploads',
    region: process.env.S3_REGION || 'us-east-1',
    endpoint: process.env.S3_ENDPOINT || undefined,
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // limit each IP to 100 requests per windowMs
  },
};

export default config; 