# Accessibility remediation summary

Scope: [PR #1](https://github.com/naldygrit/didactik-portal/pull/1), 43 commits
(`3b8fb19`..`5438702`) plus a follow-up DkField fix (`60cfbef`). Built on a
HeroUI/React-Aria-pattern reference workflow (Context7-sourced; `@heroui/react`
was never installed as a dependency — see `CLAUDE.md`). Full audit of 43
components produced 10 Critical / 36 Moderate / 44 Minor findings, all fixed or
explicitly deferred (see "Deferred items" below).

This document is grounded in the actual commit diffs, not a recap of commit
messages.

## Visible changes

Anything a sighted user would notice without assistive tech: new controls,
visible state changes, or behavior changes.

- `55f47ce` — `FileUploadField.tsx`: new `focus-within:ring-2
  focus-within:ring-indigo-400` — a focus ring now appears on the dropzone
  (previously the input was `hidden`/unfocusable, so nothing could show).
- `a9fb098` — `PortalLayout.tsx`: brand-new hamburger toggle + slide-down nav
  panel added to all 3 portal header variants below `md` — no mobile nav
  existed there before at all.
- `6dadc35` — `LogoMarquee.tsx`: new visible Pause/Play button; the scroll
  animation now actually stops under `prefers-reduced-motion` (previously ran
  unconditionally).
- `0067d23` — `Header.tsx`: Escape now closes the mobile nav — new observable
  behavior.
- `fb72ca1` — `BidPanel.tsx`: focus now auto-moves into the amount input when
  the bid form opens — a visible focus ring appears on reveal that wasn't
  there before.
- `d374280` — `ExpressInterestForm.tsx`: a visible `*` now renders next to
  the "Territory" label.
- `1dba1cb` — `MakeOfferForm.tsx`: a visible red asterisk now renders next to
  "Licence fee".
- `22f3ebc` — `ImageWithSkeleton.tsx`: the loading skeleton's pulse animation
  now stops under `motion-reduce`.
- `e4030b0` — `LibraryPage.tsx`: select-all checkbox now actually renders the
  native indeterminate (dash) visual state via `.indeterminate = true`, not
  just checked/unchecked.
- `a2ad68a` — `PosterCard.tsx`: hover-only metadata reveal now also appears on
  keyboard focus (`group-focus-visible:max-h-8 …`).

## Under-the-hood changes

Same visual appearance; the DOM/accessibility tree changed.

- `3b8fb19` — *(docs only — `CLAUDE.md`, no app code)*
- `b7651dc` — `DkFieldError.tsx`, `DkFormMessage.tsx`: new primitives
  (`role="alert"`/`role="status"` + `aria-live`), unused until wired in later
  commits.
- `550c609` — `DkField.tsx`: new wrapper cloning `id`/`aria-invalid`/
  `aria-describedby`/`aria-required` onto its child + a `<label htmlFor>`.
- `ed513a4` — `DkPageHeading.tsx`, `DkCardTitle.tsx`: `div`/`span` → real
  `<h1>`/`<h2>`, identical CSS classes kept.
- `55f47ce` — `FileUploadField.tsx`: `<label htmlFor>`/id association
  replacing manual `onClick`+`useRef`; `hidden`→`sr-only` (stays focusable
  instead of removed); `role="progressbar"` + `aria-valuenow/min/max`.
- `4929278` — `Step1Metadata.tsx`: every field rewired through `DkField`;
  chip toggles gain `aria-pressed`; chip groups wrapped in `role="group"` +
  `aria-labelledby`.
- `e2505bc` — `Step2Submitter.tsx`: fields rewired through `DkField`, hint
  text linked via `aria-describedby`.
- `a9fb098` — `PortalLayout.tsx`: admin sidebar `div`→`<nav aria-label="Admin">`;
  active `NavItem` gets `aria-current="page"`.
- `315f948` — `ScreenerQueuePage.tsx`: full ARIA tabs pattern (`role="tablist/
  tab/tabpanel"`, `aria-selected`, roving `tabIndex`, arrow/Home/End nav) —
  same CSS, no visual diff.
- `6dadc35` — `LogoMarquee.tsx`: 3 of 4 duplicate logo sets get
  `aria-hidden="true"`.
- `b6a4256` — `Contact.tsx`: success/error messages wrapped in
  `DkFormMessage` (adds role/aria-live only); `vitest.setup.ts` gets a
  test-only `IntersectionObserver` polyfill.
- `b6ac2f7` — `PipelineTracker.tsx`: `role="list"`/`"listitem"`/
  `aria-current="step"`/`aria-label`; decorative nodes marked `aria-hidden`.
- `d222282` — `useDkDisclosure.ts`: new unused hook (open state,
  `aria-expanded`/`aria-controls`, Escape-close).
- `0067d23` — `Header.tsx`: `aria-controls`/id linkage added via the new hook
  (aria-expanded already existed).
- `fb72ca1` — `BidPanel.tsx`: `useDkDisclosure` wiring, `DkField`/
  `DkFormMessage`/`DkFieldError` swap-in, `role="status"`/`aria-live` on the
  "your standing" text.
- `d374280` — `DkFormMessage.tsx`: adds optional `style` prop (no visual
  effect alone); `ExpressInterestForm.tsx`: `useDkDisclosure` `aria-expanded`/
  `controls`, message/error swapped for identical-classed `DkFormMessage`/
  `DkFieldError`.
- `1dba1cb` — `MakeOfferForm.tsx`: `useDkDisclosure`/`DkFormMessage`/
  `DkFieldError` wiring.
- `172db65` — `Step3Consent.tsx`: local `useState` → `useDkDisclosure` on
  both toggles, ▲/▼ glyph `aria-hidden`, errors → `DkFieldError`;
  `PrivacyPolicyDrawer.tsx`: `role="region"` + `aria-labelledby` (via
  `useId`) + new `id` for the `aria-controls` target.
- `f1019e8` — `BidPanel.tsx`, `ExpressInterestForm.tsx`, `MakeOfferForm.tsx`:
  comment-only, no runtime change at all.
- `b60b5ee` — `PlaceholderPage.tsx`: `div`/`div` → `DkPageHeading` (`h1`/`p`),
  identical classes.
- `a4d187a` — `RevenuePage.tsx`: `DkPageHeading`/`DkCardTitle` swap (same
  classes), `aria-busy` on KPI grid, `aria-label` on table; `DkCardTitle.tsx`
  gains optional `style` prop.
- `4f019d5` — `OverviewPage.tsx`: `DkPageHeading` + `DkCardTitle` ×6,
  `aria-busy` on both KPI grids.
- `7acb3d7` — `BroadcastersPage.tsx`/`ProductionCompaniesPage.tsx`:
  `DkPageHeading`; select wrapped in `DkField` w/ visually-hidden label;
  `role="status"` loading text; `aria-label` table.
- `397e690` — `LibraryPage.tsx`: `DkPageHeading`; filter select wrapped in
  `DkField`; `role="status"`/`aria-live` on loading + bulk-selection count;
  `aria-label="Library"` table.
- `0b1cff5` — `ScreenerQueuePage.tsx`: `DkPageHeading`; a stale test comment/
  assertion replaced with a real `getByRole('heading')` check (test-only).
- `eb6829e` — `ScreenerPanel.tsx`: textarea wrapped in `DkField` (visually-
  hidden label, same textarea classes); watchlist "✓" glyph `aria-hidden`;
  errors → `DkFieldError` (identical classNames).
- `d8f6862` — `DkFormMessage.tsx`: optional `id` prop added; `LoginPage.tsx`:
  error `div`→`DkFormMessage` (same className), `aria-invalid`/
  `aria-describedby` on both fields, "Signing in…" wrapped in an `aria-live`
  span.
- `bc3ea4b` — `ApplyPage.tsx`: error `div`→`DkFormMessage`, identical
  className.
- `22f3ebc` — `ImageWithSkeleton.tsx`: skeleton gets `role="status"` +
  `sr-only` "Loading image" text; error fallback → `DkFieldError` (identical
  className).
- `59d920b` — `DetailModal.tsx`: focus trap (Tab/Shift+Tab cycling) + focus
  restore on close, `tabIndex={-1}`/`focus:outline-none` — no visual change.
- `9054014` — `ScoreRing.tsx`: `role="meter"` + `aria-label`/
  `aria-valuenow/min/max`, same classes.
- `3e02b68` — `TeamTree.tsx`: `role="list"`/`"listitem"`; team-member heading
  `h4`→`h3` with identical classes.
- `7b83c59` — `Footer.tsx` (4 icons), `SustainabilityStrip.tsx` (🌱),
  `Technology.tsx` (8 emoji): all get `aria-hidden="true"`, no class changes.
- `a8df67c` — `OurWork.tsx`: `div`/`motion.div` → `ol`/`motion.li` (same
  classes carry over); "01"-style number glyph gets `aria-hidden`.
- `0044c0d` — `ApplyPage.tsx`: `role="group"` + `aria-labelledby` (via
  `useId`) on org-type cards; also deletes a dead, unreachable inline
  `borderColor` style — no visual effect since it could never render.
- `91aa08a` — `SubmitPage.tsx`: `aria-current="step"` + `aria-hidden` on the
  status glyph; styles unchanged.
- `60cfbef` — `DkField.tsx`: adds a one-line JSDoc on the `className` prop
  documenting the flex-nesting gotcha below — no behavior change.

## Visual risk caught and reverted

A fix's first-pass approach would have shifted the visible layout, but the
same commit's diff shows the risk was corrected back to match the original
appearance.

**Recurring root cause, now fixed at the source:** wrapping an input in
`DkField` moves it one DOM level deeper (behind `DkField`'s own wrapper
`<div>`), which breaks any CSS rule that targeted the input directly via a
flex property (`flex: 1`, `flex-1`, `shrink-0`, etc. only apply to *direct*
flex children). This exact issue was independently rediscovered and patched
at five separate call sites before being documented on `DkField` itself:

- `fb72ca1` — `BidPanel.tsx`: wrapping the amount `<input>` in `DkField`
  broke the row's `flex-1` sizing (label now stacks above); corrected in the
  same diff — `flex-1` moved to the `DkField` wrapper, input set to
  `w-full`, `items-end` added to the parent row.
- `1dba1cb` — `MakeOfferForm.tsx`: splitting the shared label into two
  `DkField`s pulled currency/amount out of being direct children of the
  `flex gap-2` row; corrected with `w-20` on the currency wrapper and
  `flex-1` on the amount wrapper.
- `7acb3d7` — `BroadcastersPage.tsx`/`ProductionCompaniesPage.tsx`:
  `DkField`-wrapping the search input broke `admin.css`'s `.filter-bar input
  { flex: 1 }`; corrected with `flex-1` on the `DkField` wrapper (verified
  against `admin.css:648`).
- `397e690` — `LibraryPage.tsx`: identical filter-input nesting break, same
  `flex-1`-on-wrapper fix.
- `0b1cff5` — `ScreenerQueuePage.tsx`: decline-reason input broke
  `admin.css`'s `.decline-input { flex: 1; min-width: 140px }` (verified
  `admin.css:509`); corrected by moving `flex-1 min-w-[140px]` onto the
  `DkField` wrapper.

`60cfbef` closes this out: `DkField` already exposed a `className` prop that
targets its own wrapper (not a new one), so no API change was needed — the
fix was to document it on `DkField` itself with a one-line JSDoc, so the
sixth occurrence of this bug doesn't have to be independently rediscovered
and patched at a sixth call site.

Two more instances, same "new DOM layer breaks flex/box assumptions" shape,
unrelated to `DkField`:

- `8961d7d` — `ContentRail.tsx`: wrapping each `PosterCard` in a new
  `listitem` div broke `PosterCard`'s own `shrink-0` (no longer a direct flex
  child); corrected by moving `shrink-0` onto the new wrapper.
- `67fd1c8` — `LicensingPreference.tsx`: swapping `div`→`fieldset`/`legend`
  would've introduced the browser's default fieldset border/legend padding;
  corrected with `border-0 p-0 m-0` on the fieldset plus a legend padding
  reset, in the same diff.

## Doesn't fit any of the above (flagged rather than forced)

- `7187e6f` — `OverviewPage.tsx`/`ScreenerQueuePage.tsx`: the one real logic
  fix in this branch — `disabled={approve.isPending}` (shared across all
  rows) → scoped via `mutation.variables === req.uuid`. No DOM/ARIA/visual
  change under normal use; only observable during a concurrent in-flight
  request on a specific row.
- `71acb4d` — `package.json`, `vitest.setup.ts`, `src/types/*.d.ts`:
  `jest-axe` tooling/dev-dependency addition. No production component
  touched.
- `5438702` — `PortalLayout.tsx`: internal render-timing refactor (effect →
  adjust-state-during-render) to satisfy a lint rule. End-user behavior and
  DOM output are unchanged.

## Deferred items

Tracked in [`HANDOFF.md`](../HANDOFF.md)'s "Known gaps / next" section —
not duplicated here:

- **Footer's "opens in new tab" cue** — needs a fix. See HANDOFF.md for the
  specific file/links and the recommended fix.
- **Billboard's truncation** — assessed, no action needed. See HANDOFF.md
  for why.

Also see didactik-archive's `docs/deferred-items.md` for the cross-repo
overlap note on `Step3Consent.tsx`/`PrivacyPolicyDrawer.tsx` and the
still-open "TASK 5" test-coverage backlog item (unrelated to accessibility).
