import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductionAssetsPage } from '../pages/AssetsPage';
import type { AssetListItem } from '../../shared/types';

// Mock the apiGet helper so tests don't hit the network
vi.mock('../../shared/apiHelpers', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  paginationPath: (url: string) => url,
}));

const mockAssets: AssetListItem[] = [
  {
    id: 1,
    title: 'Lagos Story',
    original_title: '',
    asset_type: 'feature_film',
    status: 'uploaded',
    production_year: 2023,
    primary_language: null,
    production_country: null,
    production_company: { id: 1, name: 'TestPC' },
    storage_backend: 'b2',
    created_at: new Date().toISOString(),
    taxonomy_count: 0,
  },
  {
    id: 2,
    title: 'Nairobi Nights',
    original_title: '',
    asset_type: 'documentary',
    status: 'rejected',
    production_year: 2022,
    primary_language: null,
    production_country: null,
    production_company: { id: 1, name: 'TestPC' },
    storage_backend: 'b2',
    created_at: new Date().toISOString(),
    taxonomy_count: 2,
  },
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

  it('renders asset titles after data loads', async () => {
    const { apiGet } = await import('../../shared/apiHelpers');
    vi.mocked(apiGet).mockResolvedValue(mockAssets);

    render(<ProductionAssetsPage />, { wrapper: Wrapper });

    expect(await screen.findByText('Lagos Story')).toBeDefined();
    expect(screen.getByText('Nairobi Nights')).toBeDefined();
  });

  it('filters assets by title input', async () => {
    const { apiGet } = await import('../../shared/apiHelpers');
    vi.mocked(apiGet).mockResolvedValue(mockAssets);

    render(<ProductionAssetsPage />, { wrapper: Wrapper });

    await screen.findByText('Lagos Story');

    const input = screen.getByPlaceholderText('Filter by title…');
    fireEvent.change(input, { target: { value: 'nairobi' } });

    expect(screen.queryByText('Lagos Story')).toBeNull();
    expect(screen.getByText('Nairobi Nights')).toBeDefined();
  });

  it('filters assets by status dropdown', async () => {
    const { apiGet } = await import('../../shared/apiHelpers');
    vi.mocked(apiGet).mockResolvedValue(mockAssets);

    render(<ProductionAssetsPage />, { wrapper: Wrapper });

    await screen.findByText('Lagos Story');

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'rejected' } });

    expect(screen.queryByText('Lagos Story')).toBeNull();
    expect(screen.getByText('Nairobi Nights')).toBeDefined();
  });

  it('shows empty state when no assets exist', async () => {
    const { apiGet } = await import('../../shared/apiHelpers');
    vi.mocked(apiGet).mockResolvedValue([]);

    render(<ProductionAssetsPage />, { wrapper: Wrapper });

    expect(await screen.findByText(/No assets yet/)).toBeDefined();
  });

  it('shows error state when fetch fails', async () => {
    const { apiGet } = await import('../../shared/apiHelpers');
    vi.mocked(apiGet).mockRejectedValue(new Error('Network error'));

    render(<ProductionAssetsPage />, { wrapper: Wrapper });

    expect(await screen.findByText(/Failed to load assets/)).toBeDefined();
  });
});
