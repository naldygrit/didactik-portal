import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function DashboardRedirect() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/portal/login" replace />;

  if (user.role === 'broadcaster_user') {
    return <Navigate to="/portal/broadcaster/dashboard" replace />;
  }
  if (user.role === 'production_company_user') {
    return <Navigate to="/portal/production/dashboard" replace />;
  }

  // admin_staff or unknown role — send to Django admin
  return <Navigate to="/admin/" replace />;
}
