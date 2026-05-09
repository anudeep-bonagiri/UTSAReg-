# Roadmap — UTSA Registration Plus

What's shipping, what's next, what funding unlocks.

---

## v0.1 — Foundation (shipped, May 2026)

The slice you see today.

| Capability                                              | Status |
| ------------------------------------------------------- | ------ |
| Light-mode design system (8 Radix-backed primitives)    | ✅     |
| Live RateMyProfessor on every section, SWR-cached       | ✅     |
| Real catalog data (1,416 UTSA courses, scraped live)    | ✅     |
| Conflict-aware search results (cross-out on overlap)    | ✅     |
| Weekly schedule grid with click-to-detail               | ✅     |
| F1 mode (filter online-async, in-person credit counter) | ✅     |
| Theme toggle (light / dark) with sync                   | ✅     |
| 192 tests, 5 quality gates green                        | ✅     |

---

## v1.0 — First public release (target: end of summer 2026)

Goal: Ship to the Chrome Web Store before fall 2026 registration opens
(~ early August). The work below is what stands between v0.1 and that.

### v1.0a — Real ASAP harvester (3 weeks of work)

The single biggest piece. Replaces the curated demo dataset with live
section data.

- Detect Banner version from the live ASAP DOM (Banner 8 vs Banner 9 SSB).
- Banner 9: hit `/StudentRegistrationSsb/ssb/searchResults/searchResults`
  using the user's authenticated session, pull JSON directly.
- Banner 8 fallback: parse `.datadisplaytable` HTML.
- IndexedDB cache (chrome.storage caps at 10 MB; we'll outgrow that the
  moment we hold a full term's section data).
- Cross-tab freshness sync via `chrome.storage.onChanged`.
- Manual refresh button: opens ASAP, harvests, returns.

### v1.0b — Bluebook grade-distribution ingest (1 week)

- One-shot Node script to ingest UTSA Office of Institutional Research CSV
  exports → `data/grades.json` keyed by `{course, instructor, term}`.
- Course detail dialog renders an A–F histogram via Chart.js.
- GPA-protect mode flips from "wired but inert" to a real filter.

### v1.0c — Polish + Web Store prep (1 week)

- Loading skeletons (currently we show "fetching rating..." which is fine
  for demo but rough for production).
- Error boundaries at every entry point.
- Keyboard navigation pass: arrow keys through results, Enter selects,
  Esc closes dialog.
- Lighthouse a11y ≥ 95 on popup + dashboard.
- Privacy policy page, screenshots, demo GIF for Chrome Web Store listing.

**v1.0 ships when:** any UTSA student can install from the Web Store, log
into ASAP, and have a fully-loaded extension with live sections, live RMP,
and grade history within 60 seconds. Funding from the university unlocks
the dedicated developer time to do this right.

---

## v1.1 — Schedule optimizer (target: October 2026)

The killer feature.

> "I want to take CS 3343, CS 3443, MAT 1224, ENG 1013, and one humanities
> elective. No classes before 10am. No Friday afternoons. Highest possible
> RMP. Best historical grade outcomes. Show me the top 5 valid schedules."

Algorithm: branch-and-bound search across the cross-product of all valid
section combinations, scored by a weighted sum of (RMP rating, average
grade, time-of-day preference, gap penalty). Tractable for ≤ 10 courses
because most students have hard time constraints that prune the search
space aggressively.

UI: existing Settings panel grows a "Schedule optimizer" tab; output is a
ranked list of weekly grids with their score breakdown.

---

## v1.2 — Waitlist watcher (target: November 2026)

`chrome.alarms` polls the user's saved CRNs every 5 minutes via the same
ASAP harvester. When a closed section flips to open, fire a desktop
notification. The student gets the seat before the next student refreshes.

This is the feature that turns the extension from "useful for one week per
semester" into "installed all year." Critical for retention.

---

## v2.0 — Beyond UTSA (target: spring 2027)

The architecture supports it from day one. `packages/adapter-utsa` becomes
one of N adapters. Texas A&M, UNT, and Texas State are the natural first
three because they share the Banner-9 SSB lineage.

This is what the funding ask underwrites long-term: a Texas-wide student-
built tool that costs the universities nothing and saves their students
real time.

---

## What "the ask" pays for

If the funding lands, the time-and-money budget breaks down roughly:

| Bucket                    | Why                                                                                                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Faculty sponsor           | Anchors the project to a department, unlocks IT cooperation, opens doors for a Bluebook data partnership instead of brittle scraping.                                                      |
| Two semesters of dev time | Ships v1.0 → v1.2 before next fall registration. Without it, this stays a side project and slips behind the registration calendar.                                                         |
| Marketing surface         | A spot in the freshman orientation, a flyer in the CS lobby, a mention in the registrar's email. UT-RP got 80% adoption because UT Austin's CS dept evangelized it; we want the same lift. |
| Hosting (negligible)      | Open-source on GitHub. Chrome Web Store has no listing fee. Hosting cost: zero.                                                                                                            |

---

## Non-goals

Things we are deliberately not building, even if asked:

- A replacement for ASAP itself. We augment it; the registrar still owns
  the source of truth.
- A grade prediction tool. Telling a student "you'll probably get a C" is
  ethically dubious and statistically unreliable on the data we'd have.
- A social layer (course chat, "who else is taking this"). Privacy first.
- Any feature that requires the user to share login credentials.
