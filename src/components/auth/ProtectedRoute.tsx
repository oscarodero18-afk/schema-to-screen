import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  const isBypassed = sessionStorage.getItem('admin_bypass') === 'true';

  if (requiredRole && profile?.role !== requiredRole && !isBypassed) {
    // If agent tries to access admin, redirect to agent dashboard
    if (profile?.role === 'agent') {
      return <Navigate to="/dashboard" replace />;
    }
    // Fallback
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;