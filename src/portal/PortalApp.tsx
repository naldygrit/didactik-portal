import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './shared/AuthContext';
import { ProtectedRoute } from './shared/ProtectedRoute';
import { DashboardRedirect } from './shared/DashboardRedirect';
import { LoginPage } from './shared/LoginPage';
import { PortalLayout } from './shared/PortalLayout';
import { BroadcasterDashboardPage } from './broadcaster/pages/DashboardPage';
import { ProductionDashboardPage } from './production/pages/DashboardPage';

function PortalRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="" element={<DashboardRedirect />} />
      <Route
        element={
          <ProtectedRoute isAllowed={user !== null}>
            <PortalLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="broadcaster/dashboard"
          element={
            <ProtectedRoute isAllowed={user?.role === 'broadcaster_user'}>
              <BroadcasterDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="production/dashboard"
          element={
            <ProtectedRoute isAllowed={user?.role === 'production_company_user'}>
              <ProductionDashboardPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default function PortalApp() {
  return (
    <AuthProvider>
      <PortalRoutes />
    </AuthProvider>
  );
}
