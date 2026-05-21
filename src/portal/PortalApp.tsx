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
import { ProductionDashboardPage } from './production/pages/DashboardPage';
import { ProductionAssetsPage } from './production/pages/AssetsPage';
import { ProductionSubmitPage } from './production/pages/SubmitPage';
import { ProductionAssetDetailPage } from './production/pages/AssetDetailPage';

function PortalRoutes() {
  const { user } = useAuth();
  const isPC = user?.role === 'production_company_user';
  const isBC = user?.role === 'broadcaster_user';

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
              <Navigate to="/portal/broadcaster/discover" replace />
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

        {/* Legacy dashboard placeholder routes */}
        <Route
          path="production/dashboard-old"
          element={
            <ProtectedRoute isAllowed={isPC}>
              <ProductionDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="broadcaster/dashboard-old"
          element={
            <ProtectedRoute isAllowed={isBC}>
              <BroadcasterDashboardPage />
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
