import { cloneElement, isValidElement, useId } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { DkFieldError } from './DkFieldError';

interface DkFieldProps {
  label: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  visuallyHiddenLabel?: boolean;
  labelClassName?: string;
  /** If wrapping a flex-child input, pass your flex utility (e.g. `flex-1`) via this prop, not on the child directly — DkField adds a DOM layer that breaks flex targeting. */
  className?: string;
  children: ReactElement;
}

const DEFAULT_LABEL_CLASS = 'mb-1 block text-sm font-medium text-gray-700';

// HeroUI's TextField structurally couples Label + Input + FieldError so the
// htmlFor/id association isn't left to markup order — this is a hand-ported
// version of that same guarantee for a codebase with no headless-UI library.
// One child control per Field; the id/aria-invalid/aria-describedby/
// aria-required are injected onto it via cloneElement rather than trusting
// each call site to wire them by hand.
export function DkField({
  label,
  required,
  hint,
  error,
  visuallyHiddenLabel,
  labelClassName,
  className,
  children,
}: DkFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
        'aria-required': required ? true : undefined,
      })
    : children;

  return (
    <div className={className}>
      <label htmlFor={id} className={visuallyHiddenLabel ? 'sr-only' : (labelClassName ?? DEFAULT_LABEL_CLASS)}>
        {label}
        {required && (
          <span aria-hidden="true" className="text-red-500">
            {' '}
            *
          </span>
        )}
      </label>
      {hint && (
        <p id={hintId} className="mt-0.5 text-xs text-gray-400">
          {hint}
        </p>
      )}
      {control}
      {error && <DkFieldError id={errorId}>{error}</DkFieldError>}
    </div>
  );
}
