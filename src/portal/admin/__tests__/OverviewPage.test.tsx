import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { handlers } from '../../../mocks/handlers';
import { session, users } from '../../../mocks/db';
import { AdminOverviewPage } from '../pages/OverviewPage';

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  session.current = users.find((u) => u.username === 'admin') ?? null;
});

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <AdminOverviewPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('AdminOverviewPage', () => {
  it('renders the KPI grid and the triage queue from the dashboard', async () => {
    renderPage();
    // KPI label (the panel card also uses "Screeners pending", so this is the
    // unambiguous KPI check).
    expect(await screen.findByText('Total titles')).toBeInTheDocument();
    expect(screen.getAllByText('Screeners pending').length).toBeGreaterThan(0);
    // A triage submission (lowest-score-first; Riverwood Nights is score 47).
    expect(await screen.findByText('Riverwood Nights')).toBeInTheDocument();
  });

  it('shows organisations awaiting verification and rights coverage bars', async () => {
    renderPage();
    // Celluloïde Dakar is the unverified (pending) production company.
    expect(await screen.findByText('Organisations awaiting verification')).toBeInTheDocument();
    // The pending production company appears in both the verification panel and
    // the activity panel, so there are multiple matches.
    await waitFor(() =>
      expect(screen.getAllByText('Celluloïde Dakar', { exact: false }).length).toBeGreaterThan(0),
    );
    expect(screen.getByText('Rights coverage by territory')).toBeInTheDocument();
  });

  it('renders the page title and every card title as real headings', async () => {
    renderPage();
    expect(await screen.findByRole('heading', { level: 1, name: 'Overview' })).toBeInTheDocument();
    ['Triage queue', 'Screeners pending', 'Organisations awaiting verification']
      .forEach((name) => expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument());
  });
});
