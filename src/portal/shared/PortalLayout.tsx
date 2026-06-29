import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  FiHome,
  FiFilm,
  FiPlus,
  FiGrid,
  FiBook,
  FiClock,
  FiEye,
  FiVideo,
  FiRadio,
  FiShield,
  FiAlertTriangle,
  FiUploadCloud,
  FiTrendingUp,
  FiDatabase,
  FiList,
  FiDollarSign,
} from 'react-icons/fi';
import { useAuth } from './AuthContext';
import { postLogout } from './auth';
import { apiGet } from './apiHelpers';
import type { AdminDashboard, AdminOrganisations } from './types';

const PRODUCTION_NAV = [
  { to: '/portal/production/dashboard', label: 'Dashboard', Icon: FiHome },
  { to: '/portal/production/assets', label: 'My Catalogue', Icon: FiFilm },
  { to: '/portal/production/screeners', label: 'Screener Requests', Icon: FiEye },
  { to: '/portal/production/earnings', label: 'Earnings', Icon: FiDollarSign },
  { to: '/portal/production/submit', label: 'Submit New Title', Icon: FiPlus },
];

export function PortalLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // The broadcaster browse experience is the dark "cinema" surface; production
  // and admin keep the light chrome they were built against.
  const pathname = useLocation().pathname;
  // Match the portal PREFIX, not a bare substring — /portal/admin/broadcasters
  // contains "broadcaster" and must NOT fall into the dark cinema surface.
  const control = pathname.startsWith('/portal/admin');
  const cinema = pathname.startsWith('/portal/broadcaster');
  // Admin (control) is a Stripe-style light surface; only the cinema is dark.
  const dark = cinema;

  async function handleLogout() {
    await postLogout();
    logout();
    navigate('/portal/login', { replace: true });
  }

  const Brand = (
    <span className="flex items-center gap-2 text-lg font-bold tracking-tight">
      <span
        aria-hidden
        className="h-5 w-5 rounded-full"
        style={{ background: 'linear-gradient(135deg, #5343fd 0%, #3fd7ff 100%)' }}
      />
      <span style={{ color: dark ? '#fff' : '#5343fd' }}>Didactik</span>
      <span className={dark ? 'font-light text-white/70' : 'font-light text-gray-500'}>Media</span>
    </span>
  );

  if (cinema) {
    return (
      <div className="portal-cinema flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/5 bg-[var(--surface)]/80 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex items-center gap-6">
            {Brand}
            <nav className="hidden items-center gap-5 text-sm md:flex">
              <NavLink
                to="/portal/broadcaster/dashboard"
                className={({ isActive }) =>
                  isActive ? 'text-white' : 'text-[var(--muted)] transition-colors hover:text-white'
                }
              >
                Browse
              </NavLink>
              <NavLink
                to="/portal/broadcaster/watchlist"
                className={({ isActive }) =>
                  isActive ? 'text-white' : 'text-[var(--muted)] transition-colors hover:text-white'
                }
              >
                Watchlist
              </NavLink>
              <NavLink
                to="/portal/broadcaster/screeners"
                className={({ isActive }) =>
                  isActive ? 'text-white' : 'text-[var(--muted)] transition-colors hover:text-white'
                }
              >
                Screeners
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {user && <span className="hidden text-sm text-[var(--muted)] sm:inline">{user.email}</span>}
            <button
              onClick={handleLogout}
              className="text-sm text-[var(--muted)] transition-colors hover:text-white"
            >
              Sign out
            </button>
          </div>
        </header>
        <main className="flex-grow">
          <Outlet />
        </main>
      </div>
    );
  }

  if (control) {
    return (
      <div className="portal-control flex min-h-screen">
        {/* Dense grouped sidebar (200px), count badges from the live dashboard. */}
        <aside
          className="sticky top-0 hidden h-screen w-[200px] shrink-0 flex-col border-r py-3 md:flex"
          style={{ borderColor: 'var(--hairline)', background: 'var(--surface-raised)' }}
        >
          <div className="mb-2 border-b px-4 pb-3" style={{ borderColor: 'var(--hairline)' }}>
            {Brand}
          </div>
          <div className="flex-grow overflow-y-auto">
            <AdminSidebarNav />
          </div>
          <div className="mt-auto border-t px-3 py-3" style={{ borderColor: 'var(--hairline)' }}>
            <div className="flex items-center gap-2">
              <div
                aria-hidden
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
                style={{ background: 'var(--bg-accent)', color: 'var(--text-accent)' }}
              >
                {emailInitials(user?.email)}
              </div>
              <div className="min-w-0 flex-grow">
                {user && (
                  <p className="truncate text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {user.email}
                  </p>
                )}
                <button
                  onClick={handleLogout}
                  className="text-[11px] text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-grow flex-col">
          {/* Mobile top bar (sidebar collapses) */}
          <header
            className="flex items-center justify-between border-b px-4 py-3 md:hidden"
            style={{ borderColor: 'var(--hairline)' }}
          >
            {Brand}
            <button onClick={handleLogout} className="text-sm text-[var(--muted)]">
              Sign out
            </button>
          </header>
          <main className="flex-grow px-5 py-6 md:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  // Production: YouTube Studio-style left sidebar.
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
        <div className="px-4 py-4">{Brand}</div>
        <div className="px-3 pb-3">
          <Link
            to="/portal/production/submit"
            className="flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition-transform active:scale-[0.98]"
            style={{ backgroundColor: '#5343fd' }}
          >
            <FiPlus size={16} />
            Submit a title
          </Link>
        </div>
        <nav className="flex-grow space-y-0.5 px-2">
          {PRODUCTION_NAV.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-gray-100 font-medium text-gray-900'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-gray-200 px-4 py-3">
          {user && <p className="truncate text-xs text-gray-500">{user.email}</p>}
          <button
            onClick={handleLogout}
            className="mt-1 text-xs text-gray-500 transition-colors hover:text-gray-800"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-grow flex-col">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
          {Brand}
          <button onClick={handleLogout} className="text-sm text-gray-500">
            Sign out
          </button>
        </header>
        <main className="flex-grow p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

type BadgeTone = '' | 'warn' | 'danger' | 'accent';

// The admin grouped sidebar (Content / Screeners / Organisations …), with count
// badges derived from the live dashboard + organisations aggregates. Uses the
// ported .nav-* / .badge classes from admin.css (scoped under .portal-control).
function AdminSidebarNav() {
  const { data: dash } = useQuery<AdminDashboard>({
    queryKey: ['admin-dashboard'],
    queryFn: () => apiGet<AdminDashboard>('/api/v1/admin/dashboard/'),
  });
  const { data: orgs } = useQuery<AdminOrganisations>({
    queryKey: ['admin-organisations'],
    queryFn: () => apiGet<AdminOrganisations>('/api/v1/admin/organisations/'),
  });

  const underReview = dash?.content.by_status.under_review ?? 0;
  const changesRequested = dash?.content.by_status.changes_requested ?? 0;
  const unvalidatedAssets = dash?.assets.unvalidated ?? 0;
  const pendingScreeners = dash?.screeners.pending_queue ?? 0;
  const pcs = orgs?.production_companies ?? [];
  const bcs = orgs?.broadcasters ?? [];
  const unverified =
    pcs.filter((o) => o.verification_status !== 'verified').length +
    bcs.filter((o) => o.verification_status !== 'verified').length;

  return (
    <>
      <NavGroup>
        <NavItem to="/portal/admin/overview" label="Overview" Icon={FiGrid} />
      </NavGroup>

      <NavGroup label="Content">
        <NavItem
          to="/portal/admin/library"
          label="Library"
          Icon={FiBook}
          badge={dash?.content.total_titles}
        />
        <NavItem
          to="/portal/admin/library?status=under_review"
          label="Under review"
          Icon={FiClock}
          badge={underReview || undefined}
          tone="warn"
        />
        <NavItem
          to="/portal/admin/library?status=changes_requested"
          label="Changes requested"
          Icon={FiAlertTriangle}
          badge={changesRequested || undefined}
          tone="danger"
        />
        <NavItem
          to="/portal/admin/assets"
          label="Unvalidated assets"
          Icon={FiUploadCloud}
          badge={unvalidatedAssets || undefined}
          tone="warn"
        />
      </NavGroup>

      <NavGroup label="Screeners">
        <NavItem
          to="/portal/admin/screeners"
          label="All requests"
          Icon={FiEye}
          badge={pendingScreeners || undefined}
          tone="danger"
        />
      </NavGroup>

      <NavGroup label="Organisations">
        <NavItem
          to="/portal/admin/production"
          label="Production companies"
          Icon={FiVideo}
          badge={pcs.length || undefined}
        />
        <NavItem
          to="/portal/admin/broadcasters"
          label="Broadcasters"
          Icon={FiRadio}
          badge={bcs.length || undefined}
        />
        <NavItem
          to="/portal/admin/production?filter=unverified"
          label="Verifications"
          Icon={FiShield}
          badge={unverified || undefined}
          tone="warn"
        />
      </NavGroup>

      <NavGroup label="Platform">
        <NavItem to="/portal/admin/revenue" label="Revenue" Icon={FiDollarSign} />
        <NavItem to="/portal/admin/analytics" label="Analytics" Icon={FiTrendingUp} />
        <NavItem to="/portal/admin/storage" label="Storage" Icon={FiDatabase} />
        <NavItem to="/portal/admin/events" label="Event log" Icon={FiList} />
      </NavGroup>
    </>
  );
}

function NavGroup({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div className="nav-group">
      {label && <div className="nav-label">{label}</div>}
      {children}
    </div>
  );
}

// Query-aware active state: NavLink only matches pathname, so "Library" and
// "Under review" (same path, different ?status) would both light up. We match
// pathname AND the qualifying query so siblings are mutually exclusive.
function isNavActive(pathname: string, search: string, to: string): boolean {
  const [toPath, toQuery] = to.split('?');
  if (pathname !== toPath) return false;
  const params = new URLSearchParams(search);
  if (toQuery) {
    const [key, value] = toQuery.split('=');
    return params.get(key) === value;
  }
  // A base item is active only when no sibling's qualifying filter is present.
  return !params.has('status') && !params.has('filter');
}

// Two-letter initials from an email's local part, for the sidebar avatar.
function emailInitials(email: string | undefined): string {
  if (!email) return '?';
  const local = email.split('@')[0];
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return local.slice(0, 2).toUpperCase();
}

function NavItem({
  to,
  label,
  Icon,
  badge,
  tone = '',
}: {
  to: string;
  label: string;
  Icon: typeof FiBook;
  badge?: number;
  tone?: BadgeTone;
}) {
  const loc = useLocation();
  const active = isNavActive(loc.pathname, loc.search, to);
  return (
    <Link to={to} className={`nav-item ${active ? 'active' : ''}`}>
      <span className="left">
        <Icon size={15} />
        {label}
      </span>
      {badge !== undefined && <span className={`badge ${tone}`}>{badge}</span>}
    </Link>
  );
}
