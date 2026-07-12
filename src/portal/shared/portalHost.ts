/**
 * Host-aware portal routing.
 *
 * The app is one deployment behind four subdomains. On a dedicated audience
 * subdomain the portal is served at the ROOT (clean URLs — broadcaster.
 * didactikmedia.com/dashboard); on the unified `app.` host (and previews /
 * localhost) all three portals coexist under `/portal/<role>/…`.
 *
 * Every in-portal link goes through the builders here so the same components
 * render correctly on both. Auth is per-origin (mock session is localStorage /
 * in-memory), so each subdomain is its own login — fine for the demo.
 */

export type PortalKind = 'broadcaster' | 'production' | 'admin';

function currentHost(): string {
  return typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
}

/** The portal a dedicated subdomain serves, or `null` for the unified host. */
export function activePortal(host: string = currentHost()): PortalKind | null {
  if (host.startsWith('broadcaster.')) return 'broadcaster';
  if (host.startsWith('producer.')) return 'production';
  if (host.startsWith('admin.')) return 'admin';
  return null;
}

/** '' on a portal's own subdomain (clean root), '/portal/<kind>' on the unified host. */
function baseFor(kind: PortalKind): string {
  return activePortal() === kind ? '' : `/portal/${kind}`;
}

/**
 * Build an in-portal link.
 *   on broadcaster.  → portalLink('broadcaster','discover/x') === '/discover/x'
 *   on app.          → portalLink('broadcaster','discover/x') === '/portal/broadcaster/discover/x'
 */
export function portalLink(kind: PortalKind, path = ''): string {
  const base = baseFor(kind);
  const clean = path.replace(/^\//, '');
  return clean ? `${base}/${clean}` : base || '/';
}

export const bcLink = (path = '') => portalLink('broadcaster', path);
export const pcLink = (path = '') => portalLink('production', path);
export const adLink = (path = '') => portalLink('admin', path);

/** Login path for the current host: '/login' on a subdomain, '/portal/login' on the unified host. */
export function loginPath(): string {
  return activePortal() ? '/login' : '/portal/login';
}

/** Signup/apply path for the current host: '/signup' on a subdomain, '/portal/apply' on the unified host. */
export function signupPath(): string {
  return activePortal() ? '/signup' : '/portal/apply';
}

/** Portal home (DashboardRedirect): '/' on a subdomain, '/portal' on the unified host. */
export function portalHome(): string {
  return activePortal() ? '/' : '/portal';
}
