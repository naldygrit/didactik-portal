import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DkFieldError } from '../DkFieldError';

describe('DkFieldError', () => {
  it('renders nothing when there is no message', () => {
    const { container } = render(<DkFieldError>{undefined}</DkFieldError>);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the message with role="alert" so it is announced on mount', () => {
    render(<DkFieldError id="name-error">Title is required</DkFieldError>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Title is required');
    expect(alert).toHaveAttribute('id', 'name-error');
  });
});
