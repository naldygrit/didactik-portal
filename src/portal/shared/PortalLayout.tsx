import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  FiGrid,
  FiCheckSquare,
  FiLayers,
  FiHome,
  FiFilm,
  FiBarChart2,
  FiDollarSign,
  FiPlus,
} from 'react-icons/fi';
import { useAuth } from './AuthContext';
import { postLogout } from './auth';

const ADMIN_NAV = [
  { to: '/portal/admin/overview', label: 'Overview', Icon: FiGrid },
  { to: '/portal/admin/deals', label: 'Deals desk', Icon: FiCheckSquare },
  { to: '/portal/admin/library', label: 'Library', Icon: FiLayers },
];

const PRODUCTION_NAV = [
  { to: '/portal/production/dashboard', label: 'Dashboard', Icon: FiHome },
  { to: '/portal/production/assets', label: 'Content', Icon: FiFilm },
  { to: '/portal/production/analytics', label: 'Analytics', Icon: FiBarChart2 },
  { to: '/portal/production/earnings', label: 'Earnings', Icon: FiDollarSign },
];

export function PortalLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // The broadcaster browse experience is the dark "cinema" surface; production
  // and admin keep the light chrome they were built against.
  const pathname = useLocation().pathname;
  const cinema = pathname.includes('/broadcaster');
  const control = pathname.includes('/admin');
  const dark = cinema || control;

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
                to="/portal/broadcaster/licenses"
                className={({ isActive }) =>
                  isActive ? 'text-white' : 'text-[var(--muted)] transition-colors hover:text-white'
                }
              >
                My activity
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
        {/* Linear-style left sidebar */}
        <aside
          className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r md:flex"
          style={{ borderColor: 'var(--hairline)' }}
        >
          <div className="px-4 py-4">{Brand}</div>
          <nav className="flex-grow space-y-0.5 px-2">
            {ADMIN_NAV.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-[var(--surface-hover)] text-[var(--ink)]'
                      : 'text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--ink)]'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="border-t px-4 py-3" style={{ borderColor: 'var(--hairline)' }}>
            {user && <p className="truncate text-xs text-[var(--muted)]">{user.email}</p>}
            <button
              onClick={handleLogout}
              className="mt-1 text-xs text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
            >
              Sign out
            </button>
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
          <main className="flex-grow px-5 py-8 md:px-10">
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
