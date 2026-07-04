import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DkField } from '../DkField';

describe('DkField', () => {
  it('associates the label with the control via matching htmlFor/id', () => {
    render(
      <DkField label="Title">
        <input type="text" />
      </DkField>,
    );
    // getByLabelText only succeeds if htmlFor/id genuinely match.
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
  });

  it('marks the control aria-required and shows a visually-decorative asterisk when required', () => {
    render(
      <DkField label="Title" required>
        <input type="text" />
      </DkField>,
    );
    const input = screen.getByLabelText(/Title/);
    expect(input).toHaveAttribute('aria-required', 'true');
    // The asterisk itself must not be read as its own accessible content.
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
  });

  it('wires an error into aria-invalid + aria-describedby and renders it as an alert', () => {
    render(
      <DkField label="Title" error="Title is required">
        <input type="text" />
      </DkField>,
    );
    const input = screen.getByLabelText('Title');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Title is required');
    expect(input.getAttribute('aria-describedby')).toContain(alert.id);
  });

  it('includes a hint in aria-describedby alongside the error', () => {
    render(
      <DkField label="Runtime" hint="Optional" error="Must be a number">
        <input type="text" />
      </DkField>,
    );
    const input = screen.getByLabelText('Runtime');
    const describedBy = input.getAttribute('aria-describedby') ?? '';
    expect(describedBy.split(' ')).toHaveLength(2);
  });

  it('applies sr-only to the label when visuallyHiddenLabel is set, without removing it from the a11y tree', () => {
    render(
      <DkField label="Search broadcasters" visuallyHiddenLabel>
        <input type="text" placeholder="Search broadcasters…" />
      </DkField>,
    );
    const input = screen.getByLabelText('Search broadcasters');
    expect(input).toBeInTheDocument();
  });

  it('does not add aria-invalid/aria-describedby when there is no error or hint', () => {
    render(
      <DkField label="Optional field">
        <input type="text" />
      </DkField>,
    );
    const input = screen.getByLabelText('Optional field');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-describedby');
  });
});
