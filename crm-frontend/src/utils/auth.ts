/**
 * Utility functions for handling authentication
 */

// Get the authentication token from local storage
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Set the authentication token in local storage
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// Remove the authentication token from local storage
export const removeToken = (): void => {
  localStorage.removeItem('token');
};

// Get authentication headers for API requests
export const getAuthHeaders = (): Record<string, string> => {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Parse JWT token to get payload data
export const parseJwt = (token: string): any => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

// Get user information from JWT token
export const getUserFromToken = (): any => {
  const token = getToken();
  if (!token) return null;
  
  const parsedToken = parseJwt(token);
  if (!parsedToken) return null;
  
  return {
    userId: parsedToken.userId,
    email: parsedToken.email,
    role: parsedToken.role
  };
};

// Check if token is expired
export const isTokenExpired = (): boolean => {
  const token = getToken();
  if (!token) return true;
  
  const parsedToken = parseJwt(token);
  if (!parsedToken) return true;
  
  // exp is in seconds, multiply by 1000 to get milliseconds
  const expirationTime = parsedToken.exp * 1000;
  const currentTime = Date.now();
  
  return currentTime > expirationTime;
}; 