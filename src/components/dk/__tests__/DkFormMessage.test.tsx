import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DkFormMessage } from '../DkFormMessage';

describe('DkFormMessage', () => {
  it('uses an assertive alert role for errors', () => {
    render(<DkFormMessage tone="error">Something went wrong.</DkFormMessage>);
    const el = screen.getByRole('alert');
    expect(el).toHaveAttribute('aria-live', 'assertive');
    expect(el).toHaveTextContent('Something went wrong.');
  });

  it('uses a polite status role for success', () => {
    render(<DkFormMessage tone="success">Thanks, we received it.</DkFormMessage>);
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-live', 'polite');
  });

  it('passes through the caller-supplied className without imposing its own styling', () => {
    render(
      <DkFormMessage tone="error" className="my-banner-class">
        Failed
      </DkFormMessage>,
    );
    expect(screen.getByRole('alert')).toHaveClass('my-banner-class');
  });
});
