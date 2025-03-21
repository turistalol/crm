import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configure to use mock data in development when server is unavailable
const useMockData = import.meta.env.DEV;

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // In development mode with connection errors, intercept and prevent errors from propagating
    if (useMockData && (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED')) {
      console.warn(`Mock mode: Intercepted request to ${error.config.url}`);
      
      // Get the request URL and method
      const url = error.config.url;
      const method = error.config.method.toUpperCase();
      const requestData = error.config.data ? JSON.parse(error.config.data) : {};
      
      // Create mock response based on the request
      let mockResponse: any = {
        data: [], // Default empty array response
        status: 200,
        statusText: 'OK (MOCKED)',
        headers: {},
        config: error.config,
      };
      
      // Handle team-related requests with more specific mock data
      if (url.includes('/teams')) {
        // Creating a team
        if (method === 'POST' && !url.includes('/members') && !url.includes('/invitations')) {
          const newTeam = {
            id: `mock-${Date.now()}`,
            name: requestData.name || 'New Mock Team',
            description: requestData.description || '',
            companyId: '1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          mockResponse.data = newTeam;
        }
        
        // Updating a team
        else if (method === 'PUT' && !url.includes('/members')) {
          const teamId = url.split('/').pop();
          const updatedTeam = {
            id: teamId,
            name: requestData.name || 'Updated Mock Team',
            description: requestData.description || '',
            companyId: '1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          mockResponse.data = updatedTeam;
        }
        
        // Getting team by ID
        else if (method === 'GET' && url.match(/\/teams\/[^\/]+$/)) {
          const teamId = url.split('/').pop();
          mockResponse.data = {
            id: teamId,
            name: 'Mock Team Details',
            description: 'This is a mock team generated when backend is unavailable',
            companyId: '1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            members: []
          };
        }
        
        // Getting user teams
        else if (method === 'GET' && url.includes('/teams/user')) {
          mockResponse.data = [
            {
              id: '1',
              name: 'Team Alpha',
              description: 'Sales team focusing on enterprise clients',
              companyId: '1',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: '2',
              name: 'Team Beta',
              description: 'Customer support and success team',
              companyId: '1',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ];
        }
        
        // Getting company teams
        else if (method === 'GET' && url.includes('/teams/company')) {
          mockResponse.data = [
            {
              id: '1',
              name: 'Team Alpha',
              description: 'Sales team focusing on enterprise clients',
              companyId: '1',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: '2',
              name: 'Team Beta',
              description: 'Customer support and success team',
              companyId: '1',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: '3',
              name: 'Team Gamma',
              description: 'Marketing and lead generation team',
              companyId: '1',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ];
        }
      }
      
      console.info('Mock response data:', mockResponse.data);
      return mockResponse;
    }
    
    const originalRequest = error.config;
    
    // If error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh-token`,
          { refreshToken }
        );
        
        const { token, refreshToken: newRefreshToken } = response.data;
        
        // Update tokens in storage
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Update Authorization header and retry request
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 