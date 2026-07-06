import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { setupServer } from 'msw/node';
import { handlers } from '../../../mocks/handlers';
import { session, users } from '../../../mocks/db';
import { BroadcasterDashboardPage } from '../pages/DashboardPage';
import { RecentlyViewedProvider } from '../RecentlyViewedContext';

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
      <RecentlyViewedProvider>
        <MemoryRouter initialEntries={['/portal/broadcaster/dashboard']}>
          <BroadcasterDashboardPage />
        </MemoryRouter>
      </RecentlyViewedProvider>
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

  it('searching replaces the billboard/rails with matching results from the real ?q= handler', async () => {
    renderDashboard();
    await screen.findByRole('heading', { name: 'Lagos After Dark' });

    fireEvent.change(screen.getByLabelText('Search the catalogue'), {
      target: { value: 'Harmattan' },
    });

    expect(await screen.findByText('Results for "Harmattan"')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Harmattan Letters/i })).toBeInTheDocument();
    // Billboard and rails are gone while searching.
    expect(screen.queryByRole('heading', { name: 'Lagos After Dark' })).not.toBeInTheDocument();
    expect(screen.queryByText('Documentaries')).not.toBeInTheDocument();
  });

  it('clearing the search restores the normal browse view', async () => {
    renderDashboard();
    await screen.findByRole('heading', { name: 'Lagos After Dark' });

    const search = screen.getByLabelText('Search the catalogue');
    fireEvent.change(search, { target: { value: 'Harmattan' } });
    await screen.findByText('Results for "Harmattan"');

    fireEvent.change(search, { target: { value: '' } });

    expect(await screen.findByRole('heading', { name: 'Lagos After Dark' })).toBeInTheDocument();
    expect(screen.getByText('Documentaries')).toBeInTheDocument();
  });
});
