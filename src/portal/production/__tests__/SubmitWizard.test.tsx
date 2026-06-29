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
  apiGet: vi.fn().mockImplementation((path: string) => {
    if (path === '/api/v1/languages/') {
      return Promise.resolve([{ id: 1, english_name: 'Yoruba' }]);
    }
    if (path === '/api/v1/countries/') {
      return Promise.resolve([{ id: 1, name: 'Nigeria' }]);
    }
    if (path === '/api/v1/genres/') {
      return Promise.resolve([{ id: 1, name: 'Drama' }]);
    }
    if (path === '/api/v1/auth/me/') {
      return Promise.resolve({ profile: { production_company: { id: 1, name: 'EbonyLife' } } });
    }
    if (path.startsWith('/api/v1/production-companies/')) {
      return Promise.resolve({ id: 1, name: 'EbonyLife', country: { code: 'NG' } });
    }
    return Promise.resolve({});
  }),
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

// Fill every required field on step 1 so the wizard will advance. Language and
// country come from the mocked reference endpoints above.
async function fillStep1Valid() {
  fireEvent.change(screen.getByPlaceholderText('Working or anglicised title'), {
    target: { value: 'A Valid Title Here' },
  });
  fireEvent.change(screen.getByDisplayValue('Select type…'), { target: { value: 'documentary' } });
  fireEvent.change(screen.getByPlaceholderText('e.g. 2023'), { target: { value: '2023' } });
  fireEvent.change(screen.getByPlaceholderText('A short synopsis buyers read when deciding to license'), {
    target: { value: 'A documentary following three Lagos street photographers over one year.' },
  });
  // Wait for the mocked reference data to render the <option>s before selecting.
  await screen.findByRole('option', { name: 'Yoruba' });
  fireEvent.change(screen.getByDisplayValue('— select language —'), { target: { value: '1' } });
  await screen.findByRole('option', { name: 'Nigeria' });
  fireEvent.change(screen.getByDisplayValue('— select country —'), { target: { value: '1' } });
}

describe('SubmitPage wizard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders Step 1 on mount', () => {
    render(<ProductionSubmitPage />, { wrapper: Wrapper });
    expect(screen.getByRole('heading', { name: 'Submit a title' })).toBeDefined();
    expect(screen.getByPlaceholderText('Working or anglicised title')).toBeDefined();
  });

  it('blocks advance from Step 1 when title is too short', async () => {
    render(<ProductionSubmitPage />, { wrapper: Wrapper });

    const titleInput = screen.getByPlaceholderText('Working or anglicised title');
    fireEvent.change(titleInput, { target: { value: 'H' } });

    fireEvent.click(screen.getByText('Save and continue'));

    await waitFor(() => {
      expect(screen.getByText('Title must be at least 2 characters')).toBeDefined();
    });
    expect(screen.getByPlaceholderText('Working or anglicised title')).toBeDefined();
  });

  it('blocks advance from Step 1 when the type is missing', async () => {
    render(<ProductionSubmitPage />, { wrapper: Wrapper });

    const titleInput = screen.getByPlaceholderText('Working or anglicised title');
    fireEvent.change(titleInput, { target: { value: 'A Valid Title Here' } });

    fireEvent.click(screen.getByText('Save and continue'));

    await waitFor(() => {
      expect(screen.getByText('Select a type')).toBeDefined();
    });
  });

  it('blocks advance from Step 1 when the synopsis is missing', async () => {
    render(<ProductionSubmitPage />, { wrapper: Wrapper });
    await fillStep1Valid();
    fireEvent.change(
      screen.getByPlaceholderText('A short synopsis buyers read when deciding to license'),
      { target: { value: '' } },
    );

    fireEvent.click(screen.getByText('Save and continue'));

    await waitFor(() => {
      expect(screen.getByText('Write a short synopsis (at least 20 characters)')).toBeDefined();
    });
  });

  it('advances to the Rights & consent step when Step 1 is valid', async () => {
    render(<ProductionSubmitPage />, { wrapper: Wrapper });
    await fillStep1Valid();

    fireEvent.click(screen.getByText('Save and continue'));

    await screen.findByPlaceholderText('As it appears on official documents');
  });

  it('keeps Continue to upload disabled until the step is complete', async () => {
    render(<ProductionSubmitPage />, { wrapper: Wrapper });
    await fillStep1Valid();
    fireEvent.click(screen.getByText('Save and continue'));
    await screen.findByPlaceholderText('As it appears on official documents');

    const continueBtn = screen.getByText('Continue to review').closest('button') as HTMLButtonElement;
    // Submitter name empty and consent unticked.
    expect(continueBtn.disabled).toBe(true);

    fireEvent.change(screen.getByPlaceholderText('As it appears on official documents'), {
      target: { value: 'Tobi O.' },
    });
    // Name filled, but consent still unticked.
    expect(continueBtn.disabled).toBe(true);

    fireEvent.click(await screen.findByRole('checkbox'));
    // Name filled and consent ticked.
    expect(continueBtn.disabled).toBe(false);
  });

  it('offers the licensing destination on step 2 with Both recommended', async () => {
    render(<ProductionSubmitPage />, { wrapper: Wrapper });
    await fillStep1Valid();
    fireEvent.click(screen.getByText('Save and continue'));
    await screen.findByPlaceholderText('As it appears on official documents');

    expect(screen.getByText('Where would you like this title licensed?')).toBeDefined();
    expect(screen.getByText('Nigerian broadcasters')).toBeDefined();
    expect(screen.getByText('International streaming services')).toBeDefined();
    expect(screen.getByText('Recommended')).toBeDefined();
  });

  it('back button returns to the previous step', async () => {
    render(<ProductionSubmitPage />, { wrapper: Wrapper });
    await fillStep1Valid();
    fireEvent.click(screen.getByText('Save and continue'));
    await screen.findByPlaceholderText('As it appears on official documents');

    fireEvent.click(screen.getByText('Back'));
    expect(screen.getByPlaceholderText('Working or anglicised title')).toBeDefined();
  });
});
