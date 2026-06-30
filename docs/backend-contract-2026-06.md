# Backend contract delta — didactik-archive → didactik-portal (2026-06-30)

Changes landed in `didactik-archive` this session that the portal must consume.
One is a **breaking** intake change; the rest are **additive**.

## 1. 🔴 BREAKING — rights warranty required at intake

`POST /api/v1/production/titles/initiate-upload/` now **requires a new field**:

```jsonc
{
  // ...existing fields...
  "consented": true,
  "rights_attested": true   // NEW — required; omit or false → HTTP 400
}
```

`rights_attested` is the producer's **content-provenance warranty (Q2)** — that
they hold the rights to license the work, including **four dimensions**: title/
ownership, music clearance, personality/property releases, and co-production
splits. It is distinct from `consented` (Q1, data-transfer consent) and must be
an explicit, affirmative checkbox — not defaulted true.

The producer must *read* a warranty before affirming. The warranty copy to
render is mirrored from the backend `attestation_texts.py` (see
`src/portal/production/attestationTexts.ts`). The backend snapshots its own copy
into an immutable `RightsAttestation` record; the portal only sends the boolean.

**Until this field is sent, every production submission 400s.** This is the
release blocker — ship the intake-form change with (or before) the backend.

Implemented here: `SubmitPage.tsx` (schema/payload/step gating),
`Step3Consent.tsx` (the affirmation UI), `attestationTexts.ts` (the copy).

## 2. 🟡 ADDITIVE — server-side title search (`?q=`)

The three title-list endpoints now accept a `?q=` query param (trigram,
diacritic-insensitive, role-filtered — returns only what the caller may see):

- `GET /api/v1/broadcaster/titles/?q=<query>`
- `GET /api/v1/production/titles/?q=<query>`
- `GET /api/v1/admin/titles/?q=<query>`

Backward compatible: no `q` → the existing full list. Matches on title name,
original title, logline, and synopsis. (Taxonomy/cultural-tag search is *not*
included — Title has no TaxonomyTerm link; this is name/text search only.)

Implemented here:
- **Broadcaster `DiscoverPage`** — switched from a name-only client filter to
  server `?q=` (debounced, `keepPreviousData`); now also matches synopsis/logline.
- **Production `AssetsPage`** — added a search box wired to `?q=` (it had only
  status pills before); pills filter client-side over the search results.
- **Admin `LibraryPage`** — INTENTIONALLY left client-side. Its filter matches
  title name **and production-company name**; `?q=` matches only title text, so
  wiring it would *regress* producer-name search. At pilot scale the richer
  client filter wins. Revisit if the admin library outgrows client-side.

## 3. 🟢 No action — transparent

`metadata_score` now returns a correct computed value (response shape unchanged);
no portal change needed.
