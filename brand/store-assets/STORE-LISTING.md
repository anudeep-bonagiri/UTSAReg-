# Chrome Web Store listing — UTSA Reg+

Drop-in copy for every field on the developer dashboard listing form.

---

## Title (45 char max)

```
UTSA Reg+ — Live Course Registration Tools
```

## Summary (132 char max — appears under the title in search)

```
Live UTSA section data, real-time RateMyProfessor ratings, conflict-aware schedule building, and F1-aware credit tracking.
```

## Description (16,000 char max — paste this whole block)

```
UTSA Reg+ replaces the six-tab registration shuffle — ASAP, RateMyProfessors, Bluebook, the catalog, Simple Syllabus, and a spreadsheet — with a single live surface, built by a UTSA student for UTSA students.

WHAT'S LIVE
• 2,400+ Fall 2026 UTSA sections fetched live from asap.utsa.edu/pls/prod/bwckschd. Real CRNs, real instructors, real meeting times, real classrooms.
• RateMyProfessors ratings, difficulty, and would-take-again percentage on every section card. Live GraphQL fetches, SWR-cached for instant repaint.
• 1,416 catalog course descriptions and prerequisites scraped live from catalog.utsa.edu.
• Department + course counts from utsa.simplesyllabus.com.
• Every piece of data carries a freshness chip showing when it was last fetched. We never lie about whether something is live, cached, or stale.

WHAT'S DIFFERENT
• F1 mode — international students must keep ≥12 in-person credit hours to maintain CPT/OPT eligibility. UTSA Reg+ filters online-async sections out of search results and warns when in-person credit count drops below 12. No other tool at UTSA does this.
• Conflict-aware search — add a section to your schedule and any overlapping result crosses out automatically. No more registration-day "section conflicts another class" surprises.
• Visual weekly schedule grid color-coded by course, with click-to-detail.
• Saved schedules persist across the popup and the full dashboard, synced via chrome.storage.

PRIVACY BY CONSTRUCTION
• Zero telemetry. No analytics. No remote logging. Ever.
• All processing happens locally in your browser. RMP, ASAP, and Simple Syllabus fetches go through the extension's own service worker — never an intermediate server.
• No PII stored. Your saved schedule lives in chrome.storage.local — same tier as a browser bookmark.
• Open-source. Verify the claims at the source.

WHAT'S COMING
v1.1 — Schedule optimizer (best valid combination of your wanted courses, ranked by RMP + grade history + compactness).
v1.2 — Waitlist watcher with desktop notifications when a closed section opens up.
v2.0 — Multi-university support (Texas A&M, UNT, Texas State).

BUILT FOR UTSA, NOT IMPERSONATING UTSA
UTSA Reg+ is faithful to UTSA's brand identity (Orange #F15A22, Midnight #032044, Limestone canvas, Manrope/Inter typography) but never reuses UTSA's official logos, wordmarks, or trademarks. This is a student-built independent product. Not affiliated with the registrar.

QUESTIONS, BUGS, SUGGESTIONS
GitHub Issues: github.com/[your-handle]/UTSARegPlus/issues
Email: anudeep.bonagiri@gmail.com
```

(Length: ~1900 characters. Plenty of headroom in the 16K budget if you want to add more.)

---

## Category

`Education` ✓

## Language

`English` ✓

## Mature content

`No`

---

## Graphic assets — what to upload

### 1. Store icon (128×128 PNG)

Source: `brand/store-assets/store-icon-128.svg`

Convert to PNG:

1. Open the SVG file in **Preview** (macOS), File → Export, format PNG, resolution 128 px.
2. Or open in **Figma**, place at 128×128, export as PNG.
3. Or open in Chrome, right-click → Inspect → in Sources tab right-click the SVG → Save as → "image/png" rendering.

You can also reuse `apps/extension/public/icons/icon128.png` if you prefer the existing icon — it ships with the extension.

### 2. Marquee promo tile (1400×560 PNG, no alpha)

Source: `brand/store-assets/marquee-1400x560.svg`

The SVG renders to exactly 1400×560 — open it in Chrome, take a full-element screenshot via DevTools (Cmd+Shift+P → "Capture node screenshot"), or open in Figma at 1× and export PNG.

### 3. Small promo tile (440×280 PNG, no alpha)

Source: `brand/store-assets/small-promo-440x280.svg`

Same conversion process as the marquee.

### 4. Screenshots (1280×800 PNG, up to 5)

Take these manually after loading the extension. Suggested shots, in order:

1. **Popup with search results** — open the popup, type "CS 3343", screenshot the full popup with the 3 section cards visible. Use the system screenshot tool (Cmd+Shift+4 on macOS, then Space, then click the popup).
2. **Course detail dialog** — click any section in the dashboard to open the dialog, screenshot it. The live RMP stat tiles + Syllabus Library panel are the highlight.
3. **Weekly schedule grid** — add 4–5 sections to your schedule, navigate to the Schedule tab on the dashboard, screenshot the colored weekly grid.
4. **F1 mode in Settings** — go to Settings, toggle F1 mode on, screenshot the toggle row + the warning card it produces on the schedule view.
5. **Search with conflict cross-out** — add CS 2123 to your schedule, search for "CS 2123", screenshot the result that's crossed out due to time conflict.

For each screenshot:

- Use Chrome at exactly 1280×800 viewport (DevTools → device toolbar → "Responsive" → set 1280×800).
- Save as PNG with no alpha channel (Preview can do this on save).

---

## URLs (optional but recommended)

### Homepage URL

If you have GitHub Pages or a personal site:

```
https://github.com/[your-handle]/UTSARegPlus
```

If not, leave blank for now and add later.

### Support URL

```
https://github.com/[your-handle]/UTSARegPlus/issues
```

---

## Visibility

Set to **Unlisted** for the funding-pitch demo (link-only access, won't appear in search). Switch to **Public** after the pitch lands and you've stress-tested it with a few peers.

---

## Test instructions (for Google reviewers)

```
This extension does not require login or any account. To test:

1. Click the toolbar icon to open the popup.
2. Type "CS 3343" in the search box. Three real Fall 2026 UTSA sections should appear.
3. Each section card fetches a live RateMyProfessor rating in the background. Wait ~1-2 seconds; the rating chip should populate.
4. Click any "Add" button to put the section in your schedule, then switch to the Schedule tab to see it.
5. Click the dashboard icon (top-right of popup) to open the full-page experience. The Course Detail dialog (click any card) shows the live Syllabus Library counts pulled from utsa.simplesyllabus.com.

No account, no payment, no PII collected.
```
