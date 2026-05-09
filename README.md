# UTSA Registration Plus

A Chrome extension that turns UTSA registration from a six-tab scavenger hunt
into a single, polished surface — with **live RateMyProfessors data on every
section**, **conflict-aware scheduling**, and **F1-mode credit-hour protection
for international students**.

Built by a UTSA student, for UTSA students.

## Status

```
v0.1 — May 2026
6 packages, 11 commits, 192 tests, all five quality gates green
```

| Surface                       | What it does                                                          |
| ----------------------------- | --------------------------------------------------------------------- |
| **Toolbar popup** (420×600)   | Quick search, schedule preview, saved bookmarks                       |
| **Full-page dashboard**       | Course explorer, weekly schedule grid, course detail dialog, settings |
| **Background service worker** | Live RMP GraphQL fetches with SWR cache (chrome.storage.local)        |
| **Content script**            | Stub for future ASAP DOM/JSON harvest                                 |

## Architecture

This is a **monorepo** with strict separation of concerns:

```
apps/extension/         Chrome MV3 surface — popup, dashboard, content, background
packages/core/          Pure domain logic: Zod schemas, schedule engine, freshness types
packages/ui/            Design system: tokens + Radix-backed primitives (Button, Card,
                        Input, Badge, Tooltip, Dialog, Select, Toast, FreshnessChip)
packages/adapter-utsa/  UTSA-specific data adapters: live RMP GraphQL client,
                        catalog.utsa.edu scraper, ASAP parser scaffolding
data/                   Live-scraped catalog (1416 courses) + curated demo sections
scripts/                Build-time scrapers: `npm run data:catalog`, `npm run smoke:rmp`
```

**Why a monorepo from day one:** the same domain code (schedule conflicts, the
optimizer, prereq DAG) will power a future mobile companion app and a planned
multi-university expansion. UTSA-specific code is isolated behind
`packages/adapter-utsa`; swapping in `adapter-tamu` or `adapter-unt` doesn't
touch any UI.

## Quality bar

Every commit must pass five gates:

```
$ npm run typecheck   # strict TS, noUncheckedIndexedAccess, no any
$ npm run lint         # ESLint flat config, type-aware rules, jsx-a11y
$ npm test             # Vitest, 192 tests, ~70-90% per package
$ npm run build        # Vite build, MV3-valid output
$ npm run format:check # Prettier
```

## Real-data smoke tests

We never trust the network mocks. Two opt-in scripts hit production endpoints:

```
$ npm run smoke:rmp
   ✓ schoolId = U2Nob29sLTE1MTY=
   ✓ Murtuza Jadliwala  → 4.50★ (4 reviews)   diff 3.0   100% retake
   ✓ Rajendra Boppana   → 2.40★ (32 reviews)  diff 4.1   19%  retake
   ✓ Tinghui Wang       → 4.50★ (10 reviews)  diff 2.5   89%  retake

$ npm run data:catalog   # scrapes catalog.utsa.edu live (~600ms)
   1416 courses across 15 subjects → data/catalog.json
```

## Install (for the demo)

```bash
git clone <this-repo>
cd UTSARegPlus
npm install
npm run build
```

Then in Chrome:

1. Open `chrome://extensions`
2. Toggle **Developer mode** (top-right)
3. Click **Load unpacked**
4. Select `apps/extension/dist/`
5. Pin **UTSA Reg+** to your toolbar
6. Click the icon → popup opens. Click the dashboard icon → full surface.

## Privacy

- **Zero telemetry.** No analytics, no error tracker, no remote logging.
- **All processing local.** RMP fetches go through the extension's own
  service worker; no intermediate server.
- **Permissions minimal.** Only `storage`, `activeTab`, and host permissions
  for `asap.utsa.edu`, `catalog.utsa.edu`, `utsa.simplesyllabus.com`.

## What's next

See [`ROADMAP.md`](./ROADMAP.md) for the v1.1 / v1.2 / v2 plan that the
funding ask supports.

For the funding-pitch flow itself, see [`DEMO.md`](./DEMO.md).
