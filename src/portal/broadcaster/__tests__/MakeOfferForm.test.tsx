import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { handlers } from '../../../mocks/handlers';
import { session, users } from '../../../mocks/db';
import { MakeOfferForm } from '../components/MakeOfferForm';

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderForm(slug = 'make-offer-test-title') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MakeOfferForm slug={slug} />
    </QueryClientProvider>,
  );
}

describe('MakeOfferForm', () => {
  it('gives currency and amount distinct accessible names instead of one label spanning both', () => {
    session.current = users.find((u) => u.username === 'broadcaster') ?? null;
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'Make an offer' }));

    const currency = screen.getByLabelText('Currency');
    const amount = screen.getByLabelText(/Licence fee/);
    expect(currency).not.toBe(amount);
    expect(currency.tagName).toBe('SELECT');
    expect(amount.tagName).toBe('INPUT');
  });

  it('announces a successful submission via a polite status message', async () => {
    session.current = users.find((u) => u.username === 'broadcaster') ?? null;
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'Make an offer' }));

    await screen.findByRole('option', { name: 'Nigeria' });
    fireEvent.change(screen.getByLabelText(/Licence fee/), { target: { value: '15000' } });
    const territorySelect = screen.getByDisplayValue('Select a territory');
    fireEvent.change(territorySelect, { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit offer' }));

    const status = await screen.findByText('Offer submitted');
    expect(status.closest('[role="status"]')).toHaveAttribute('aria-live', 'polite');
  });

  it('announces a failed submission as an alert', async () => {
    session.current = null;
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'Make an offer' }));

    await screen.findByRole('option', { name: 'Nigeria' });
    fireEvent.change(screen.getByLabelText(/Licence fee/), { target: { value: '15000' } });
    fireEvent.change(screen.getByDisplayValue('Select a territory'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit offer' }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  });
});
