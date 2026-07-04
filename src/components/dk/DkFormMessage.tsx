import type { CSSProperties, ReactNode } from 'react';

interface DkFormMessageProps {
  tone: 'success' | 'error';
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** So a field can point aria-describedby at this banner. */
  id?: string;
}

// Whole-form outcome banner (submit succeeded / failed). Unlike DkFieldError,
// this doesn't own any visual style — callers keep their existing banner
// classes (and, where a consumer needs colors that aren't in the Tailwind
// config, inline style) and just get the right role/aria-live for the tone:
// errors are assertive (role="alert"), success is polite (role="status")
// since it isn't urgent enough to interrupt.
export function DkFormMessage({ tone, children, className, style, id }: DkFormMessageProps) {
  return (
    <div
      id={id}
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
      className={className}
      style={style}
    >
      {children}
    </div>
  );
}
