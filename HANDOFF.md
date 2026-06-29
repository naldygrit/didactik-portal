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
- **Verify:** `npx tsc -b --noEmit` and `npx vitest run` (currently 86 passing).

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

## Monetisation / deals (DONE — reverses the off-platform call)
- Funnel: screener → EOI (no price) → **Offer** (priced bid) → production accepts
  → **Deal** → Didactik commission (15% default). Surfaces:
  - Broadcaster detail Rights tab: MakeOfferForm (amount/currency/license/territory/
    window) → POST /broadcaster/offers/ (gated on screener).
  - Production detail "Offers" tab: the bid board with Accept/Decline (accept →
    Deal via /production/titles/offers/{uuid}/accept/).
  - Production "Earnings" page (+ nav): deals net of commission + payout-account
    CRUD.
  - Admin "Revenue" page (+ nav, Platform group): GMV + Didactik commission +
    recent deals.
  Money values are strings (DecimalField). Mocks added for every endpoint.

## Recently viewed (DONE)
- RecentlyViewedContext (adapted from Samuel's didactik-media, Title-based +
  localStorage persistence). Provider wraps PortalApp; broadcaster detail calls
  registerView; a "Recently viewed" rail renders on the broadcaster browse home.

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
- **Broadcaster IMDb-Pro title detail DONE**: BroadcasterAssetDetailPage rebuilt
  dark (cinema tokens) — backdrop hero + genres/awards tags + meta line, sticky
  tabs Overview / Credits / Rights & screener. Overview shows synopsis + fields
  incl. real Subtitles/Dubs; Credits renders real `title.credits`; the Rights tab
  reuses the working ScreenerPanel (rights availability + request + watchlist).
- **Broadcaster home surfaces DONE**: activity strip (New in your territories /
  On your watchlist / Pending screeners / Active screeners) + "Opening soon in
  your territories" panel — the first-party in-territory signal that REPLACES the
  reference's YouTube/audience panel (uses /broadcaster/dashboard/
  rights_opening_soon + watchlist/screener counts, no audience data). Detail has a
  "More like this" similar-titles rail. Mock /broadcaster/dashboard/ added.
  LicensesPage ("My activity") already covers watchlist + screeners with status;
  optional follow-up = split into the reference's separate Watchlist + Screener
  pages grouped by status (not a gap).
- **Expression of Interest WIRED** (both portals): broadcaster detail Rights tab
  has an ExpressInterestForm (territory/rights/window/exclusivity/message, no
  price) → POST /broadcaster/expressions-of-interest/ (server-gated on screener
  access; 403 → friendly prompt). Production detail has an "Interest" tab showing
  EOIs with broadcaster identity + a "Competitive interest" banner from
  /production/titles/{slug}/interest/. Mocks added for both.
- **Assets panel WIRED** (production detail): fetches /production/titles/{slug}/assets/
  and renders each file with its validation status (validated/failed/pending) +
  failure note; required types not uploaded show as "missing" rows. Upload/Replace
  actions disabled until a production write endpoint exists.
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
- `feat(production)` upload-first wizard: the master file picker is on step 1 and
  streams to B2 in the background (POST production/titles/upload-url/ then PUT)
  while the filmmaker fills the form; step 3 is "Review & submit" and the submit
  links the already-uploaded file_key. In mock mode upload-url returns a null URL
  (treated as done). Added the genres picker (chips) on step 1 (GET /genres/).
- `feat(production)` LOOP A frontend: the submit wizard now creates a canonical
  Title (not a legacy Asset). Step 1 is Title-grade: name, type (film/series/
  documentary/short/animation), year, runtime, logline, synopsis, original
  language + other-languages pills, country of origin + co-production pills.
  Upload posts to production/titles/initiate-upload/ then confirm-upload. Genres
  picker deferred (no genres endpoint yet); the legacy /assets/initiate-upload
  path is now unused and can be retired.
- `feat(broadcaster)` competitive bid panel (the reference "Place a bid" design):
  licensing range, "N broadcasters are bidding · top bid $X", your leading state,
  place/raise bid. Replaces the flat offer form in the card modal (BidPanel, wired
  to /bidding/ + /bid/, mock-backed). Also fixed dark <select> options that were
  white-on-white until hover.
- `feat(broadcaster|production)` DetailModal (card click) now shows Express interest
  + Make offer alongside the screener; production Earnings shows Gross + Net columns;
  "Continue to upload" disabled until all step-2 fields AND consent are complete;
  de-em-dashed the other consent texts + aligned licensing_preference values.
- `feat(production)` "Continue to upload" is disabled until the consent box is
  ticked. Removed em dashes from the NDPA consent text mirror (copy bench).
- `feat(production)` licensing-destination on the filmmaker upload: a "Where would
  you like this licensed?" radio (Nigerian / international / Both [Recommended]) in
  the Rights & consent step. International/both appends the international-licensee
  clause to the displayed consent text + shows a heads-up; payload carries
  `licensing_preference`. Backend snapshots it into the NDPA s.43 Consent record.
- `feat(production)` submit-a-title required-fields + bench polish: year, synopsis,
  language, country now required (Filmhub/Apple/MEC); removed duplicate sidebar
  submit entry (kept the pill); rail contrast fix; "Synopsis" label
- `redesign(production)` submit flow: 4→3 steps (TuneCore left rail, motion, copy)
- `feat(production)` hide Didactik commission on the earnings page (admin-only now)
- `feat(offers)` screener + bid are parallel, not sequential; `screened` flag + badge
- `polish(admin)` sidebar refinement (brand divider, footer avatar, nav rhythm +
  smoother motion, accent-tinted active badge)
- `polish(admin)` subtle card shadow + hover lift; added HANDOFF.md
- `polish(admin)` design+copy bench pass (filter chip, hierarchy, empty states, copy)
- `fix(admin)` screener tab order (Pending default), sticky-filter clear, nav
  routing + theme-prefix match, labels
- `feat(admin)` dense Stripe/Linear ops-console reskin to reference
- `feat(production|admin|broadcaster)` auction → screener migration (3 slices)
