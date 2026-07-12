import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { adLink, bcLink, loginPath, pcLink } from './portalHost';

export function DashboardRedirect() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to={loginPath()} replace />;

  if (user.role === 'broadcaster_user') {
    return <Navigate to={bcLink('dashboard')} replace />;
  }
  if (user.role === 'production_company_user') {
    return <Navigate to={pcLink('dashboard')} replace />;
  }
  if (user.role === 'admin_staff') {
    return <Navigate to={adLink('overview')} replace />;
  }

  return <Navigate to={loginPath()} replace />;
}
