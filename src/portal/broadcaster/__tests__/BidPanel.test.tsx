import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { handlers } from '../../../mocks/handlers';
import { bids, session, users } from '../../../mocks/db';
import { BidPanel } from '../components/BidPanel';

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  session.current = users.find((u) => u.username === 'broadcaster') ?? null;
  for (let i = bids.length - 1; i >= 0; i--) {
    if (bids[i].broadcaster_id === 1) bids.splice(i, 1);
  }
});

function renderPanel() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <BidPanel assetId={101} />
    </QueryClientProvider>,
  );
}

describe('BidPanel', () => {
  it('shows the licensing range and the rival top bid', async () => {
    renderPanel();
    expect(await screen.findByText(/Licensing range/i)).toBeInTheDocument();
    // Lagos After Dark's seeded top rival bid is $14,500.
    expect(await screen.findByText('$14,500')).toBeInTheDocument();
  });

  it('places a leading bid within range and reflects it', async () => {
    renderPanel();
    const input = await screen.findByLabelText(/Your bid/i);
    fireEvent.change(input, { target: { value: '16000' } });
    fireEvent.click(screen.getByRole('button', { name: /Place bid/i }));
    expect(await screen.findByText(/you are leading/i)).toBeInTheDocument();
  });
});
