import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { postLogout } from './auth';

export function PortalLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // The broadcaster browse experience is the dark "cinema" surface; production
  // and admin keep the light chrome they were built against.
  const pathname = useLocation().pathname;
  const cinema = pathname.includes('/broadcaster');

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
      <span style={{ color: cinema ? '#fff' : '#5343fd' }}>Didactik</span>
      <span className={cinema ? 'font-light text-white/70' : 'font-light text-gray-500'}>Media</span>
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

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center gap-6">
          {Brand}
          <nav className="hidden items-center gap-5 text-sm md:flex">
            {pathname.includes('/production') && (
              <>
                <NavLink to="/portal/production/assets" className={lightLink}>Assets</NavLink>
                <NavLink to="/portal/production/submit" className={lightLink}>Submit</NavLink>
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
