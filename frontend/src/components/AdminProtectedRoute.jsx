import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppStore } from '../store/store';

export default function AdminProtectedRoute({ children }) {
  const { user, isAuthenticated } = useAppStore();

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
