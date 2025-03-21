import api from './api';

export interface Company {
  id: string;
  name: string;
  domain?: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
}

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
 * Get a company by ID
 */
export const getCompany = async (id: string): Promise<Company> => {
  const response = await api.get(`/companies/${id}`);
  return response.data;
};

/**
 * Get all companies (with pagination)
 */
export const getCompanies = async (page = 1, limit = 10): Promise<{ companies: Company[], total: number }> => {
  const response = await api.get('/companies', {
    params: { page, limit }
  });
  return response.data;
};

/**
 * Create a new company
 */
export const createCompany = async (data: CompanyCreateInput): Promise<Company> => {
  const response = await api.post('/companies', data);
  return response.data;
};

/**
 * Update a company
 */
export const updateCompany = async (id: string, data: CompanyUpdateInput): Promise<Company> => {
  const response = await api.put(`/companies/${id}`, data);
  return response.data;
};

/**
 * Delete a company
 */
export const deleteCompany = async (id: string): Promise<void> => {
  await api.delete(`/companies/${id}`);
}; 