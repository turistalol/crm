import { Box } from '@chakra-ui/react'
import { Routes, Route, Navigate } from 'react-router-dom'
import React from 'react'
import './App.css'

// Import pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import CompanySettings from './pages/CompanySettings'
import TeamsPage from './pages/TeamsPage'
import UserInvitationsPage from './pages/UserInvitationsPage'
import ChatPage from './pages/ChatPage'
import ChatSettingsPage from './pages/ChatSettingsPage'
import { AuthProvider, useAuth } from './context/AuthContext'
import RoleBasedRoute from './components/auth/RoleBasedRoute'

// Development mode flag - set to true to bypass login
const DEV_MODE = true;

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    // You could return a loading spinner here
    return <Box>Loading...</Box>;
  }
  
  // In development mode, always render children
  if (DEV_MODE) {
    return children;
  }
  
  // In production mode, check authentication
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// App Routes component separated to use auth context
const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={isAuthenticated || DEV_MODE ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated || DEV_MODE ? <Navigate to="/dashboard" replace /> : <Register />} />
      
      {/* Protected routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/company-settings" 
        element={
          <RoleBasedRoute requiredRoles={['ADMIN', 'MANAGER']}>
            <CompanySettings />
          </RoleBasedRoute>
        } 
      />
      <Route 
        path="/teams" 
        element={
          <ProtectedRoute>
            <TeamsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/teams/:teamId" 
        element={
          <ProtectedRoute>
            <TeamsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/invitations" 
        element={
          <ProtectedRoute>
            <UserInvitationsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/chat" 
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/chat-settings" 
        element={
          <ProtectedRoute>
            <ChatSettingsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/" 
        element={<Navigate to="/dashboard" replace />} 
      />
      <Route 
        path="*" 
        element={<Navigate to="/dashboard" replace />} 
      />
    </Routes>
  );
}

function App() {
  return (
    <Box minH="100vh">
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Box>
  )
}

export default App
