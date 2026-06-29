import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductionAssetsPage } from '../pages/AssetsPage';
import type { ProductionTitle } from '../../shared/types';

// Mock the apiGet helper so tests don't hit the network
vi.mock('../../shared/apiHelpers', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiDelete: vi.fn(),
  paginationPath: (url: string) => url,
}));

// Minimal ProductionTitle factory — only the fields the catalogue table reads.
function makeTitle(over: Partial<ProductionTitle>): ProductionTitle {
  return {
    id: 1,
    uuid: 'u-1',
    slug: 'lagos-story',
    name: 'Lagos Story',
    original_title: '',
    title_type: 'feature_film',
    production_company: { id: 1, name: 'TestPC' },
    production_year: 2023,
    country_of_origin: null,
    co_production_countries: [],
    original_language: null,
    dialogue_languages: [],
    genres: [],
    cultural_tags: [],
    maturity_rating: null,
    logline: '',
    synopsis: '',
    runtime_minutes: null,
    episode_count: null,
    season_count: null,
    awards: [],
    festival_selections: [],
    resolution: '',
    aspect_ratio: '',
    is_featured: false,
    status: 'active',
    metadata_score: 90,
    licensing_intent: 'svod',
    screener_request_count: 2,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...over,
  };
}

const mockTitles: ProductionTitle[] = [
  makeTitle({ id: 1, slug: 'lagos-story', name: 'Lagos Story', status: 'active' }),
  makeTitle({
    id: 2,
    slug: 'nairobi-nights',
    name: 'Nairobi Nights',
    title_type: 'documentary',
    status: 'submitted',
    metadata_score: 47,
    screener_request_count: 0,
  }),
];

function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={makeClient()}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('ProductionAssetsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title names after data loads', async () => {
    const { apiGet } = await import('../../shared/apiHelpers');
    vi.mocked(apiGet).mockResolvedValue(mockTitles);

    render(<ProductionAssetsPage />, { wrapper: Wrapper });

    expect(await screen.findByText('Lagos Story')).toBeDefined();
    expect(screen.getByText('Nairobi Nights')).toBeDefined();
  });

  it('filters titles by name input', async () => {
    const { apiGet } = await import('../../shared/apiHelpers');
    vi.mocked(apiGet).mockResolvedValue(mockTitles);

    render(<ProductionAssetsPage />, { wrapper: Wrapper });

    await screen.findByText('Lagos Story');

    const input = screen.getByPlaceholderText('Filter by title…');
    fireEvent.change(input, { target: { value: 'nairobi' } });

    expect(screen.queryByText('Lagos Story')).toBeNull();
    expect(screen.getByText('Nairobi Nights')).toBeDefined();
  });

  it('filters titles by status dropdown', async () => {
    const { apiGet } = await import('../../shared/apiHelpers');
    vi.mocked(apiGet).mockResolvedValue(mockTitles);

    render(<ProductionAssetsPage />, { wrapper: Wrapper });

    await screen.findByText('Lagos Story');

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'submitted' } });

    expect(screen.queryByText('Lagos Story')).toBeNull();
    expect(screen.getByText('Nairobi Nights')).toBeDefined();
  });

  it('shows empty state when no titles exist', async () => {
    const { apiGet } = await import('../../shared/apiHelpers');
    vi.mocked(apiGet).mockResolvedValue([]);

    render(<ProductionAssetsPage />, { wrapper: Wrapper });

    expect(await screen.findByText(/No titles yet/)).toBeDefined();
  });

  it('shows error state when fetch fails', async () => {
    const { apiGet } = await import('../../shared/apiHelpers');
    vi.mocked(apiGet).mockRejectedValue(new Error('Network error'));

    render(<ProductionAssetsPage />, { wrapper: Wrapper });

    expect(await screen.findByText(/Failed to load titles/)).toBeDefined();
  });
});
