import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, userData } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!userData) {
    return <LoadingSpinner />;
  }

  if (allowedRoles && !allowedRoles.includes(userData.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;