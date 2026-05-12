# Privacy Policy — UTSA Reg+

**Effective: May 2026 · v1.0**

UTSA Reg+ is a Chrome extension built independently for UTSA students. This policy describes — in plain English — what data the extension touches and what we promise about it.

## TL;DR

- We collect **nothing**.
- We send **nothing** to any server we control. There isn't one.
- Your saved schedule lives in your browser's local storage, the same tier as a bookmark.
- All network requests are between your browser and **public** UTSA / RateMyProfessors / Simple Syllabus endpoints — exactly the same requests you'd make if you opened those sites directly.

If you ever find a network request the extension makes that isn't covered below, that's a bug — please file an issue.

## What the extension stores locally

In `chrome.storage.local` (your browser, never leaves):

| Key | What it holds | Why |
|---|---|---|
| `schedule:v1` | CRNs of sections you've added or saved | So your schedule survives restarts |
| `prefs:v1` | Theme (light/dark), F1 mode, GPA-protect mode | Your settings |
| `rmp:v1:*` | RateMyProfessor ratings keyed by instructor name | Cache so we don't re-fetch on every popup open |
| `syllabus:orgs:v1` | Cached UTSA org tree from Simple Syllabus | Same — cache only |
| `asap:sections:v1` | Sections you saw on `asap.utsa.edu` while the extension was active | Powers the "Live · just now" data on cards |

In `chrome.storage.sync` (synced between your Chromes if you're signed in):

| Key | What it holds |
|---|---|
| `prefs:v1` | Same prefs as above, synced so your dark mode preference follows you |

**No PII, no UTSA student ID, no transcript data, no email, no name.** The extension never asks you for any of those.

## What network requests the extension makes

All requests are made from your browser, to publicly accessible endpoints. Nothing is proxied through a server we operate (we don't operate one).

| Endpoint | When | What's sent |
|---|---|---|
| `ratemyprofessors.com/graphql` | When you view a section card with an instructor | The instructor's name as a search query |
| `asap.utsa.edu/pls/prod/bwckschd...` | Only when **you** navigate there yourself | Your normal browser request — the extension just reads the page you loaded |
| `catalog.utsa.edu` | Only at extension build time (developer-side) | Public catalog scrape, baked into the bundled snapshot |
| `utsa.simplesyllabus.com/api/organization` and `/api/term` | Once per 6 hours when a course detail dialog opens | Public read-only endpoints, no auth |

**The extension never sends your saved schedule, your CRNs, your prefs, or any UTSA-specific data to any third party.** Those stay in your browser.

## What we do not do

- ❌ No analytics. No Google Analytics, no Mixpanel, no Amplitude, no nothing.
- ❌ No remote error tracking. No Sentry, no Bugsnag.
- ❌ No advertising. No tracking pixels.
- ❌ No A/B test framework.
- ❌ No "anonymous usage telemetry" — there's no usage telemetry at all, anonymous or otherwise.
- ❌ No login. No account. No password. We never ask.
- ❌ No remote logging. Errors stay in your browser console.

## Permissions the extension requests, and why

From `manifest.json`:

| Permission | Why |
|---|---|
| `storage` | To save your schedule and prefs locally |
| `activeTab` | So we can inject the content script when **you** are on `asap.utsa.edu` |
| `alarms` | Schedules a 12-hour background job to evict stale RMP cache entries and refresh the Simple Syllabus org tree |
| `scripting` | Same purpose as activeTab; required for MV3 content scripts |

Host permissions:
- `https://asap.utsa.edu/*` — to read the page you're already viewing
- `https://catalog.utsa.edu/*` — to potentially refresh course descriptions
- `https://utsa.simplesyllabus.com/*` — to fetch public org/term data
- `https://www.ratemyprofessors.com/*` — to fetch instructor ratings

We do **not** request `<all_urls>` or any host outside this list.

## Open source

The full source code is at https://github.com/anudeep-bonagiri/UTSAReg- — every claim in this policy is verifiable.

## Not affiliated

UTSA Reg+ is built independently by a UTSA student. It is **not** affiliated with, endorsed by, or sponsored by The University of Texas at San Antonio, UTSA Athletics, or any UTSA department. UTSA, the UTSA name, and the Roadrunners mark are property of their respective owners.

## Changes

If we ever change this policy, the change will be committed to the public Git history at the repo above. If a change reduces user privacy, we'll bump the version number and call it out in release notes.

## Contact

Anudeep Bonagiri · `anudeep.bonagiri@gmail.com`

For bugs or privacy concerns, open an issue at:
https://github.com/anudeep-bonagiri/UTSAReg-/issues
