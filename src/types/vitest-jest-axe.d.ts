// Merges jest-axe's toHaveNoViolations matcher into vitest's own Assertion
// interface, the same way @testing-library/jest-dom/types/vitest.d.ts does
// it — a real module augmentation, since 'vitest' already has real types to
// augment (unlike jest-axe; see jest-axe.d.ts for why that one has to be a
// separate, import-free file).
import 'vitest';

declare module 'vitest' {
  interface Assertion<T = unknown> {
    toHaveNoViolations(): T;
  }
}
