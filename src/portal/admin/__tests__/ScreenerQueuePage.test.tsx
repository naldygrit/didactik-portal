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
    expect(screen.getByRole('heading', { level: 1, name: 'Screeners' })).toBeInTheDocument();
  });

  it('gives the decline-reason input an accessible name instead of placeholder-only', async () => {
    renderPage();
    await screen.findByText('Canal+ International', { exact: false });
    expect(screen.getAllByLabelText('Decline reason').length).toBeGreaterThan(0);
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

  it('exposes the tab bar with real ARIA tabs semantics, not just styled buttons', async () => {
    renderPage();
    await screen.findByText('Canal+ International', { exact: false });

    const tablist = screen.getByRole('tablist', { name: 'Screener request status' });
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(4);
    expect(tablist).toContainElement(tabs[0]);

    const pendingTab = screen.getByRole('tab', { name: /^Pending/ });
    expect(pendingTab).toHaveAttribute('aria-selected', 'true');
    expect(pendingTab).toHaveAttribute('tabIndex', '0');

    const approvedTab = screen.getByRole('tab', { name: /^Approved/ });
    expect(approvedTab).toHaveAttribute('aria-selected', 'false');
    expect(approvedTab).toHaveAttribute('tabIndex', '-1');

    const panel = screen.getByRole('tabpanel');
    expect(panel.getAttribute('aria-labelledby')).toBe(pendingTab.id);
    expect(pendingTab.getAttribute('aria-controls')).toBe(panel.id);
  });

  it('moves selection and focus with ArrowRight/ArrowLeft, wrapping at the ends', async () => {
    renderPage();
    await screen.findByText('Canal+ International', { exact: false });

    const pendingTab = screen.getByRole('tab', { name: /^Pending/ });
    const approvedTab = screen.getByRole('tab', { name: /^Approved/ });
    const allTab = screen.getByRole('tab', { name: /^All/ });

    pendingTab.focus();
    fireEvent.keyDown(pendingTab, { key: 'ArrowRight' });
    expect(approvedTab).toHaveAttribute('aria-selected', 'true');
    expect(document.activeElement).toBe(approvedTab);

    // Wrap backward from the first tab (Pending, index 0) to the last (All).
    fireEvent.keyDown(approvedTab, { key: 'ArrowLeft' });
    fireEvent.keyDown(pendingTab, { key: 'ArrowLeft' });
    expect(allTab).toHaveAttribute('aria-selected', 'true');
    expect(document.activeElement).toBe(allTab);
  });

  it('jumps to the first/last tab on Home/End', async () => {
    renderPage();
    await screen.findByText('Canal+ International', { exact: false });

    const pendingTab = screen.getByRole('tab', { name: /^Pending/ });
    const allTab = screen.getByRole('tab', { name: /^All/ });

    fireEvent.keyDown(pendingTab, { key: 'End' });
    expect(allTab).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(allTab, { key: 'Home' });
    expect(pendingTab).toHaveAttribute('aria-selected', 'true');
  });
});
