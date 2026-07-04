// Minimal local shim for jest-axe's types, used instead of @types/jest-axe.
// @types/jest-axe depends on @types/jest, which conflicts with vitest's own
// global `expect` typing (e.g. expect(value, message) — vitest's
// two-argument form — stops type-checking once @types/jest's
// single-argument expect() is pulled into scope).
//
// This is a plain global script file (no top-level import/export) on
// purpose: `declare module 'jest-axe'` here *creates* a fresh ambient
// module, since jest-axe has no pre-existing types anywhere. Putting this
// in a file that also has a top-level `import` turns it into a module
// augmentation instead, which requires an existing module to attach to —
// jest-axe has none, so the import silently fails to resolve. The vitest
// `Assertion` augmentation (which genuinely is an augmentation of a real,
// already-typed module) lives in its own file for that reason.
declare module 'jest-axe' {
  import type { AxeResults, RunOptions } from 'axe-core';

  export function axe(html: Element | string, options?: RunOptions): Promise<AxeResults>;
  export function configureAxe(options?: RunOptions): typeof axe;
  export const toHaveNoViolations: unknown;
}
