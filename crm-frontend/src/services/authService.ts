import api from './api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  storeTokens(response.data.token, response.data.refreshToken);
  storeUserData(response.data.user);
  return response.data;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', data);
  storeTokens(response.data.token, response.data.refreshToken);
  storeUserData(response.data.user);
  return response.data;
};

export const logout = async (): Promise<void> => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken) {
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
  clearTokens();
  clearUserData();
};

export const refreshToken = async (): Promise<AuthResponse> => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  const response = await api.post<AuthResponse>('/auth/refresh-token', { refreshToken });
  storeTokens(response.data.token, response.data.refreshToken);
  storeUserData(response.data.user);
  return response.data;
};

// Helper functions to store and retrieve tokens
const storeTokens = (token: string, refreshToken: string): void => {
  localStorage.setItem('token', token);
  localStorage.setItem('refreshToken', refreshToken);
};

export const clearTokens = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper functions to store and retrieve user data
const storeUserData = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

const clearUserData = (): void => {
  localStorage.removeItem('user');
};

export const getUserData = (): User | null => {
  const userData = localStorage.getItem('user');
  if (!userData) return null;
  
  try {
    return JSON.parse(userData) as User;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}; 