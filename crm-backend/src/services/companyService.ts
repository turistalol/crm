import { PrismaClient, Prisma } from '@prisma/client';
import prisma from '../utils/database';
import { logger } from '../utils/logger';

// Define Company type based on Prisma schema
type Company = {
  id: string;
  name: string;
  domain?: string | null;
  logo?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export interface CompanyCreateInput {
  name: string;
  domain?: string;
  logo?: string;
}

export interface CompanyUpdateInput {
  name?: string;
  domain?: string;
  logo?: string;
}

/**
 * Service for managing company operations
 */
export class CompanyService {
  /**
   * Create a new company
   */
  async createCompany(data: CompanyCreateInput): Promise<Company> {
    try {
      logger.info(`Creating new company: ${data.name}`);
      
      const company = await prisma.company.create({
        data
      });
      
      return company;
    } catch (error) {
      logger.error(`Error creating company: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Get company by ID
   */
  async getCompanyById(id: string): Promise<Company | null> {
    try {
      return await prisma.company.findUnique({
        where: { id }
      });
    } catch (error) {
      logger.error(`Error fetching company by ID: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Get all companies with pagination
   */
  async getAllCompanies(
    page: number = 1,
    limit: number = 10
  ): Promise<{ companies: Company[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      
      const [companies, total] = await Promise.all([
        prisma.company.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.company.count()
      ]);
      
      return { companies, total };
    } catch (error) {
      logger.error(`Error fetching companies: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Update company by ID
   */
  async updateCompany(id: string, data: CompanyUpdateInput): Promise<Company> {
    try {
      logger.info(`Updating company ${id}`);
      
      return await prisma.company.update({
        where: { id },
        data
      });
    } catch (error) {
      logger.error(`Error updating company: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Delete company by ID
   */
  async deleteCompany(id: string): Promise<Company> {
    try {
      logger.info(`Deleting company ${id}`);
      
      return await prisma.company.delete({
        where: { id }
      });
    } catch (error) {
      logger.error(`Error deleting company: ${(error as Error).message}`);
      throw error;
    }
  }
} 