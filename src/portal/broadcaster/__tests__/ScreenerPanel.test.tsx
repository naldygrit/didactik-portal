import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { handlers } from '../../../mocks/handlers';
import { screenerRequests, session, users, watchlist } from '../../../mocks/db';
import { ScreenerPanel } from '../components/ScreenerPanel';

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  session.current = users.find((u) => u.username === 'broadcaster') ?? null;
  // Reset the broadcaster's runtime state so each test starts clean.
  watchlist[1] = [];
  screenerRequests[1] = [];
});

function renderPanel(slug = 'lagos-after-dark') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ScreenerPanel slug={slug} />
    </QueryClientProvider>,
  );
}

describe('ScreenerPanel', () => {
  it('renders the territory rights availability list', async () => {
    renderPanel();
    // Lagos After Dark has a Nigeria broadcast row marked Available.
    expect(await screen.findByText('Nigeria')).toBeInTheDocument();
    expect(screen.getAllByText('Available').length).toBeGreaterThan(0);
    // The France row is already licensed.
    expect(screen.getByText('France')).toBeInTheDocument();
    expect(screen.getByText('Licensed')).toBeInTheDocument();
  });

  it('shows an availability window date when one is set', async () => {
    renderPanel();
    // Pan-Africa SVOD opens 29 Jul 2026.
    expect(await screen.findByText(/Opens 29 Jul 2026/)).toBeInTheDocument();
  });

  it('requests a screener and confirms pending approval', async () => {
    renderPanel();
    await screen.findByText('Nigeria');
    fireEvent.click(screen.getByRole('button', { name: 'Request screener' }));
    expect(
      await screen.findByText(/Screener requested — pending approval/i),
    ).toBeInTheDocument();
  });

  it('adds the title to the watchlist', async () => {
    renderPanel();
    await screen.findByText('Nigeria');
    fireEvent.click(screen.getByRole('button', { name: /Add to watchlist/i }));
    expect(await screen.findByText(/On your watchlist/i)).toBeInTheDocument();
  });
});
