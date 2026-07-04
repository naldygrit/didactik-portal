import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useForm, FormProvider } from 'react-hook-form';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Step1Metadata } from '../components/submission/Step1Metadata';
import type { WizardFormData } from '../pages/SubmitPage';

vi.mock('../../shared/apiHelpers', () => ({
  apiGet: vi.fn().mockImplementation((path: string) => {
    if (path === '/api/v1/languages/') {
      return Promise.resolve([
        { id: 1, english_name: 'Yoruba' },
        { id: 2, english_name: 'Igbo' },
      ]);
    }
    if (path === '/api/v1/countries/') {
      return Promise.resolve([{ id: 1, name: 'Nigeria' }]);
    }
    if (path === '/api/v1/genres/') {
      return Promise.resolve([{ id: 1, name: 'Drama' }]);
    }
    return Promise.resolve([]);
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

describe('Step1Metadata', () => {
  // Required fields render a trailing aria-hidden asterisk inside the label
  // (e.g. "Title *"), so getByLabelText needs a regex/prefix match rather
  // than an exact string — same reasoning as DkField.test.tsx's own
  // "required" case. The asterisk being aria-hidden is exactly what makes it
  // absent from the *accessible* name; it's still in the label's raw
  // textContent, which is what these queries match against.
  it('associates every simple text/select field with its label via DkField', () => {
    render(<Step1Metadata />, { wrapper: Wrapper });
    expect(screen.getByLabelText(/^Title/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Original title/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Type/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Production year/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Runtime/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Logline/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Synopsis/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Original language/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Country of origin/)).toBeInTheDocument();
  });

  it('marks required fields aria-required via DkField', () => {
    render(<Step1Metadata />, { wrapper: Wrapper });
    expect(screen.getByLabelText(/^Title/)).toHaveAttribute('aria-required', 'true');
    expect(screen.getByLabelText(/Original title/)).not.toHaveAttribute('aria-required');
  });

  it('groups the "other languages" chip toggles under an accessible group name', async () => {
    render(<Step1Metadata />, { wrapper: Wrapper });
    // findBy, not getBy: the chip list only exists once the mocked apiGet
    // promise for /api/v1/languages/ resolves and the component re-renders.
    const yoruba = await screen.findByRole('button', { name: 'Yoruba' });
    const group = screen.getByRole('group', { name: 'Other languages spoken (optional)' });
    expect(group).toContainElement(yoruba);
    expect(yoruba).toHaveAttribute('aria-pressed', 'false');
  });

  it('reflects chip selection state via aria-pressed', async () => {
    render(<Step1Metadata />, { wrapper: Wrapper });
    const igbo = await screen.findByRole('button', { name: 'Igbo' });
    expect(igbo).toHaveAttribute('aria-pressed', 'false');
    igbo.click();
    await waitFor(() => expect(igbo).toHaveAttribute('aria-pressed', 'true'));
  });

  it('groups genres under an accessible group name', async () => {
    render(<Step1Metadata />, { wrapper: Wrapper });
    const drama = await screen.findByRole('button', { name: 'Drama' });
    const group = screen.getByRole('group', { name: 'Genres (optional)' });
    expect(group).toContainElement(drama);
  });
});
