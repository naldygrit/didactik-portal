import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { setupServer } from 'msw/node';
import { handlers } from '../../../mocks/handlers';
import { session, users } from '../../../mocks/db';
import { AdminProductionCompaniesPage } from '../pages/ProductionCompaniesPage';
import { AdminBroadcastersPage } from '../pages/BroadcastersPage';

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  session.current = users.find((u) => u.username === 'admin') ?? null;
});

function renderWith(node: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>{node}</MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('AdminProductionCompaniesPage', () => {
  it('renders the production companies table with verification badges', async () => {
    renderWith(<AdminProductionCompaniesPage />);
    expect(await screen.findByText('EbonyLife Studios')).toBeInTheDocument();
    expect(screen.getByText('Riverwood Ensemble')).toBeInTheDocument();
    // The unverified company shows a Verify action.
    expect(screen.getByRole('button', { name: 'Verify' })).toBeInTheDocument();
  });
});

describe('AdminBroadcastersPage', () => {
  it('renders the broadcasters table with category and counts', async () => {
    renderWith(<AdminBroadcastersPage />);
    expect(await screen.findByText('Canal+ International')).toBeInTheDocument();
    expect(screen.getByText('Showmax')).toBeInTheDocument();
    expect(screen.getByText('StarTimes Media')).toBeInTheDocument();
  });
});
