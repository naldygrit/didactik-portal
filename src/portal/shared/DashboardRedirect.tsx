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
  if (user.role === 'admin_staff') {
    return <Navigate to="/portal/admin/deals" replace />;
  }

  return <Navigate to="/portal/login" replace />;
}
