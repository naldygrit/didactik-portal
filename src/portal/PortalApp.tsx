import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './shared/AuthContext';
import { ProtectedRoute } from './shared/ProtectedRoute';
import { DashboardRedirect } from './shared/DashboardRedirect';
import { LoginPage } from './shared/LoginPage';
import { PortalLayout } from './shared/PortalLayout';
import { queryClient } from './shared/queryClient';
import { BroadcasterDashboardPage } from './broadcaster/pages/DashboardPage';
import { BroadcasterDiscoverPage } from './broadcaster/pages/DiscoverPage';
import { BroadcasterAssetDetailPage } from './broadcaster/pages/AssetDetailPage';
import { BroadcasterLicensesPage } from './broadcaster/pages/LicensesPage';
import { ProductionDashboardPage } from './production/pages/DashboardPage';
import { ProductionAssetsPage } from './production/pages/AssetsPage';
import { ProductionSubmitPage } from './production/pages/SubmitPage';
import { ProductionAssetDetailPage } from './production/pages/AssetDetailPage';
import { AdminDealsPage } from './admin/pages/DealsPage';

function PortalRoutes() {
  const { user } = useAuth();
  const isPC = user?.role === 'production_company_user';
  const isBC = user?.role === 'broadcaster_user';
  const isAdmin = user?.role === 'admin_staff';

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
        {/* Production company routes */}
        <Route
          path="production/dashboard"
          element={
            <ProtectedRoute isAllowed={isPC}>
              <Navigate to="/portal/production/assets" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="production/assets"
          element={
            <ProtectedRoute isAllowed={isPC}>
              <ProductionAssetsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="production/assets/:id"
          element={
            <ProtectedRoute isAllowed={isPC}>
              <ProductionAssetDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="production/submit"
          element={
            <ProtectedRoute isAllowed={isPC}>
              <ProductionSubmitPage />
            </ProtectedRoute>
          }
        />

        {/* Broadcaster routes */}
        <Route
          path="broadcaster/dashboard"
          element={
            <ProtectedRoute isAllowed={isBC}>
              <BroadcasterDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="broadcaster/discover"
          element={
            <ProtectedRoute isAllowed={isBC}>
              <BroadcasterDiscoverPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="broadcaster/discover/:id"
          element={
            <ProtectedRoute isAllowed={isBC}>
              <BroadcasterAssetDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="broadcaster/licenses"
          element={
            <ProtectedRoute isAllowed={isBC}>
              <BroadcasterLicensesPage />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="admin/deals"
          element={
            <ProtectedRoute isAllowed={isAdmin}>
              <AdminDealsPage />
            </ProtectedRoute>
          }
        />

        {/* Legacy dashboard placeholder routes */}
        <Route
          path="production/dashboard-old"
          element={
            <ProtectedRoute isAllowed={isPC}>
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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PortalRoutes />
      </AuthProvider>
    </QueryClientProvider>
  );
}
