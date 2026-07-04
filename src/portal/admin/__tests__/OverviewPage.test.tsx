import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse, delay } from 'msw';
import { setupServer } from 'msw/node';
import { handlers } from '../../../mocks/handlers';
import { adminScreenerRequests, session, users } from '../../../mocks/db';
import { AdminOverviewPage } from '../pages/OverviewPage';

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  session.current = users.find((u) => u.username === 'admin') ?? null;
  // Reset the first request to pending, since another test in this file
  // mutates it to 'approved'.
  const req = adminScreenerRequests.find((r) => r.uuid === '00000000-0000-0000-0000-0000000000a1');
  if (req) {
    req.status = 'pending';
    req.reviewed_at = null;
    req.access_expires_at = null;
  }
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

  it('disables only the row whose Approve is actually in flight, not every row', async () => {
    // Same bug as ScreenerQueuePage: approve/decline were one shared
    // useMutation instance, so approve.isPending disabled every row's
    // button when only one request was in flight.
    server.use(
      http.post('/api/v1/admin/screener-requests/:uuid/approve/', async ({ params }) => {
        await delay(50);
        const req = adminScreenerRequests.find((r) => r.uuid === params.uuid);
        if (req) req.status = 'approved';
        return HttpResponse.json(req ?? {});
      }),
    );
    renderPage();
    const [firstApprove, secondApprove] = await screen.findAllByRole('button', { name: 'Approve' });

    fireEvent.click(firstApprove);
    await waitFor(() => expect(firstApprove).toBeDisabled());
    expect(secondApprove).not.toBeDisabled();

    await waitFor(() => expect(firstApprove).not.toBeInTheDocument());
  });
});
