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

  it('groups the org-type cards under their question via role=group', () => {
    renderPage();
    const heading = screen.getByRole('heading', { level: 1, name: 'Who are you applying as?' });
    const group = screen.getByRole('group', { name: 'Who are you applying as?' });
    expect(group.getAttribute('aria-labelledby')).toBe(heading.id);
    expect(group).toContainElement(screen.getByRole('button', { name: /Broadcaster/ }));
    expect(group).toContainElement(screen.getByRole('button', { name: /Production company/ }));
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

    // Production companies self-serve: "Create account" → instant "You're all set".
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: "You're all set" })).toBeDefined(),
    );
    expect(postApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        org_type: 'production_company',
        org_name: 'EbonyLife',
        contact_email: 'tobi@ebonylife.example',
      }),
    );
  });

  it('announces a failed submission as an alert', async () => {
    const { postApplication } = await import('../onboarding');
    vi.mocked(postApplication).mockRejectedValue(new Error('Application already pending.'));

    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /Broadcaster/ }));
    fireEvent.change(screen.getByLabelText('Broadcaster name'), { target: { value: 'Canal+' } });
    fireEvent.change(screen.getByLabelText('Country'), { target: { value: 'Senegal' } });
    fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Ada' } });
    fireEvent.change(screen.getByLabelText('Work email'), { target: { value: 'ada@canal.example' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit application' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    expect(alert).toHaveTextContent('Application already pending.');
  });
});
