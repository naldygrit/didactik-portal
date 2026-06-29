# HANDOFF — didactik-portal

> **Workflow rule:** read this file before starting work, and update it as part of
> every commit/push (what changed, what's next, any new gap). It is the living
> state of this repo across sessions.

## What this repo is
React + TS + Vite + Tailwind frontend for the Didactik three-portal platform
(broadcaster / admin / production company), talking to the `didactik-archive`
Django API. Marketing site lives in Samuel's `didactik-media`; this is the
authenticated portal app.

## Current branch
`feat/marketplace-portal` (pushed to origin `naldygrit/didactik-portal`).

## How to run
- **Mock mode (visual QA, no backend):** `.env.local` has `VITE_USE_MOCK=true`,
  then `npm run dev`. Hard-reload (Ctrl+Shift+R) if the MSW service worker is stale.
- **Real API:** set `VITE_USE_MOCK=false`, run the backend on :8000 and seed it
  (`cd ~/code/didactik-archive && .venv/bin/python manage.py runserver 8000` +
  `manage.py seed_demo`). Vite proxies `/api` → `:8000`.
- **Logins (both modes), password `demo`:** `admin` / `producer` / `broadcaster`.
- **Verify:** `npx tsc -b --noEmit` and `npx vitest run` (currently 82 passing).

## State of the three portals
- **Broadcaster** (Netflix dark skin, KEEP): migrated off the legacy auction/Asset
  API onto the Title model — browse, detail, ScreenerPanel (rights + request
  screener + watchlist). Skin already approved.
- **Admin** (Stripe-light dense ops console): full reskin to the reference mock,
  wired to `/api/v1/admin/*`. Overview (KPIs + triage + screeners-pending +
  orgs-awaiting-verification + activity + rights-coverage), Screeners (tabs,
  default Pending), Library (data table + status PATCH), Production-companies +
  Broadcasters tables, grouped sidebar with badges. Bench-polished (filter chip,
  KPI hierarchy, empty states, copy, subtle shadow + hover lift).
- **Production** (YouTube-Studio light, TuneCore reskin still PENDING): migrated to
  the Title/screener/rights model — dashboard, catalogue, title detail
  (completeness + screener interest + rights CRUD). Upload wizard untouched
  (legacy Asset intake).

## Theme architecture
`src/index.css`: `.portal-cinema` (broadcaster dark), `.portal-control` (admin
Stripe-light + dense-console tokens). `src/portal/admin/admin.css` = reference CSS,
all scoped under `.portal-control`. `PortalLayout` picks theme by path PREFIX
(`/portal/admin` vs `/portal/broadcaster`) — do NOT use bare substring match
(`/portal/admin/broadcasters` contains "broadcaster").

## Known gaps / next
- **Production → TuneCore reskin** (the remaining skin; production is still the
  generic YouTube-Studio light).
- **Library "Screeners" column** shows `—` — needs `screener_request_count` on the
  backend admin titles serializer. Frontend column ready.
- **Verify button** (org tables) disabled — needs a backend verification endpoint
  (`POST /admin/organisations/{type}/{id}/verify/` + AuditLog).
- Two pre-existing `set-state-in-effect` eslint warnings on the URL-sync effects
  (the established sidebar query-sync pattern; eslint still exits 0).

## Recent commits (newest first)
- `polish(admin)` sidebar refinement (brand divider, footer avatar, nav rhythm +
  smoother motion, accent-tinted active badge)
- `polish(admin)` subtle card shadow + hover lift; added HANDOFF.md
- `polish(admin)` design+copy bench pass (filter chip, hierarchy, empty states, copy)
- `fix(admin)` screener tab order (Pending default), sticky-filter clear, nav
  routing + theme-prefix match, labels
- `feat(admin)` dense Stripe/Linear ops-console reskin to reference
- `feat(production|admin|broadcaster)` auction → screener migration (3 slices)
