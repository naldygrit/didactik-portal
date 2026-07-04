import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { handlers } from '../../../mocks/handlers';
import { session, users } from '../../../mocks/db';
import { ExpressInterestForm } from '../components/ExpressInterestForm';

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderForm(slug = 'express-interest-test-title') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ExpressInterestForm slug={slug} />
    </QueryClientProvider>,
  );
}

describe('ExpressInterestForm', () => {
  it('the closed-state trigger declares its collapsed state and what it controls', () => {
    // Unlike Header/PortalLayout, this trigger unmounts entirely once
    // clicked (replaced by the form; Cancel closes it, not the same
    // button toggling back) — there's no persistent element to observe
    // aria-expanded flipping to true on, so this only checks the wiring
    // that's actually observable: the collapsed state before activation,
    // and that aria-controls names the id the panel will render with.
    session.current = users.find((u) => u.username === 'broadcaster') ?? null;
    renderForm();
    const toggle = screen.getByRole('button', { name: 'Express interest' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle.getAttribute('aria-controls')).toBeTruthy();

    fireEvent.click(toggle);
    const panelId = toggle.getAttribute('aria-controls')!;
    expect(document.getElementById(panelId)).toBeInTheDocument();
  });

  it('announces a successful submission via a polite status message', async () => {
    session.current = users.find((u) => u.username === 'broadcaster') ?? null;
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'Express interest' }));

    await screen.findByRole('option', { name: 'Nigeria' });
    fireEvent.change(screen.getByDisplayValue('Select a territory'), {
      target: { value: '1' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit interest' }));

    const status = await screen.findByText('Expression of interest sent');
    expect(status.closest('[role="status"]')).toHaveAttribute('aria-live', 'polite');
  });

  it('announces a failed submission as an alert', async () => {
    session.current = null; // unauthenticated -> the mock API 401s
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'Express interest' }));

    await screen.findByRole('option', { name: 'Nigeria' });
    fireEvent.change(screen.getByDisplayValue('Select a territory'), {
      target: { value: '1' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit interest' }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  });
});
