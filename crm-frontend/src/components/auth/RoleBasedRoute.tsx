import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  requiredRoles: string[];
  redirectTo?: string;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  requiredRoles,
  redirectTo = '/dashboard',
}) => {
  const { loading, hasPermission, isAuthenticated } = useAuth();
  
  // Development mode flag
  const DEV_MODE = true;

  // Show loading state or component
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // In development mode, bypass all checks
  if (DEV_MODE) {
    return <>{children}</>;
  }
  
  // In production mode, first check authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Then check role-based permission
  if (!hasPermission(requiredRoles)) {
    return <Navigate to={redirectTo} replace />;
  }

  // User is authenticated and has the required role
  return <>{children}</>;
};

export default RoleBasedRoute; 