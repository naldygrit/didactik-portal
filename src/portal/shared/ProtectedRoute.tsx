import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  isAllowed: boolean;
  redirectTo?: string;
  children: ReactNode;
}

export function ProtectedRoute({
  isAllowed,
  redirectTo = '/portal/login',
  children,
}: ProtectedRouteProps) {
  const { loading } = useAuth();

  // Hold render during the silent-refresh attempt on mount so the user
  // doesn't see a login flash before the session is restored.
  if (loading) return null;

  if (!isAllowed) return <Navigate to={redirectTo} replace />;

  return <>{children}</>;
}
