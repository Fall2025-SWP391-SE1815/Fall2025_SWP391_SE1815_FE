import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/useAuth.jsx';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  // If user is already authenticated, redirect based on role
  if (isAuthenticated && user) {
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'staff':
        return <Navigate to="/staff" replace />;
      case 'renter':
      default:
        return <Navigate to="/" replace />; // Renter về trang chủ
    }
  }
  
  return children;
};

export default PublicRoute;