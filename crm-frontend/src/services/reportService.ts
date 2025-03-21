import api from './api';
import { 
  Report, 
  CreateReportDto, 
  UpdateReportDto, 
  PipelineMetrics, 
  TeamPerformanceMetrics 
} from '../types/api';

/**
 * Service for handling report-related API calls
 */
class ReportService {
  /**
   * Get all reports for a company
   */
  async getReports(companyId: string): Promise<Report[]> {
    const response = await api.get(`/reports?companyId=${companyId}`);
    return response.data;
  }

  /**
   * Get a specific report by ID
   */
  async getReportById(id: string): Promise<Report> {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  }

  /**
   * Create a new report
   */
  async createReport(data: CreateReportDto): Promise<Report> {
    const response = await api.post('/reports', data);
    return response.data;
  }

  /**
   * Update an existing report
   */
  async updateReport(id: string, data: UpdateReportDto): Promise<Report> {
    const response = await api.put(`/reports/${id}`, data);
    return response.data;
  }

  /**
   * Delete a report
   */
  async deleteReport(id: string): Promise<void> {
    await api.delete(`/reports/${id}`);
  }

  /**
   * Get pipeline performance metrics
   */
  async getPipelineMetrics(
    pipelineId: string, 
    dateRange?: { start: Date; end: Date }
  ): Promise<PipelineMetrics> {
    let url = `/metrics/pipeline/${pipelineId}`;
    
    if (dateRange) {
      url += `?start=${dateRange.start.toISOString()}&end=${dateRange.end.toISOString()}`;
    }
    
    const response = await api.get(url);
    return response.data;
  }

  /**
   * Get team performance metrics
   */
  async getTeamPerformanceMetrics(
    teamId: string, 
    dateRange?: { start: Date; end: Date }
  ): Promise<TeamPerformanceMetrics> {
    let url = `/metrics/team/${teamId}`;
    
    if (dateRange) {
      url += `?start=${dateRange.start.toISOString()}&end=${dateRange.end.toISOString()}`;
    }
    
    const response = await api.get(url);
    return response.data;
  }
}

export default new ReportService(); 