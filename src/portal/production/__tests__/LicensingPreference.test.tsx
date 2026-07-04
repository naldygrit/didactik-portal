import { render, screen } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import { LicensingPreference } from '../components/submission/LicensingPreference';
import type { WizardFormData } from '../pages/SubmitPage';

function Wrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm<WizardFormData>();
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('LicensingPreference', () => {
  it('groups the three options under a fieldset named by its question', () => {
    render(<LicensingPreference />, { wrapper: Wrapper });
    const group = screen.getByRole('group', {
      name: 'Where would you like this title licensed?',
    });
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    radios.forEach((radio) => expect(group).toContainElement(radio));
  });
});
