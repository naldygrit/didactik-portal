import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { setupServer } from 'msw/node';
import { handlers } from '../../../mocks/handlers';
import { session, users } from '../../../mocks/db';
import { BroadcasterDashboardPage } from '../pages/DashboardPage';

// Renders the broadcaster browse surface against the mock API to prove the
// billboard, rails and detail modal actually mount with catalogue data.
const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  session.current = users.find((u) => u.username === 'broadcaster') ?? null;
});

function renderDashboard() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/portal/broadcaster/dashboard']}>
        <BroadcasterDashboardPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('broadcaster browse surface', () => {
  it('renders the billboard and rails from the catalogue', async () => {
    renderDashboard();
    // Billboard headline (the featured title)
    expect(await screen.findByRole('heading', { name: 'Lagos After Dark' })).toBeInTheDocument();
    // Rail titles
    expect(screen.getByText('Available to license')).toBeInTheDocument();
    expect(screen.getByText('Documentaries')).toBeInTheDocument();
  });

  it('opens the detail modal when a poster is selected', async () => {
    renderDashboard();
    await screen.findByRole('heading', { name: 'Lagos After Dark' });
    // Click a poster card (cards are buttons labelled with the title)
    const cards = screen.getAllByRole('button', { name: /The Salt Harvesters/i });
    fireEvent.click(cards[0]);
    // Modal dialog appears with the title and a screener CTA
    expect(await screen.findByRole('dialog', { name: 'The Salt Harvesters' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Request screener' })).toBeInTheDocument();
  });
});
