import type { ReactNode } from 'react';

interface DkFieldErrorProps {
  id?: string;
  children: ReactNode;
  className?: string;
}

// Inline per-field validation message. role="alert" gives it an implicit
// assertive live region, so a screen reader announces it the moment it
// mounts — no separate aria-live wiring needed. Renders nothing when there's
// no message, so callers can pass `error={errors.name?.message}` directly.
export function DkFieldError({ id, children, className }: DkFieldErrorProps) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className={className ?? 'mt-1 text-xs text-red-600'}>
      {children}
    </p>
  );
}
