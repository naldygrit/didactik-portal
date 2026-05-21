import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductionSubmitPage } from '../pages/SubmitPage';

vi.mock('../../shared/AuthContext', () => ({
  useAuth: () => ({ user: { email: 'test@example.com', role: 'production_company_user' }, login: vi.fn(), logout: vi.fn(), loading: false }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  getAccessToken: () => 'mock-token',
}));

vi.mock('../../shared/apiHelpers', () => ({
  apiGet: vi.fn().mockResolvedValue({}),
  apiPost: vi.fn(),
  paginationPath: (url: string) => url,
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('SubmitPage wizard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders Step 1 on mount', () => {
    render(<ProductionSubmitPage />, { wrapper: Wrapper });
    expect(screen.getByText('Submit new asset')).toBeDefined();
    expect(screen.getByPlaceholderText('Working or anglicised title')).toBeDefined();
  });

  it('blocks advance from Step 1 when title is too short', async () => {
    render(<ProductionSubmitPage />, { wrapper: Wrapper });

    // Enter a title that is too short (< 5 chars)
    const titleInput = screen.getByPlaceholderText('Working or anglicised title');
    fireEvent.change(titleInput, { target: { value: 'Hi' } });

    fireEvent.click(screen.getByText('Next →'));

    await waitFor(() => {
      expect(screen.getByText('Title must be at least 5 characters')).toBeDefined();
    });
    // Should still be on Step 1
    expect(screen.getByPlaceholderText('Working or anglicised title')).toBeDefined();
  });

  it('blocks advance from Step 1 when asset type is missing', async () => {
    render(<ProductionSubmitPage />, { wrapper: Wrapper });

    const titleInput = screen.getByPlaceholderText('Working or anglicised title');
    fireEvent.change(titleInput, { target: { value: 'A Valid Title Here' } });

    fireEvent.click(screen.getByText('Next →'));

    await waitFor(() => {
      expect(screen.getByText('Select an asset type')).toBeDefined();
    });
  });

  it('advances to Step 2 when Step 1 is valid', async () => {
    render(<ProductionSubmitPage />, { wrapper: Wrapper });

    const titleInput = screen.getByPlaceholderText('Working or anglicised title');
    fireEvent.change(titleInput, { target: { value: 'A Valid Title Here' } });

    const typeSelect = screen.getByRole('combobox');
    fireEvent.change(typeSelect, { target: { value: 'feature_film' } });

    fireEvent.click(screen.getByText('Next →'));

    // Step 2 shows submitter name input
    await screen.findByPlaceholderText('As it appears on official documents');
  });

  it('blocks advance from Step 2 when submitter name is empty', async () => {
    render(<ProductionSubmitPage />, { wrapper: Wrapper });

    // Advance to Step 2
    const titleInput = screen.getByPlaceholderText('Working or anglicised title');
    fireEvent.change(titleInput, { target: { value: 'A Valid Title Here' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'documentary' } });
    fireEvent.click(screen.getByText('Next →'));
    await screen.findByPlaceholderText('As it appears on official documents');

    // Clear submitter name and try to advance
    const nameInput = screen.getByPlaceholderText('As it appears on official documents');
    fireEvent.change(nameInput, { target: { value: '' } });

    fireEvent.click(screen.getByText('Next →'));

    await waitFor(() => {
      expect(screen.getByText('Your name is required')).toBeDefined();
    });
  });

  it('back button returns to previous step', async () => {
    render(<ProductionSubmitPage />, { wrapper: Wrapper });

    // Go to Step 2
    const titleInput = screen.getByPlaceholderText('Working or anglicised title');
    fireEvent.change(titleInput, { target: { value: 'A Valid Title Here' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'documentary' } });
    fireEvent.click(screen.getByText('Next →'));
    await screen.findByPlaceholderText('As it appears on official documents');

    // Go back
    fireEvent.click(screen.getByText('← Back'));
    expect(screen.getByPlaceholderText('Working or anglicised title')).toBeDefined();
  });
});
