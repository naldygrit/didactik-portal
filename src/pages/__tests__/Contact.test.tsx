import { render, screen, fireEvent } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import emailjs from '@emailjs/browser';
import Contact from '../Contact';

vi.mock('@emailjs/browser', () => ({
  default: { send: vi.fn() },
}));

function renderContact() {
  return render(
    <HelmetProvider>
      <Contact />
    </HelmetProvider>,
  );
}

function fillForm() {
  fireEvent.change(screen.getByLabelText('Name *'), { target: { value: 'Ada' } });
  fireEvent.change(screen.getByLabelText('Organization *'), { target: { value: 'Test Org' } });
  fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'ada@example.com' } });
  fireEvent.change(screen.getByLabelText('Message *'), { target: { value: 'Hello there' } });
}

describe('Contact', () => {
  it('announces a successful submission via a polite status region', async () => {
    vi.mocked(emailjs.send).mockResolvedValue({ status: 200, text: 'OK' } as never);
    renderContact();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Send Message' }));

    const status = await screen.findByRole('status');
    expect(status).toHaveTextContent("Thank you! We'll be in touch soon.");
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('announces a failed submission via an assertive alert region', async () => {
    vi.mocked(emailjs.send).mockRejectedValue(new Error('network error'));
    renderContact();
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Send Message' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Failed to send message.');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });
});
