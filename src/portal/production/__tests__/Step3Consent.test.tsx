import { render, screen, fireEvent } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Step3Consent } from '../components/submission/Step3Consent';
import type { WizardFormData } from '../pages/SubmitPage';

vi.mock('../../shared/apiHelpers', () => ({
  apiGet: vi.fn().mockImplementation((path: string) => {
    if (path === '/api/v1/auth/me/') {
      return Promise.resolve({ profile: { production_company: { id: 1 } } });
    }
    if (path.startsWith('/api/v1/production-companies/')) {
      return Promise.resolve({ id: 1, name: 'EbonyLife', country: { code: 'NG' } });
    }
    return Promise.resolve({});
  }),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm<WizardFormData>();
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <FormProvider {...methods}>{children}</FormProvider>
    </QueryClientProvider>
  );
}

describe('Step3Consent', () => {
  it('links the "view consent terms" toggle to its revealed text via aria-expanded/aria-controls', async () => {
    render(<Step3Consent />, { wrapper: Wrapper });
    const toggle = await screen.findByRole('button', { name: 'View full consent terms' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggle);
    expect(screen.getByRole('button', { name: 'Hide consent terms' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    const panelId = toggle.getAttribute('aria-controls')!;
    expect(document.getElementById(panelId)).toBeInTheDocument();
  });

  it('links the Privacy Policy toggle to PrivacyPolicyDrawer via aria-expanded/aria-controls, which exposes it as a labeled region', async () => {
    render(<Step3Consent />, { wrapper: Wrapper });
    const toggle = await screen.findByRole('button', { name: /Privacy Policy/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    const region = screen.getByRole('region', { name: 'Privacy Policy' });
    expect(region.id).toBe(toggle.getAttribute('aria-controls'));
  });
});
