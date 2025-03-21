import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';
import { getToken, parseJwt, isTokenExpired, getUserFromToken } from '../utils/auth';
import { Role } from '../types/enums';

interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: Role;
  companyId: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  hasPermission: (requiredRoles: string[]) => boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  error: null,
  setError: () => {},
  hasPermission: () => false,
});

// Function to check if current user has the required role
const checkUserPermission = (userRole: string | undefined, requiredRoles: string[]): boolean => {
  if (!userRole) return false;
  // If requiredRoles is empty, allow access
  if (requiredRoles.length === 0) return true;
  // Check if user role is in the required roles list
  return requiredRoles.includes(userRole);
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Development mode flag - set to true to bypass login
  const DEV_MODE = true;
  
  // Create a mock user for development mode
  const mockUser: User = {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    firstName: 'Admin',
    lastName: 'User',
    role: Role.ADMIN,
    companyId: '1',
  };

  const [user, setUser] = useState<User | null>(DEV_MODE ? mockUser : null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(DEV_MODE);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Only check token in non-DEV_MODE
  useEffect(() => {
    const initAuth = async () => {
      if (DEV_MODE) {
        setLoading(false);
        return;
      }
      
      const token = getToken();
      
      if (token && !isTokenExpired()) {
        try {
          const userData = getUserFromToken();
          if (userData) {
            // If name contains a space, try to extract first and last name
            let firstName = '';
            let lastName = '';
            if (userData.name && userData.name.includes(' ')) {
              const nameParts = userData.name.split(' ');
              firstName = nameParts[0];
              lastName = nameParts.slice(1).join(' ');
            } else {
              firstName = userData.name || '';
            }
            
            const mappedUser: User = {
              id: userData.userId,
              email: userData.email,
              name: userData.name || '',
              firstName,
              lastName,
              role: userData.role as Role,
              companyId: userData.companyId || '',
            };
            setUser(mappedUser);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Failed to parse user data from token:', error);
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);
  
  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login({ email, password });
      
      // Extract first and last name
      const firstName = response.user.firstName || '';
      const lastName = response.user.lastName || '';
      
      // Map from authService User to AuthContext User
      const mappedUser: User = {
        id: response.user.id,
        email: response.user.email,
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        role: response.user.role as Role,
        companyId: '', // Set default or extract from token if available
      };
      setUser(mappedUser);
      setIsAuthenticated(true);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const logout = async (): Promise<void> => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };
  
  // Check if user has the required role
  const hasPermission = (requiredRoles: string[]): boolean => {
    // In development mode, always return true
    if (DEV_MODE) {
      return true;
    }
    return checkUserPermission(user?.role, requiredRoles);
  };
  
  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    error,
    setError,
    hasPermission,
    register: async (
      firstName: string,
      lastName: string,
      email: string,
      password: string
    ): Promise<void> => {
      // Placeholder implementation
    },
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider; 