# UI Tweak Iteration Plan (Message 510 + New Feature Batch)

## Objectives
- Deliver the requested UI polish pass across **4 original items**:
  1) Room background alternation from **Values → bottom** using **deep_royal_blue ↔ true_white**.
  2) Solutions carousel slide/card backgrounds match the Hero “See the Work” smokey-glossy-black gradient.
  3) Thoughts media containers get a subtle 1px soft blue/gray border.
  4) Contact room feels properly scaled (not oversized), with a better-proportioned form panel.
- Deliver the **new feature batch** requested after the previous finish:
  5) Hero rotating word (“Delivery Leader”) uses **glossy black gradient text** (matching CTA styling family) instead of blue.
  6) Values room: **glossy black** active/hover circles + fix highlight description card to **white fill + black text** (fixes prior invisibility bug).
  7) Services room: **all tiles** use uniform glossy black tiling; add new service **“Tech Solutions, Built Around You”**.
  8) Insert new **Organizations (logos)** room between Values and Résumé with an infinite marquee carousel (placeholder tiles now; logos to be swapped via CMS later).
  9) Repurpose the testimonials section into **“Voices and Impact”** and move it to between Résumé and Services, displayed as a compact **3D carousel** with autoplay + controls.
- Ensure contrast/legibility stays correct regardless of CMS theme choices (eyebrows, text, buttons) and keep the “gallery rooms” feel.
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
5. As a visitor, the Contact room’s form panel feels appropriately sized and readable on desktop and mobile.
6. As a visitor, I see the Hero rotating word rendered in a glossy black gradient (not blue).
7. As a visitor, I can click a Value circle and see a glossy black active state + a readable highlight card (black text on white).
8. As a visitor, I see an infinite Organizations marquee between Values and Résumé.
9. As a visitor, I see “Voices and Impact” between Résumé and Services and can navigate its 3D carousel.
10. As a visitor, I see all Services tiles consistently in glossy black styling, including the new 4th service.

**Steps**
- Confirm CMS section themes reflect the desired alternation (DB + seed script alignment).
- Ensure every room that uses `RoomEyebrow` passes `dark={themeFor(section.theme).isDark}`.
- Apply Solutions slide gradient + text contrast.
- Add Thoughts media borders (room + article reader).
- Resize Contact room spacing + constrain form panel width.
- Update Hero rotating word to glossy black gradient + subtle sheen.
- Update Values: glossy black active/hover circles + explicit white highlight card with black text.
- Update Services: uniform glossy black tiles; add the new 4th service content.
- Add new `logos` room type and render the infinite marquee (placeholder tiles now; CMS images later).
- Rebuild Testimonials room into “Voices and Impact” 3D carousel; populate DB with 4 real verified/published testimonials.

**POC Exit**
- Run `testing_agent` for a targeted pass over:
  - Home room order + rendering
  - Values interaction
  - Organizations marquee presence
  - Voices & Impact carousel interaction
  - Services tiles styling + content
  - Solutions carousel
  - Thoughts + ArticleReader media borders
  - Contact form usability
- If failures: fix immediately and re-run until green.

**POC Status (Current)**
- ✅ Implementation completed for all items above.
- ✅ Build checks: `esbuild` + backend AST parse OK.
- ✅ Manual spot checks: Hero glossy word renders; Values + Organizations section renders via hash anchor.
- ⏳ Pending: full testing_agent verification covering Voices & Impact carousel, Services tiles, Contact end-to-end.

---

### Phase 2: V1 App Development (Finalize and Harden the UI Changes)

**User stories (V1)**
1. As a visitor, I experience consistent blue/white alternation from Values through Contact with no odd palette breaks.
2. As a visitor, I can read all typography on royal-blue rooms (eyebrows, headings, body, buttons).
3. As a visitor, Solutions carousel navigation (prev/next/dots) remains accessible and visible on darker slides.
4. As a reader, I can scan Thoughts listings and see all media clearly framed and consistent.
5. As a visitor, I can use the Contact form comfortably on desktop and mobile.
6. As a visitor, the Organizations marquee scrolls smoothly, pauses on hover, and is accessible (no seizure/flash; readable; graceful if fewer items).
7. As a visitor, the Voices & Impact carousel feels premium (3D depth, legible quote typography, working controls and autoplay).
8. As an admin, I can manage Organizations items and Voices & Impact testimonials through CMS without code changes.

**Steps**
- Audit remaining rooms for theme-dependent styling regressions (borders, text colors, hover states) introduced by the new insertions.
- Verify Contact actions hover styling works in both dark and light themes.
- Verify Voices & Impact carousel:
  - Autoplay works; pauses on hover/focus.
  - Prev/next and dots function.
  - Quotes don’t overflow on small screens.
  - No z-index issues with floating Connect dialog.
- Verify Services tiles:
  - Uniform glossy styling across all four tiles.
  - New 4th service text matches request.
- Verify Organizations marquee:
  - Placeholder tiles render; later swap via CMS `logo_url`.
  - Animation does not break layout; mask gradient looks correct.
- Remove/avoid leftover seed/test artifacts (ensured junk test services/testimonials removed).

**End of Phase 2**
- Run `testing_agent` end-to-end on:
  - Home navigation + room rendering
  - Values interaction
  - Organizations marquee
  - Voices & Impact carousel
  - Services tiles + sheet open/close
  - Solutions carousel
  - Thoughts room + article reader
  - Contact form basic interaction

---

### Phase 3: Additional Features / Follow-ups (Post-Verification)

**User stories (follow-up)**
1. As an admin, I can upload and swap in the **21 organization logos** via CMS to replace placeholders.
2. As an admin, I can upload **testimonial portraits** later (currently letter-avatar fallback is used).
3. As a visitor, I experience consistent spacing rhythm between rooms (no overly tall sections).
4. As a visitor, the floating Connect dialog layers correctly over all rooms.
5. As a maintainer, reseeding the DB reproduces the new room order and content (logos + voices + service 4) without manual edits.

**Steps**
- Add/confirm CMS fields and guidance for:
  - Logos: `items[].logo_url` and `items[].name`.
  - Testimonials: `portrait_url` optional field used by Voices & Impact.
- Optional: refine animation timing for marquee and 3D carousels based on user feedback.
- Revisit any room-specific contrast tweaks surfaced by testing_agent screenshots.

---

## Next Actions
1. Run `testing_agent` now to validate:
   - New room order (Values → Logos → Résumé → Voices & Impact → Services)
   - Hero glossy word
   - Values active state + highlight card readability
   - Voices & Impact 3D carousel interaction + autoplay
   - Services glossy tiles + new 4th service
   - Solutions carousel remains correct
   - Thoughts borders
   - Contact UX
2. Fix any issues found (contrast, spacing, overflow, carousel controls, dialog layering), then re-run `testing_agent`.
3. Produce a short test report artifact (iteration JSON) summarizing pass/fail + screenshots.

---

## Success Criteria
- **Alternation**: From Values downward, rooms alternate **deep_royal_blue ↔ true_white** (as stored in CMS/DB), with correct typography contrast.
- **Hero gloss word**: Rotating word renders in glossy black gradient and remains legible on royal blue.
- **Values**: Active/hover circles use glossy black fill with white text; highlight card is white with black description text.
- **Organizations marquee**: New room exists between Values and Résumé, shows infinite horizontal scroll of 21 placeholder tiles (logos can be swapped later via CMS).
- **Voices & Impact**: Testimonials section moved between Résumé and Services, renders as a compact 3D carousel with 4 real verified/published testimonials.
- **Services**: All four service tiles are uniformly glossy black; “Tech Solutions, Built Around You” is present with the provided description.
- **Solutions**: Each slide surface matches the hero CTA smokey gradient; slide text/badges remain legible.
- **Thoughts**: All image/video containers in Thoughts + ArticleReader show a subtle `--border-blue` outline.
- **Contact scale**: Contact room no longer feels oversized; form panel is constrained (max-w-lg), spacing is tighter, and UI remains readable.
- **Regression-free**: No broken navigation, no z-index/dialog issues, no layout overflow introduced.
