import { renderHook, act, render, screen, fireEvent } from '@testing-library/react';
import { useDkDisclosure } from '../useDkDisclosure';

describe('useDkDisclosure', () => {
  it('starts closed by default, and open when initialOpen is passed', () => {
    const closed = renderHook(() => useDkDisclosure());
    expect(closed.result.current.open).toBe(false);

    const opened = renderHook(() => useDkDisclosure(true));
    expect(opened.result.current.open).toBe(true);
  });

  it('toggle() flips open state, close() always closes', () => {
    const { result } = renderHook(() => useDkDisclosure());
    act(() => result.current.toggle());
    expect(result.current.open).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.open).toBe(false);

    act(() => result.current.toggle());
    act(() => result.current.close());
    expect(result.current.open).toBe(false);
  });

  it('triggerProps.aria-expanded tracks open state, and aria-controls matches panelProps.id', () => {
    const { result } = renderHook(() => useDkDisclosure());
    expect(result.current.triggerProps['aria-expanded']).toBe(false);
    expect(result.current.triggerProps['aria-controls']).toBe(result.current.panelProps.id);

    act(() => result.current.toggle());
    expect(result.current.triggerProps['aria-expanded']).toBe(true);
  });

  it('closes on Escape when open, via a real trigger/panel wired together', () => {
    function Demo() {
      const { open, toggle, triggerProps, panelProps } = useDkDisclosure();
      return (
        <div>
          <button type="button" onClick={toggle} {...triggerProps}>
            Toggle
          </button>
          {open && <div {...panelProps}>Panel content</div>}
        </div>
      );
    }
    render(<Demo />);
    const button = screen.getByRole('button', { name: 'Toggle' });
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Panel content')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Panel content')).not.toBeInTheDocument();
  });

  it('does not close on Escape when closeOnEscape is false', () => {
    const { result } = renderHook(() => useDkDisclosure(false, { closeOnEscape: false }));
    act(() => result.current.toggle());
    expect(result.current.open).toBe(true);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(result.current.open).toBe(true);
  });
});
