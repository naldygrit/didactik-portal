import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BroadcasterDiscoverPage } from '../pages/DiscoverPage';
import type { Title } from '../../shared/types';

vi.mock('../../shared/apiHelpers', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  paginationPath: (url: string) => url,
}));

const mockTitles: Title[] = [
  {
    id: 10,
    uuid: 'u-10',
    slug: 'mandela',
    name: 'Mandela',
    original_title: '',
    title_type: 'documentary',
    production_company: { id: 2, name: 'SA Films' },
    production_year: 2021,
    country_of_origin: { id: 1, code: 'ZA', name: 'South Africa' },
    co_production_countries: [],
    original_language: { id: 1, code: 'eng', english_name: 'English' },
    dialogue_languages: [],
    genres: [],
    cultural_tags: [],
    maturity_rating: null,
    logline: '',
    synopsis: '',
    runtime_minutes: 120,
    episode_count: null,
    season_count: null,
    awards: [],
    festival_selections: [],
    resolution: 'HD',
    aspect_ratio: '1.85:1',
    is_featured: false,
  },
  {
    id: 11,
    uuid: 'u-11',
    slug: 'riverwood-nights',
    name: 'Riverwood Nights',
    original_title: '',
    title_type: 'tv_episode',
    production_company: { id: 3, name: 'Riverwood Ensemble' },
    production_year: 2025,
    country_of_origin: { id: 2, code: 'KE', name: 'Kenya' },
    co_production_countries: [],
    original_language: { id: 5, code: 'swa', english_name: 'Swahili' },
    dialogue_languages: [],
    genres: [],
    cultural_tags: [],
    maturity_rating: null,
    logline: '',
    synopsis: '',
    runtime_minutes: 44,
    episode_count: 8,
    season_count: 1,
    awards: [],
    festival_selections: [],
    resolution: 'HD',
    aspect_ratio: '1.78:1',
    is_featured: false,
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

describe('BroadcasterDiscoverPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the title list in default (non-search) state', async () => {
    const { apiGet } = await import('../../shared/apiHelpers');
    vi.mocked(apiGet).mockResolvedValue(mockTitles);

    render(<BroadcasterDiscoverPage />, { wrapper: Wrapper });

    expect(await screen.findByText('Mandela')).toBeDefined();
    expect(screen.getByText('South Africa')).toBeDefined();
  });

  it('searches via the server ?q= param when a query is typed', async () => {
    const { apiGet } = await import('../../shared/apiHelpers');
    // Mock the server: when ?q= is present, return only matching titles.
    vi.mocked(apiGet).mockImplementation((url: string) => {
      const m = url.match(/[?&]q=([^&]+)/);
      if (!m) return Promise.resolve(mockTitles) as ReturnType<typeof apiGet>;
      const needle = decodeURIComponent(m[1]).toLowerCase();
      return Promise.resolve(
        mockTitles.filter((t) => t.name.toLowerCase().includes(needle)),
      ) as ReturnType<typeof apiGet>;
    });

    render(<BroadcasterDiscoverPage />, { wrapper: Wrapper });

    await screen.findByText('Mandela');
    const searchInput = screen.getByPlaceholderText(/Search titles/);
    fireEvent.change(searchInput, { target: { value: 'Mandela' } });

    // Debounced request goes out with ?q=Mandela; the server returns only it.
    expect(await screen.findByText('1 result')).toBeDefined();
    expect(screen.queryByText('Riverwood Nights')).toBeNull();
  });

  it('shows empty state when no titles available', async () => {
    const { apiGet } = await import('../../shared/apiHelpers');
    vi.mocked(apiGet).mockResolvedValue([]);

    render(<BroadcasterDiscoverPage />, { wrapper: Wrapper });

    expect(await screen.findByText('No content available yet.')).toBeDefined();
  });
});
