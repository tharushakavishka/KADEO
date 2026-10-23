import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const SellerProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8F5]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#10B981] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-neutral-500">Restoring session...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || (role !== 'seller' && role !== 'admin')) {
    return (
      <Navigate
        to={`/seller/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  return <>{children}</>;
};

export const AdminProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8F5]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#10B981] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-neutral-500">Restoring session...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || role !== 'admin') {
    return (
      <Navigate
        to={`/admin/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  return <>{children}</>;
};
