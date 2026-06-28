import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FiGrid, FiCheckSquare, FiLayers } from 'react-icons/fi';
import { useAuth } from './AuthContext';
import { postLogout } from './auth';

const ADMIN_NAV = [
  { to: '/portal/admin/overview', label: 'Overview', Icon: FiGrid },
  { to: '/portal/admin/deals', label: 'Deals desk', Icon: FiCheckSquare },
  { to: '/portal/admin/library', label: 'Library', Icon: FiLayers },
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

  const lightLink = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'font-medium text-gray-900' : 'text-gray-500 transition-colors hover:text-gray-900';

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
                Licences
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

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center gap-6">
          {Brand}
          <nav className="hidden items-center gap-5 text-sm md:flex">
            {pathname.includes('/production') && (
              <>
                <NavLink to="/portal/production/dashboard" className={lightLink}>Home</NavLink>
                <NavLink to="/portal/production/assets" className={lightLink}>Films</NavLink>
                <NavLink to="/portal/production/earnings" className={lightLink}>Earnings</NavLink>
              </>
            )}
            {pathname.includes('/admin') && (
              <NavLink to="/portal/admin/deals" className={lightLink}>Deals desk</NavLink>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user && <span className="text-sm text-gray-600">{user.email}</span>}
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 transition-colors hover:text-gray-800"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="flex-grow p-6">
        <Outlet />
      </main>
    </div>
  );
}
