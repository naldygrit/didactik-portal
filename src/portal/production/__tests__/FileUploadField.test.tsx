import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FileUploadField } from '../components/submission/FileUploadField';

describe('FileUploadField', () => {
  it('associates the label with the file input, so the input is reachable by its accessible name', () => {
    render(<FileUploadField upload={{ status: 'idle' }} onPick={vi.fn()} />);
    const input = screen.getByLabelText(/Master file/);
    expect(input).toHaveAttribute('type', 'file');
  });

  it('can actually receive keyboard focus (this is the regression: display:none via `hidden` cannot be focused; sr-only can)', () => {
    render(<FileUploadField upload={{ status: 'idle' }} onPick={vi.fn()} />);
    const input = screen.getByLabelText(/Master file/);
    input.focus();
    // jsdom enforces the same rule real browsers do: an element with
    // display:none cannot become document.activeElement. This is what
    // actually failed before the fix, not just a missing className.
    expect(document.activeElement).toBe(input);
    expect(input).toHaveAttribute('aria-required', 'true');
  });

  it('exposes upload progress as a progressbar with the current percentage', () => {
    render(
      <FileUploadField
        upload={{ status: 'uploading', percent: 42, file: new File([''], 'master.mp4') }}
        onPick={vi.fn()}
      />,
    );
    const bar = screen.getByRole('progressbar', { name: 'Upload progress' });
    expect(bar).toHaveAttribute('aria-valuenow', '42');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('marks the input invalid and announces the error message on upload failure', () => {
    render(
      <FileUploadField
        upload={{ status: 'error', message: 'Upload failed.', file: new File([''], 'master.mp4') }}
        onPick={vi.fn()}
      />,
    );
    const input = screen.getByLabelText(/Master file/);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Upload failed. Click the box to retry.');
    expect(input.getAttribute('aria-describedby')).toBe(alert.id);
  });
});
