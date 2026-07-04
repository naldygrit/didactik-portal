import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { handlers } from '../../../mocks/handlers';
import { session, users } from '../../../mocks/db';
import { AdminRevenuePage } from '../pages/RevenuePage';

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
      <AdminRevenuePage />
    </QueryClientProvider>,
  );
}

describe('AdminRevenuePage', () => {
  it('renders a real heading and a labeled deals table', async () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: 'Revenue' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Recent deals' })).toBeInTheDocument();

    const table = await screen.findByRole('table', { name: 'Recent deals' });
    expect(table).toBeInTheDocument();
  });
});
