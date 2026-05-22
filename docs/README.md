# Didactik Portal — Frontend

React + TypeScript + Vite + Tailwind frontend for the Didactik Media platform.
Serves the production company portal and broadcaster portal.

## Repository history

This repository was split from `SamuelOgbonnaeze/didactik-media` on 2026-05-22.
The portal branch (`8dee898`) was cloned as a standalone repo and its history
preserved. Sessions 9 and 10 of the portal build (JWT auth foundation +
submission flow + asset list + broadcaster discover) are in this commit history.

The marketing site continues at `SamuelOgbonnaeze/didactik-media` on the `main`
branch (Samuel Ogbonnaeze). Do not merge that repo's history into this one.

## Related repositories

- `naldygrit/didactik-archive` — Django backend, schema, admin portal, API layer
- `SamuelOgbonnaeze/didactik-media` — Marketing site (didactikmedia.com)

## Dev setup

```bash
npm install
npm run dev        # Vite dev server at localhost:5173; proxies /api → localhost:8000
npm run test       # Vitest (44 tests across 9 files as of Session 10)
npm run build      # Production build
```

Backend must be running at `localhost:8000` for API calls to resolve.
See `naldygrit/didactik-archive` for Django setup instructions.
