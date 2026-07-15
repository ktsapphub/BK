# UI Tweak Iteration Plan (Message 510 + New Feature Batch + Round 3 Tweaks)

## Objectives
- Deliver the requested UI polish pass across **4 original items**:
  1) Room background alternation from **Values → bottom** using **deep_royal_blue ↔ true_white**.
  2) Solutions carousel slide/card backgrounds match the intended styling (initially smokey-black; later reverted to white per Round 3 request).
  3) Thoughts media containers get a subtle 1px soft blue/gray border.
  4) Contact room feels properly scaled (not oversized), with a better-proportioned form panel.

- Deliver the **new feature batch** requested after the previous finish:
  5) Hero rotating word (“Delivery Leader”) styling: initially glossy black gradient; **updated in Round 3 to solid shiny black (no gradient)**.
  6) Values room: **glossy black** active/hover circles + fix highlight description card to **white fill + black text**.
  7) Services room: uniform glossy black tiling; add new service **“Tech Solutions, Built Around You”**.
  8) Insert new **Organizations (logos)** room between Values and Résumé with an infinite marquee carousel (placeholder tiles now; logos to be swapped via CMS later).
  9) Repurpose the testimonials section into **“Voices and Impact”** and move it to between Résumé and Services, displayed as a compact **3D carousel** with autoplay + controls.

- Deliver **Round 3 of tweaks** (post Logos/Voices batch):
  10) Hero rotating word should be **solid shiny black** (not gradient) while remaining legible on the dark royal-blue hero.
  11) Services cards should show **image + full pain-point description + 3–4 bullet points** (“what you get”) **directly on the card** (no separate sheet interaction).
  12) Solutions carousel slides should be **white background with black text**.
  13) Gallery room rename and behavior: **“Field Notes” → “Through My Eyes”**, subtext to **“Moments that shape and mold me.”**, remove scrollbar and replace with **autoplay carousel (3s) + arrows**.
  14) Hero “Skip Intro” should jump to **How I Can Help (Services)**.

- Ensure contrast/legibility stays correct regardless of CMS theme choices (eyebrows, text, buttons) and keep the “gallery rooms” feel.
- Prove changes via automated UI verification (testing_agent) and minimal visual spot checks.

---

## Implementation Steps

### Phase 1: POC (Core Verification of the UI Changes)
*(No external integrations; POC here is a “prove it visually + functionally” slice before broader polish.)*

**User stories (POC)**
1. As a visitor, I can visually distinguish each room from Values downward via alternating royal blue/white backgrounds.
2. As a visitor, I can read section labels (eyebrows) on both blue and white rooms.
3. As a visitor, I see Solutions carousel slides with the intended surface styling (now **white cards with dark text** after Round 3).
4. As a visitor, I see Thoughts images/videos framed with a subtle outline.
5. As a visitor, the Contact room’s form panel feels appropriately sized and readable on desktop and mobile.
6. As a visitor, I see the Hero rotating word rendered as **solid shiny black** (no gradient) and still readable on the blue hero.
7. As a visitor, I can click a Value circle and see a glossy black active state + a readable highlight card (black text on white).
8. As a visitor, I see an infinite Organizations marquee between Values and Résumé.
9. As a visitor, I see “Voices and Impact” between Résumé and Services and can navigate its 3D carousel.
10. As a visitor, I see all Services cards with images + full descriptions + 3–4 bullet points (no sheet required).
11. As a visitor, I see the Gallery room as “Through My Eyes” with autoplay carousel + arrows and no scrollbar.
12. As a visitor, clicking “Skip Intro” jumps directly to Services.

**Steps**
- Confirm CMS section themes reflect the desired alternation (DB + seed script alignment).
- Ensure every room that uses `RoomEyebrow` passes `dark={themeFor(section.theme).isDark}`.
- Thoughts: apply media borders (room + article reader).
- Contact: resize spacing + constrain form panel width.
- Hero: update rotating word styling to **solid shiny black** (subtle shine via text-shadow/stroke; no gradient).
- Values: glossy black active/hover circles + explicit white highlight card with black text.
- Services: ensure 4 services exist; rewrite cards to include image + full description + 3–4 bullets visible inline.
- Organizations: confirm `logos` room type exists and marquee renders placeholder tiles (swap CMS logos later).
- Voices & Impact: confirm 3D carousel rendering, controls, autoplay, and presence of 4 verified/published quotes.
- Solutions: set slides to **white surface + dark text**.
- Gallery: rename + migrate to Embla autoplay carousel (3s) with arrows; remove scrollbar strip.
- Skip Intro: update to jump to Services.

**POC Exit**
- Run `testing_agent` for a targeted pass over:
  - Home room order + rendering
  - Hero rotating word styling (solid shiny black)
  - Skip Intro jump target
  - Values interaction + highlight card readability
  - Organizations marquee presence
  - Voices & Impact carousel interaction + autoplay
  - Services cards (image + full description + bullets)
  - Solutions carousel (white cards + dark text)
  - Thoughts + ArticleReader media borders
  - Gallery carousel autoplay + arrows
  - Contact UX
- If failures: fix immediately and re-run until green.

**POC Status (Current)**
- ✅ Original 4 UI polish items implemented earlier and verified (iteration_8).
- ✅ Logos + Voices & Impact batch implemented and verified (iteration_9).
- ✅ Round 3 changes implemented:
  - Hero rotating word changed to **solid shiny black** (no gradient)
  - Skip Intro jumps to Services
  - Solutions slides reverted to **white + dark text**
  - Services cards rewritten to show **image + full pain-point description + 3–4 bullets** inline (sheet removed)
  - Gallery rewritten to **Embla autoplay (3s) + arrows** and title/subtext updated
  - DB + seed_content.py updated for services and gallery content
- ✅ Build checks: `esbuild` PASS; backend AST parse PASS.
- ✅ Manual visual spot-checks completed:
  - Hero: solid shiny black word renders and remains legible.
  - Services: image + full description + bullets render as intended.
- ⏳ Pending: **testing_agent verification for Round 3** (especially Gallery carousel behavior and Solutions room visuals) + regression check.

---

### Phase 2: V1 App Development (Finalize and Harden the UI Changes)

**User stories (V1)**
1. As a visitor, I experience consistent blue/white alternation from Values through Contact with no odd palette breaks.
2. As a visitor, I can read all typography on royal-blue rooms (eyebrows, headings, body, buttons).
3. As a visitor, Solutions carousel navigation (prev/next/dots) remains accessible and visible on the room background.
4. As a reader, I can scan Thoughts listings and see all media clearly framed and consistent.
5. As a visitor, I can use the Contact form comfortably on desktop and mobile.
6. As a visitor, the Organizations marquee scrolls smoothly, pauses on hover, and is accessible.
7. As a visitor, the Voices & Impact carousel feels premium (3D depth, legible quote typography, working controls and autoplay).
8. As a visitor, Services content is immediately scannable and actionable without opening a sheet.
9. As a visitor, Gallery autoplay is smooth, controllable via arrows, and does not interfere with lightbox interactions.
10. As a visitor, Skip Intro reliably lands at Services with Lenis enabled.

**Steps**
- Audit remaining rooms for theme-dependent styling regressions (borders, text colors, hover states).
- Verify Contact actions hover styling works in both dark and light themes.
- Verify Voices & Impact carousel:
  - Autoplay works; pauses on hover/focus.
  - Prev/next and dots function.
  - Quotes don’t overflow on small screens.
  - No z-index issues with floating Connect dialog.
- Verify Services cards:
  - Images load and crop correctly.
  - Descriptions and bullets don’t overflow on mobile.
  - CTA links scroll correctly via Lenis.
- Verify Organizations marquee:
  - Placeholder tiles render; later swap via CMS `logo_url`.
  - Animation does not break layout; mask gradient looks correct.
- Verify Solutions carousel:
  - White-card styling is consistent and readable.
  - Embedded media still works.
- Verify Gallery carousel:
  - Autoplay interval is ~3 seconds.
  - Pauses on hover/focus.
  - Arrow controls work.
  - Lightbox still opens and supports arrow-key navigation.

**End of Phase 2**
- Run `testing_agent` end-to-end on:
  - Home navigation + room rendering
  - Hero/Skip Intro
  - Values interaction
  - Organizations marquee
  - Voices & Impact carousel
  - Services cards
  - Solutions carousel
  - Thoughts room + article reader
  - Gallery carousel
  - Contact form basic interaction

---

### Phase 3: Additional Features / Follow-ups (Post-Verification)

**User stories (follow-up)**
1. As an admin, I can upload and swap in the **21 organization logos** via CMS to replace placeholders.
2. As an admin, I can upload **testimonial portraits** later (currently letter-avatar fallback is used).
3. As an admin, I can refine service images and bullet points over time via CMS.
4. As a visitor, I experience consistent spacing rhythm between rooms (no overly tall sections).
5. As a visitor, the floating Connect dialog layers correctly over all rooms.
6. As a maintainer, reseeding the DB reproduces the new room order and content (logos + voices + services + gallery updates) without manual edits.

**Steps**
- Confirm CMS fields and guidance for:
  - Logos: `items[].logo_url` and `items[].name`.
  - Testimonials: `portrait_url` optional field used by Voices & Impact.
  - Services: `image_url`, `description`, and `capabilities` as the visible bullets.
- Optional: tune marquee and autoplay timings based on user feedback.
- Replace placeholder org tiles with real uploaded logos.

---

## Next Actions
1. Run `testing_agent` now to validate the **Round 3** changes:
   - Hero rotating word is solid shiny black
   - Skip Intro jumps to Services
   - Services cards: image + full description + bullets
   - Solutions slides are white + dark text
   - Gallery is “Through My Eyes” with autoplay (3s) + arrows and no scrollbar
2. Fix any issues found (contrast, spacing, overflow, carousel controls, dialog layering), then re-run `testing_agent`.
3. Produce a short test report artifact (iteration JSON) summarizing pass/fail + screenshots.

---

## Success Criteria
- **Alternation**: From Values downward, rooms alternate **deep_royal_blue ↔ true_white** with correct typography contrast.
- **Hero word**: Rotating word renders as **solid shiny black (no gradient)** and remains legible on royal blue.
- **Skip Intro**: Lands on **How I Can Help (Services)** reliably with Lenis.
- **Values**: Active/hover circles use glossy black fill with white text; highlight card is white with black description text.
- **Organizations marquee**: Room exists between Values and Résumé, shows infinite horizontal scroll of 21 placeholder tiles; logos can be swapped later via CMS.
- **Voices & Impact**: Renders as a compact 3D carousel with 4 real verified/published testimonials.
- **Services**: All four service cards show an image, full pain-point description, and **3–4 bullet points** of deliverables.
- **Solutions**: Each slide uses a **white surface with dark text**, with controls visible.
- **Thoughts**: All image/video containers in Thoughts + ArticleReader show a subtle `--border-blue` outline.
- **Gallery**: Title/subtext updated; uses autoplay carousel (3s) with arrows; no scrollbar; lightbox still works.
- **Contact scale**: Contact room is appropriately sized; form panel constrained and readable.
- **Regression-free**: No broken navigation, no z-index/dialog issues, no layout overflow introduced.
