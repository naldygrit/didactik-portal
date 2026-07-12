import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from '../App';

function setHost(hostname: string) {
  Object.defineProperty(window, 'location', {
    value: { hostname },
    writable: true,
    configurable: true,
  });
}

function renderAt(path: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('per-subdomain routing', () => {
  it('broadcaster subdomain serves the portal at the root — a protected clean path redirects to /login', async () => {
    // Exercises the conditional route fragments: on this host only the broadcaster
    // routes mount and the production/admin fragments are `false` inside <Routes>.
    setHost('broadcaster.didactikmedia.com');
    renderAt('/dashboard');
    await waitFor(() =>
      expect(screen.getByText('Sign in to your portal')).toBeInTheDocument(),
    );
  });

  it('unified host still mounts the portals under /portal/*', async () => {
    setHost('app.didactikmedia.com');
    renderAt('/portal/broadcaster/dashboard');
    await waitFor(() =>
      expect(screen.getByText('Sign in to your portal')).toBeInTheDocument(),
    );
  });
});
