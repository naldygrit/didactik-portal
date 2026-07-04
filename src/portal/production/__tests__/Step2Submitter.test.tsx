import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useForm, FormProvider } from 'react-hook-form';
import { Step2Submitter } from '../components/submission/Step2Submitter';
import type { WizardFormData } from '../pages/SubmitPage';

function Wrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm<WizardFormData>();
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('Step2Submitter', () => {
  it('associates both fields with their labels and marks them required', () => {
    render(<Step2Submitter />, { wrapper: Wrapper });
    const name = screen.getByLabelText(/Your full name/);
    const contact = screen.getByLabelText(/Contact email or phone/);
    expect(name).toHaveAttribute('aria-required', 'true');
    expect(contact).toHaveAttribute('aria-required', 'true');
  });

  it('links the contact hint via aria-describedby', () => {
    render(<Step2Submitter />, { wrapper: Wrapper });
    const contact = screen.getByLabelText(/Contact email or phone/);
    const hint = screen.getByText(
      'Didactik will use this to contact you about your submission status.',
    );
    expect(contact.getAttribute('aria-describedby')).toBe(hint.id);
  });
});
