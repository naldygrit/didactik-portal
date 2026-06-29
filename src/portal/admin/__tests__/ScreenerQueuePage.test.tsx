import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { handlers } from '../../../mocks/handlers';
import { adminScreenerRequests, session, users } from '../../../mocks/db';
import { AdminScreenerQueuePage } from '../pages/ScreenerQueuePage';

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  session.current = users.find((u) => u.username === 'admin') ?? null;
  // Reset the first request to pending so the approve flow has work to do.
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
      <AdminScreenerQueuePage />
    </QueryClientProvider>,
  );
}

describe('AdminScreenerQueuePage', () => {
  it('lists requests with broadcaster identity and purpose', async () => {
    renderPage();
    expect(await screen.findByText('Canal+ International', { exact: false })).toBeInTheDocument();
    // The dense console renders the page title as a styled div, not a heading.
    expect(screen.getByText('Screeners')).toBeInTheDocument();
  });

  it('approves a pending request and removes its Approve action', async () => {
    renderPage();
    // Two requests start pending (Harmattan Letters, Lagos After Dark).
    const before = await screen.findAllByRole('button', { name: 'Approve' });
    expect(before).toHaveLength(2);
    fireEvent.click(before[0]);
    // After the refetch the approved request drops out of the pending actions.
    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: 'Approve' })).toHaveLength(1),
    );
  });
});
