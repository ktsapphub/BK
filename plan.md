# UI Tweak Iteration Plan (Message 510 + Contact Scale Fix)

## Objectives
- Deliver the requested UI polish pass across 4 areas:
  1) Room background alternation from **Values → bottom** using **deep_royal_blue ↔ true_white**.
  2) Solutions carousel slide/card backgrounds match the Hero “See the Work” smokey-black gradient.
  3) Thoughts media containers get a subtle 1px soft blue/gray border.
  4) Contact room feels properly scaled (not oversized), with a better-proportioned form panel.
- Ensure contrast/legibility stays correct regardless of CMS theme choices (eyebrows, text, buttons).
- Prove changes via automated UI verification (testing_agent) and minimal visual spot checks.

---

## Implementation Steps

### Phase 1: POC (Core Verification of the UI Changes)
*(No external integrations; POC here is a “prove it visually + functionally” slice before broader polish.)*

**User stories (POC)**
1. As a visitor, I can visually distinguish each room from Values downward via alternating royal blue/white backgrounds.
2. As a visitor, I can read section labels (eyebrows) on both blue and white rooms.
3. As a visitor, I see Solutions carousel slides with a consistent smokey-black surface matching the hero CTA.
4. As a visitor, I see Thoughts images/videos framed with a subtle outline.
5. As a visitor, the Contact room’s form panel feels appropriately sized and readable on desktop.

**Steps**
- Confirm CMS section themes reflect the desired alternation (DB + seed script alignment).
- Ensure every room that uses `RoomEyebrow` passes `dark={themeFor(section.theme).isDark}`.
- Apply Solutions slide gradient + text contrast.
- Add Thoughts media borders (room + article reader).
- Resize Contact room spacing + constrain form panel width.

**POC Exit**
- Run `testing_agent` once for a targeted pass over Home + Thoughts reader.
- If failures: fix immediately and re-run until green.

---

### Phase 2: V1 App Development (Finalize and Harden the UI Changes)

**User stories (V1)**
1. As a visitor, I experience consistent blue/white alternation from Values through Contact with no “odd” mid-room palette breaks.
2. As a visitor, I can read all typography on royal-blue rooms (eyebrows, headings, body, buttons).
3. As a visitor, Solutions carousel navigation (prev/next/dots) remains accessible and visible on the darker slides.
4. As a reader, I can scan Thoughts listings and see all media clearly framed and consistent.
5. As a visitor, I can use the Contact form comfortably on desktop and mobile without it feeling oversized.

**Steps**
- Audit remaining rooms for theme-dependent styling regressions (borders, text colors, hover states).
- Verify Contact actions hover styling works in both dark and light themes.
- Ensure carousel badges/status pills remain readable on dark background.
- Ensure no z-index regressions with dialogs/select dropdowns after border/background changes.

**End of Phase 2**
- Run `testing_agent` end-to-end on:
  - Home navigation + room rendering
  - Solutions carousel
  - Thoughts room + article reader
  - Contact form basic interaction (validation states visible)

---

### Phase 3: Additional Features / Follow-ups (Post-Verification)

**User stories (follow-up)**
1. As an admin, I can change a room’s theme in CMS and the eyebrow contrast stays correct automatically.
2. As a visitor, I see consistent spacing rhythm between rooms (no overly tall sections).
3. As a visitor, I can open the floating Connect dialog and it still layers correctly over all rooms.
4. As a visitor, I don’t see placeholder styling artifacts (e.g., mismatched borders) after theme alternation.
5. As a maintainer, reseeding the DB preserves the alternation rules without manual edits.

**Steps**
- If user requests: optionally expose a simple “auto theme alternation” toggle in admin (not required now).
- Revisit any room-specific contrast tweaks surfaced by testing_agent screenshots.

---

## Next Actions
1. Run `testing_agent` now to validate the 4 UI changes across desktop + mobile.
2. Fix any issues found (contrast, spacing, overflow, carousel controls, dialog layering), then re-run `testing_agent`.
3. Produce a short test report artifact (iteration JSON) summarizing pass/fail + screenshots.

---

## Success Criteria
- **Alternation**: From Values downward, rooms alternate **deep_royal_blue ↔ true_white** (as stored in CMS/DB), with correct typography contrast.
- **Solutions**: Each slide surface matches the hero CTA smokey gradient; slide text/badges remain legible.
- **Thoughts**: All image/video containers in Thoughts + ArticleReader show a subtle `--border-blue` outline.
- **Contact scale**: Contact room no longer feels oversized; form panel is constrained (max-w-lg), spacing is tighter, and UI remains readable.
- **Regression-free**: No broken navigation, no z-index/dialog issues, no layout overflow introduced.
