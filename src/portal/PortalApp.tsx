import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './shared/AuthContext';
import { ProtectedRoute } from './shared/ProtectedRoute';
import { DashboardRedirect } from './shared/DashboardRedirect';
import { RecentlyViewedProvider } from './broadcaster/RecentlyViewedContext';
import { LoginPage } from './shared/LoginPage';
import { ApplyPage } from './onboarding/ApplyPage';
import { PortalLayout } from './shared/PortalLayout';
import { queryClient } from './shared/queryClient';
import { BroadcasterDashboardPage } from './broadcaster/pages/DashboardPage';
import { BroadcasterDiscoverPage } from './broadcaster/pages/DiscoverPage';
import { BroadcasterAssetDetailPage } from './broadcaster/pages/AssetDetailPage';
import { BroadcasterWatchlistPage } from './broadcaster/pages/WatchlistPage';
import { BroadcasterScreenerRequestsPage } from './broadcaster/pages/ScreenerRequestsPage';
import { BroadcasterOnboardingPage } from './broadcaster/pages/OnboardingPage';
import { ProductionDashboardPage } from './production/pages/DashboardPage';
import { ProductionAssetsPage } from './production/pages/AssetsPage';
import { ProductionScreenerRequestsPage } from './production/pages/ScreenerRequestsPage';
import { ProductionSubmitPage } from './production/pages/SubmitPage';
import { ProductionAssetDetailPage } from './production/pages/AssetDetailPage';
import { ProductionAnalyticsPage } from './production/pages/AnalyticsPage';
import { AdminOverviewPage } from './admin/pages/OverviewPage';
import { AdminScreenerQueuePage } from './admin/pages/ScreenerQueuePage';
import { AdminLibraryPage } from './admin/pages/LibraryPage';
import { AdminProductionCompaniesPage } from './admin/pages/ProductionCompaniesPage';
import { AdminBroadcastersPage } from './admin/pages/BroadcastersPage';
import { AdminPlaceholderPage } from './admin/pages/PlaceholderPage';

function PortalRoutes() {
  const { user } = useAuth();
  const isPC = user?.role === 'production_company_user';
  const isBC = user?.role === 'broadcaster_user';
  const isAdmin = user?.role === 'admin_staff';

  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="apply" element={<ApplyPage />} />
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
              <ProductionDashboardPage />
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
          path="production/screeners"
          element={
            <ProtectedRoute isAllowed={isPC}>
              <ProductionScreenerRequestsPage />
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
        <Route
          path="production/analytics"
          element={
            <ProtectedRoute isAllowed={isPC}>
              <ProductionAnalyticsPage />
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
          path="broadcaster/discover/:slug"
          element={
            <ProtectedRoute isAllowed={isBC}>
              <BroadcasterAssetDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="broadcaster/watchlist"
          element={
            <ProtectedRoute isAllowed={isBC}>
              <BroadcasterWatchlistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="broadcaster/screeners"
          element={
            <ProtectedRoute isAllowed={isBC}>
              <BroadcasterScreenerRequestsPage />
            </ProtectedRoute>
          }
        />
        {/* Legacy combined "My activity" path → watchlist. */}
        <Route
          path="broadcaster/licenses"
          element={<Navigate to="/portal/broadcaster/watchlist" replace />}
        />
        <Route
          path="broadcaster/onboarding"
          element={
            <ProtectedRoute isAllowed={isBC}>
              <BroadcasterOnboardingPage />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="admin/overview"
          element={
            <ProtectedRoute isAllowed={isAdmin}>
              <AdminOverviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/screeners"
          element={
            <ProtectedRoute isAllowed={isAdmin}>
              <AdminScreenerQueuePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/library"
          element={
            <ProtectedRoute isAllowed={isAdmin}>
              <AdminLibraryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/production"
          element={
            <ProtectedRoute isAllowed={isAdmin}>
              <AdminProductionCompaniesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/broadcasters"
          element={
            <ProtectedRoute isAllowed={isAdmin}>
              <AdminBroadcastersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/assets"
          element={
            <ProtectedRoute isAllowed={isAdmin}>
              <AdminPlaceholderPage
                title="Unvalidated assets"
                description="Assets awaiting QC review before their titles can go active."
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/analytics"
          element={
            <ProtectedRoute isAllowed={isAdmin}>
              <AdminPlaceholderPage
                title="Analytics"
                description="Platform-wide trends across content, screeners, and rights."
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/storage"
          element={
            <ProtectedRoute isAllowed={isAdmin}>
              <AdminPlaceholderPage
                title="Storage"
                description="Master and proxy storage usage across the archive."
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/events"
          element={
            <ProtectedRoute isAllowed={isAdmin}>
              <AdminPlaceholderPage
                title="Event log"
                description="Append-only audit trail of every state-changing action."
              />
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
        <RecentlyViewedProvider>
          <PortalRoutes />
        </RecentlyViewedProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
