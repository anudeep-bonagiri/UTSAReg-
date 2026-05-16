# Demo script — UTSA Registration Plus funding pitch

**Total runtime: ~3 minutes.** Optimized for a tight, technical-but-empathetic
audience (faculty, deans, student-success staff). Cut to 60 seconds for an
elevator-pitch version by stopping after Beat 3.

---

## Setup (do this 5 minutes before the meeting)

1. Run `npm run build` in `~/Desktop/UTSARegPlus/`.
2. Load the unpacked extension at `apps/extension/dist/` in Chrome.
3. Open the popup once and clear cached state (Settings → "Clear cache" if
   you've already demo'd today).
4. Have **`chrome://extensions`** + the **dashboard tab** + **a tab on
   `asap.utsa.edu`** ready in the same window.
5. Verify connectivity: pop the icon, search **"CS 3343"**, confirm three
   sections appear with **live ratings** (you should see "Live · just now"
   freshness chips). If any chip says "Stale" or you see only loading
   spinners, restart Chrome — the worker may have been killed.

---

## The pitch

### Beat 1 — The pain (15 seconds)

> "When you register for classes at UTSA today, you're juggling six tabs:
> ASAP, Bluebook, RateMyProfessors, the catalog, Simple Syllabus, and a
> spreadsheet to check time conflicts. UT Austin students don't do this —
> they have **UT Registration Plus**, which puts everything in one extension.
> 80% of UT undergrads use it. We don't have one at UTSA. So I built one."

### Beat 2 — The product, live (60 seconds)

**Open the popup.** Pin it to the toolbar so the audience sees it.

> "This is the toolbar popup. I type **'CS 3343'** — Algorithms — and three
> real sections come back."

_Type **CS 3343**. Three section cards appear._

> "Each card shows the instructor and their **live RateMyProfessor rating** —
> notice the chip says **'Live · just now'**. That's not a screenshot; the
> background worker just hit RMP's GraphQL API."

_Hover the rating to show the difficulty + retake-percent tooltip._

> "I'll click **Add** on Najem's section."

_Click Add. The popup jumps to the Schedule tab._

> "Schedule tab shows my saved sections and the credit total — 3 credits."

_Click the dashboard icon (top right)._

### Beat 3 — The dashboard (45 seconds)

The dashboard opens as a full-page experience.

> "This is the full dashboard. Same data, more breathing room. Let me search
> **'CS 2123'** — Data Structures."

_Type. Two sections appear in a 2-column grid._

> "I'll add Sherette's section. Now look at the second one — Jadliwala — it's
> **crossed out**, because it conflicts with the section I already have."

_Add a non-conflicting section. Click Schedule in the sidebar._

> "Weekly grid. Color-coded by course, tap a block for full detail."

_Click any block. Course detail dialog opens._

> "Detail dialog: live RMP, full course description with prereqs, enrollment,
> open-on-RMP and view-syllabi links — all in one click instead of six tabs."

_Close the dialog._

### Beat 4 — The differentiator (45 seconds)

This is the funding moment.

> "Here's what UT Registration Plus doesn't do."

_Click Settings in the sidebar._

> "**F1 mode.** I'm an F1 student — I'm legally required to maintain at least
> 12 in-person credit hours, or my work authorization gets pulled. There is
> no tool today that makes this easy. Watch."

_Toggle F1 mode on. Click Schedule._

> "Now: in-person credit counter, separate from total. If I drop below 12,
> the dashboard warns me. Critically: any online-async section is filtered
> out of every search result automatically — I won't even see it as an
> option."

_Click Explore, type **'CS 3443'** with F1 mode on._

> "CS 3443 has an online section. Notice it's not here. F1 mode hid it."

_Toggle F1 mode off. Search again._

> "Now it's back. UTSA has roughly 4,000 international students. None of
> them have a tool that does this today. We do."

### Beat 5 — The architecture + ask (30 seconds)

> "A few things matter for whether this is real or a class project:
>
> - **Live data, never mocked.** Catalog scraper hit catalog.utsa.edu and
>   pulled 1,416 real UTSA courses. RMP fetches are real GraphQL calls.
>   Every adapter has a smoke-test command that proves it still works.
> - **Privacy by construction.** Zero telemetry. All processing happens in
>   the user's browser. No server.
> - **210 tests, 5 quality gates green on every commit.** Strict TypeScript,
>   ESLint, Prettier, Vitest — no shortcuts.
> - **Designed for scale.** Monorepo with `packages/adapter-utsa` isolated.
>   When other Texas universities ask for it, swapping the adapter is a
>   week of work.
>
> What I'm asking the university for:"

_(Slide / one-line ask, e.g. "$5K and a faculty sponsor for two semesters of
development time so I can ship F1-mode + the schedule optimizer + waitlist
watcher to every UTSA student before fall 2026 registration opens.")_

---

## Q&A — anticipated questions

**Q: Why not just build it on the registrar's website?**
A: ASAP is Banner — the registrar can't change it without a Banner upgrade
project costing six figures and a year. An extension augments it without
touching it. UT-Registration-Plus has been doing exactly this for 8 years.

**Q: How do you handle students who aren't logged into ASAP?**
A: We never need their session — the RMP and catalog data are public. ASAP
section data is the only piece that needs their session, and the harvester
runs _only when they're already on ASAP_. Their data never leaves their
browser.

**Q: What about FERPA?**
A: We store nothing about the user. No PII, no IDs, no transcripts. Their
saved schedule lives in chrome.storage.local — same tier as a browser
bookmark. The extension is open-source so anyone can verify.

**Q: How do you keep the catalog fresh when UTSA updates it?**
A: The scraper runs in 600ms against the live catalog — we re-bundle on
every release. Once the user has the extension installed, they get fresh
data automatically when Chrome pushes the update.

**Q: What if RMP changes their API?**
A: Smoke test runs nightly. If it fails, we're notified and ship a fix.
The adapter is isolated in one package so the fix is contained.

**Q: What stops you from extending this to other Texas schools?**
A: Nothing. The architecture supports it from day one. Texas A&M, UNT, and
Texas State are the natural next three. (This is the v2 ask if v1 lands.)

**Q: Why not just contribute to UT-Registration-Plus?**
A: UT-RP is built around UT Austin's class search format and Banner version.
Their team has politely declined "branch for other schools" feature requests
in the past — it's not their mission. UTSA students need a tool that's
designed for UTSA, including the F1 logic, Bluebook integration, and the
specific Banner version we run.

---

## Backup demo paths

If something fails live, here's the fallback ordering:

1. **RMP not loading** → switch to a search like "Jadliwala" — local
   instructor name, name-only fuzzy match still works against cached entries
   from prior runs.
2. **Dashboard slow to render** → use the popup version exclusively. Same
   features, smaller surface, faster perceived load.
3. **Build broken** → run `npm run smoke:rmp` in a terminal. The 5-line
   output proves the live data path works even without UI.

If the extension fails entirely: pull up `apps/extension/src/popup/App.tsx`
in your editor and walk through the architecture. The CODE is the proof.
