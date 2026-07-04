import type { ReactNode } from 'react';

interface DkFormMessageProps {
  tone: 'success' | 'error';
  children: ReactNode;
  className?: string;
}

// Whole-form outcome banner (submit succeeded / failed). Unlike DkFieldError,
// this doesn't own any visual style — callers keep their existing banner
// classes and just get the right role/aria-live for the tone: errors are
// assertive (role="alert"), success is polite (role="status") since it isn't
// urgent enough to interrupt.
export function DkFormMessage({ tone, children, className }: DkFormMessageProps) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
      className={className}
    >
      {children}
    </div>
  );
}
