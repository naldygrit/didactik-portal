import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { handlers } from '../../../mocks/handlers';
import { session, users } from '../../../mocks/db';
import { BidPanel } from '../components/BidPanel';

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  session.current = users.find((u) => u.username === 'broadcaster') ?? null;
});

function renderPanel(slug = 'bidpanel-test-title') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <BidPanel slug={slug} />
    </QueryClientProvider>,
  );
}

describe('BidPanel', () => {
  it('associates the amount field with its label and focuses it when the form opens', async () => {
    renderPanel();
    fireEvent.click(await screen.findByRole('button', { name: 'Place a bid' }));

    const input = screen.getByLabelText('Your bid (USD)');
    expect(input).toHaveFocus();
  });

  it('keeps submit disabled until a valid amount is entered (unchanged behavior)', async () => {
    renderPanel();
    fireEvent.click(await screen.findByRole('button', { name: 'Place a bid' }));
    const submit = screen.getByRole('button', { name: 'Place bid' });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Your bid (USD)'), { target: { value: '20000' } });
    expect(submit).not.toBeDisabled();
  });

  it('announces a successful bid via a polite status message', async () => {
    renderPanel();
    fireEvent.click(await screen.findByRole('button', { name: 'Place a bid' }));
    fireEvent.change(screen.getByLabelText('Your bid (USD)'), { target: { value: '20000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Place bid' }));

    const status = await screen.findByText(/Bid placed/);
    expect(status).toHaveAttribute('aria-live', 'polite');
  });
});
