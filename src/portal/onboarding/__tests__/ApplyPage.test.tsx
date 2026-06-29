import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ApplyPage } from '../ApplyPage';

vi.mock('../onboarding', () => ({
  postApplication: vi.fn(),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <ApplyPage />
    </MemoryRouter>,
  );
}

describe('ApplyPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('walks from org-type choice to the details form', () => {
    renderPage();
    expect(screen.getByText('Who are you applying as?')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /Broadcaster/ }));
    expect(screen.getByText(/Tell us about your broadcaster/)).toBeDefined();
  });

  it('submits an application and shows the confirmation', async () => {
    const { postApplication } = await import('../onboarding');
    vi.mocked(postApplication).mockResolvedValue({ status: 'received' });

    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /Production company/ }));

    fireEvent.change(screen.getByLabelText('Company name'), { target: { value: 'EbonyLife' } });
    fireEvent.change(screen.getByLabelText('Country'), { target: { value: 'Nigeria' } });
    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Tobi' } });
    fireEvent.change(screen.getByLabelText('Work email'), {
      target: { value: 'tobi@ebonylife.example' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Submit application' }));

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Application received' })).toBeDefined(),
    );
    expect(postApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        org_type: 'production_company',
        org_name: 'EbonyLife',
        contact_email: 'tobi@ebonylife.example',
      }),
    );
  });
});
