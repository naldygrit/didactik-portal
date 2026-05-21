import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BroadcasterDiscoverPage } from '../pages/DiscoverPage';
import type { AssetListItem, PaginatedResponse, SearchAsset } from '../../shared/types';

vi.mock('../../shared/apiHelpers', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  paginationPath: (url: string) => url,
}));

const mockAssets: AssetListItem[] = [
  {
    id: 10,
    title: 'Mandela',
    original_title: '',
    asset_type: 'documentary',
    status: 'ready_to_list',
    production_year: 2021,
    primary_language: { id: 1, code: 'en', english_name: 'English' },
    production_country: { id: 1, code: 'ZA', name: 'South Africa' },
    production_company: { id: 2, name: 'SA Films' },
    storage_backend: 'b2',
    created_at: new Date().toISOString(),
    taxonomy_count: 3,
  },
];

const mockSearchResults: PaginatedResponse<SearchAsset> = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      ...mockAssets[0],
      matched_fields: ['title'],
      highlight: 'Mandela',
    },
  ],
};

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('BroadcasterDiscoverPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders asset list in default (non-search) state', async () => {
    const { apiGet } = await import('../../shared/apiHelpers');
    vi.mocked(apiGet).mockResolvedValue(mockAssets);

    render(<BroadcasterDiscoverPage />, { wrapper: Wrapper });

    expect(await screen.findByText('Mandela')).toBeDefined();
    expect(screen.getByText('South Africa')).toBeDefined();
  });

  it('switches to search results when query is typed', async () => {
    const { apiGet } = await import('../../shared/apiHelpers');
    // First call (idle): return assets. Second call (search): return paginated results.
    vi.mocked(apiGet)
      .mockResolvedValueOnce(mockAssets)
      .mockResolvedValueOnce(mockSearchResults);

    render(<BroadcasterDiscoverPage />, { wrapper: Wrapper });

    const searchInput = screen.getByPlaceholderText(/Search titles/);
    fireEvent.change(searchInput, { target: { value: 'Mandela' } });

    expect(await screen.findByText('1 result')).toBeDefined();
  });

  it('shows empty state when no assets available', async () => {
    const { apiGet } = await import('../../shared/apiHelpers');
    vi.mocked(apiGet).mockResolvedValue([]);

    render(<BroadcasterDiscoverPage />, { wrapper: Wrapper });

    expect(await screen.findByText('No content available yet.')).toBeDefined();
  });
});
