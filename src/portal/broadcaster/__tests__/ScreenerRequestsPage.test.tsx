import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BroadcasterScreenerRequestsPage } from '../pages/ScreenerRequestsPage';
import type { ScreenerSummary } from '../../shared/types';

vi.mock('../../shared/apiHelpers', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  paginationPath: (url: string) => url,
}));

const mockScreeners: ScreenerSummary[] = [
  {
    uuid: 's-1',
    title_slug: 'lagos-after-dark',
    title_name: 'Lagos After Dark',
    purpose: 'acquisition_evaluation',
    status: 'approved',
    requested_at: '2026-06-01T00:00:00Z',
    access_expires_at: '2026-08-01T00:00:00Z',
  },
  {
    uuid: 's-2',
    title_slug: 'harmattan-letters',
    title_name: 'Harmattan Letters',
    purpose: 'programming_review',
    status: 'pending',
    requested_at: '2026-06-05T00:00:00Z',
    access_expires_at: null,
  },
];

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('BroadcasterScreenerRequestsPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('clicking Access screener replaces the button with a confirmation, not a dead click', async () => {
    const { apiGet } = await import('../../shared/apiHelpers');
    vi.mocked(apiGet).mockResolvedValue(mockScreeners);

    render(<BroadcasterScreenerRequestsPage />, { wrapper: Wrapper });

    const accessButton = await screen.findByRole('button', { name: 'Access screener' });
    fireEvent.click(accessButton);

    expect(screen.queryByRole('button', { name: 'Access screener' })).toBeNull();
    expect(await screen.findByText('Link sent — check your email')).toBeDefined();
  });

  it('leaves a pending request as a "View title" link, not an access button', async () => {
    const { apiGet } = await import('../../shared/apiHelpers');
    vi.mocked(apiGet).mockResolvedValue(mockScreeners);

    render(<BroadcasterScreenerRequestsPage />, { wrapper: Wrapper });

    await screen.findByText('Harmattan Letters');
    expect(screen.getByRole('link', { name: 'View title →' })).toBeDefined();
  });
});
