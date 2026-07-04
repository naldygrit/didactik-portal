import { useCallback, useEffect, useId, useState } from 'react';

interface DkDisclosureOptions {
  /** @default true */
  closeOnEscape?: boolean;
}

// Owns just the open-state + id-generation + aria-wiring for a
// trigger-reveals-a-region pattern — not a wrapping component, since the
// revealed content varies too much across consumers (a nav panel, a priced
// form, a block of text) to share a single render structure. Each consumer
// spreads triggerProps onto its own toggle button and panelProps onto its
// own revealed region; everything else about their markup stays theirs.
export function useDkDisclosure(initialOpen = false, options: DkDisclosureOptions = {}) {
  const { closeOnEscape = true } = options;
  const [open, setOpen] = useState(initialOpen);
  const id = useId();

  const toggle = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open || !closeOnEscape) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, closeOnEscape]);

  return {
    open,
    toggle,
    close,
    triggerProps: {
      'aria-expanded': open,
      'aria-controls': id,
    },
    panelProps: {
      id,
    },
  };
}
