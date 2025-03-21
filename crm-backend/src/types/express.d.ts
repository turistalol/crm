import { Company, User } from '@prisma/client';

declare namespace Express {
  export interface Request {
    user?: User;
    company?: Company;
    apiKeyId?: string;
  }
} 