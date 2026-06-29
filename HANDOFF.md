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
- **Mock login flaky / "not logging in"?** The MSW session is in-memory (a reload
  logs you out) and the service worker can go stale. Fix: restart `npm run dev`,
  then a NORMAL reload (F5, not Ctrl+Shift+R) so the worker registers. If still
  stale: `npx msw init public/ --save`. For reload-heavy QA prefer real mode —
  the httpOnly refresh cookie keeps you logged in across reloads.
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
- **Production** (TuneCore reskin DONE; ported from reference Portal/didactik-production.jsx):
  DashboardPage (TuneCore: 6-up KPI strip, Needs attention, Recent screener
  requests, Broadcaster watchlists, and a first-party "Territory interest" panel
  that REPLACES the reference's YouTube signal — no audience data, by decision).
  AssetsPage (TuneCore cards + status filter pills + ScoreRing). AssetDetailPage
  (Frame.io: PipelineTracker + tabs Metadata/Credits/Assets/Rights/Activity, NO
  YouTube tab; rights CRUD is real; Credits/Assets/change-note banner are honest
  "not captured yet" stubs). ScreenerRequestsPage. New components PipelineTracker,
  ScoreRing. StudioHomePage deleted. AnalyticsPage route kept but unlinked from
  nav (orphan — candidate to remove). Submit wizard untouched (legacy).
  DECISIONS: YouTube/audience signal = omitted, replaced by first-party demand
  (watchlist x rights). Unmodeled data (Credits/Awards/Subtitles-Dubs/
  asset-validation/change-notes) = stubbed honestly; backend models PROPOSED
  (see below), awaiting go.
- **Backend follow-up PROPOSED (awaiting go):** Credit (PBCore contributorRole),
  Award, TitleLanguageTrack (subtitle/dub/original via Language FK); then
  per-asset validation_status + a ChangeRequest model. Lights up the stubbed
  production (and broadcaster) detail panels.

## Theme architecture
`src/index.css`: `.portal-cinema` (broadcaster dark), `.portal-control` (admin
Stripe-light + dense-console tokens). `src/portal/admin/admin.css` = reference CSS,
all scoped under `.portal-control`. `PortalLayout` picks theme by path PREFIX
(`/portal/admin` vs `/portal/broadcaster`) — do NOT use bare substring match
(`/portal/admin/broadcasters` contains "broadcaster").

## Onboarding (DONE)
- Pre-auth "Apply for access" at `/portal/apply` (src/portal/onboarding/):
  unified entry → choose broadcaster/production → minimal org+contact form →
  submit → confirmation. Low-friction by design; profile enriched after
  verification. Mock handler POST /api/v1/onboarding/applications/ (201).
  Login page links to it. REAL BACKEND ENDPOINT PENDING: POST
  /api/v1/onboarding/applications/ should create an UNVERIFIED org (+ contact)
  that lands in the admin "Organisations awaiting verification" queue. Marketing
  CTA added in didactik-media (Samuel's) Home -> /portal/apply.

## Known gaps / next
- **Broadcaster port NOT done**: a background agent died mid-run leaving only a
  broken types.ts edit, which was reverted. The broadcaster IMDb-Pro title
  detail + activity strip still need building (reference: Portal/didactik-broadcaster.jsx;
  same rules — replace YouTube/audience panel with first-party in-territory
  discovery; stub credits/awards/subtitles, now backed by Credit/TitleLanguageTrack).
- **Credits/Subtitles WIRED** (production detail): CreditsPanel renders real
  `title.credits` grouped by craft (Direction/Cast/Producing/Crew) with Primary
  badges; Metadata panel shows Subtitles/Dubs from `title.language_tracks`. Title
  type gained optional `credits`/`language_tracks`. "Add credit" stays disabled
  (no production write endpoint yet). Broadcaster detail still needs the same
  wiring as part of the broadcaster port.
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
