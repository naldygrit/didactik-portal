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
import { activePortal, bcLink } from './shared/portalHost';
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
import { ProductionEarningsPage } from './production/pages/EarningsPage';
import { AdminOverviewPage } from './admin/pages/OverviewPage';
import { AdminScreenerQueuePage } from './admin/pages/ScreenerQueuePage';
import { AdminLibraryPage } from './admin/pages/LibraryPage';
import { AdminProductionCompaniesPage } from './admin/pages/ProductionCompaniesPage';
import { AdminBroadcastersPage } from './admin/pages/BroadcastersPage';
import { AdminPlaceholderPage } from './admin/pages/PlaceholderPage';
import { AdminRevenuePage } from './admin/pages/RevenuePage';

function PortalRoutes() {
  const { user } = useAuth();
  const isPC = user?.role === 'production_company_user';
  const isBC = user?.role === 'broadcaster_user';
  const isAdmin = user?.role === 'admin_staff';

  // Route-path prefix per portal: '' on that portal's own subdomain (clean root
  // URLs), '<kind>/' on the unified host, null → not served on this host (a
  // different audience subdomain), so we don't mount it and paths can't collide.
  const active = activePortal();
  const pcP = active === 'production' ? '' : active === null ? 'production/' : null;
  const bcP = active === 'broadcaster' ? '' : active === null ? 'broadcaster/' : null;
  const adP = active === 'admin' ? '' : active === null ? 'admin/' : null;

  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="signup" element={<ApplyPage />} />
      <Route path="apply" element={<ApplyPage />} />
      <Route path="" element={<DashboardRedirect />} />
      <Route
        element={
          <ProtectedRoute isAllowed={user !== null}>
            <PortalLayout />
          </ProtectedRoute>
        }
      >
        {/* Production company */}
        {pcP !== null && (
          <>
            <Route path={`${pcP}dashboard`} element={<ProtectedRoute isAllowed={isPC}><ProductionDashboardPage /></ProtectedRoute>} />
            <Route path={`${pcP}assets`} element={<ProtectedRoute isAllowed={isPC}><ProductionAssetsPage /></ProtectedRoute>} />
            <Route path={`${pcP}assets/:id`} element={<ProtectedRoute isAllowed={isPC}><ProductionAssetDetailPage /></ProtectedRoute>} />
            <Route path={`${pcP}screeners`} element={<ProtectedRoute isAllowed={isPC}><ProductionScreenerRequestsPage /></ProtectedRoute>} />
            <Route path={`${pcP}submit`} element={<ProtectedRoute isAllowed={isPC}><ProductionSubmitPage /></ProtectedRoute>} />
            <Route path={`${pcP}analytics`} element={<ProtectedRoute isAllowed={isPC}><ProductionAnalyticsPage /></ProtectedRoute>} />
            <Route path={`${pcP}earnings`} element={<ProtectedRoute isAllowed={isPC}><ProductionEarningsPage /></ProtectedRoute>} />
          </>
        )}

        {/* Broadcaster */}
        {bcP !== null && (
          <>
            <Route path={`${bcP}dashboard`} element={<ProtectedRoute isAllowed={isBC}><BroadcasterDashboardPage /></ProtectedRoute>} />
            <Route path={`${bcP}discover`} element={<ProtectedRoute isAllowed={isBC}><BroadcasterDiscoverPage /></ProtectedRoute>} />
            <Route path={`${bcP}discover/:slug`} element={<ProtectedRoute isAllowed={isBC}><BroadcasterAssetDetailPage /></ProtectedRoute>} />
            <Route path={`${bcP}watchlist`} element={<ProtectedRoute isAllowed={isBC}><BroadcasterWatchlistPage /></ProtectedRoute>} />
            <Route path={`${bcP}screeners`} element={<ProtectedRoute isAllowed={isBC}><BroadcasterScreenerRequestsPage /></ProtectedRoute>} />
            {/* Legacy combined "My activity" path → watchlist. */}
            <Route path={`${bcP}licenses`} element={<Navigate to={bcLink('watchlist')} replace />} />
            <Route path={`${bcP}onboarding`} element={<ProtectedRoute isAllowed={isBC}><BroadcasterOnboardingPage /></ProtectedRoute>} />
          </>
        )}

        {/* Admin */}
        {adP !== null && (
          <>
            <Route path={`${adP}overview`} element={<ProtectedRoute isAllowed={isAdmin}><AdminOverviewPage /></ProtectedRoute>} />
            <Route path={`${adP}screeners`} element={<ProtectedRoute isAllowed={isAdmin}><AdminScreenerQueuePage /></ProtectedRoute>} />
            <Route path={`${adP}library`} element={<ProtectedRoute isAllowed={isAdmin}><AdminLibraryPage /></ProtectedRoute>} />
            <Route path={`${adP}production`} element={<ProtectedRoute isAllowed={isAdmin}><AdminProductionCompaniesPage /></ProtectedRoute>} />
            <Route path={`${adP}broadcasters`} element={<ProtectedRoute isAllowed={isAdmin}><AdminBroadcastersPage /></ProtectedRoute>} />
            <Route path={`${adP}assets`} element={<ProtectedRoute isAllowed={isAdmin}><AdminPlaceholderPage title="Unvalidated assets" description="Assets awaiting QC review before their titles can go active." /></ProtectedRoute>} />
            <Route path={`${adP}revenue`} element={<ProtectedRoute isAllowed={isAdmin}><AdminRevenuePage /></ProtectedRoute>} />
            <Route path={`${adP}analytics`} element={<ProtectedRoute isAllowed={isAdmin}><AdminPlaceholderPage title="Analytics" description="Platform-wide trends across content, screeners, and rights." /></ProtectedRoute>} />
            <Route path={`${adP}storage`} element={<ProtectedRoute isAllowed={isAdmin}><AdminPlaceholderPage title="Storage" description="Master and proxy storage usage across the archive." /></ProtectedRoute>} />
            <Route path={`${adP}events`} element={<ProtectedRoute isAllowed={isAdmin}><AdminPlaceholderPage title="Event log" description="Append-only audit trail of every state-changing action." /></ProtectedRoute>} />
          </>
        )}
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
