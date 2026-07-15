# UI Tweak Iteration Plan (Message 510 + New Feature Batch + Rounds 3–4)

## Objectives
- Deliver the requested UI polish pass across the original **4 items**:
  1) Room background alternation from **Values → bottom** using **deep_royal_blue ↔ true_white**.
  2) Solutions carousel slide/card backgrounds match the intended styling (**currently white cards with dark text**).
  3) Thoughts media containers get a subtle 1px soft blue/gray border.
  4) Contact room feels properly scaled (not oversized), with a better-proportioned form panel.

- Deliver the **new feature batch** requested after the previous finish:
  5) Hero rotating word (“Delivery Leader”) styling: iterated from gradient gloss → **solid shiny black (no gradient)**.
  6) Values room: glossy black active/hover circles + fix highlight description card to **white fill + black text**.
  7) Services room: add new service **“Tech Solutions, Built Around You”** and make services immediately scannable.
  8) Insert new **Organizations (logos)** room between Values and Résumé with an infinite marquee carousel (placeholder tiles now; logos to be swapped via CMS later).
  9) Repurpose the testimonials section into **“Voices and Impact”** and move it to between Résumé and Services, displayed as a compact **3D carousel** with autoplay + controls.

- Deliver **Round 3 of tweaks** (post Logos/Voices batch):
  10) Hero rotating word should be **solid shiny black** (not gradient) while remaining legible on the dark royal-blue hero.
  11) Services cards show **image + full pain-point description + 3–4 deliverable bullets** directly on the card (**no sheet interaction**).
  12) Solutions carousel slides are **white background with black/dark text**.
  13) Gallery room rename and behavior: **“Field Notes” → “Through My Eyes”**, subtext: **“Moments that shape and mold me.”**; remove scrollbar and replace with **autoplay carousel (~3s) + arrows**.
  14) Hero “Skip Intro” jumps to **How I Can Help (Services)**.

- Deliver **Round 4 of tweaks** (Media portfolio + content expansion):
  15) Re-confirm Skip Intro still lands on **Services / How I Can Help** (no regression).
  16) Values renames and copy: **Community → Connection**, **Simplicity → Growth**; update the corresponding selected text.
  17) Solutions content expansion: add **5 placeholder projects** for **7 total** published slides.
  18) Media & Impact overhaul: update “Where You May Have Seen Me” to:
      - A **30+** animated counter that counts up quickly on view.
      - **3 category tiles** only: **Features**, **Podcasts**, **TV & Video Appearances**, with hover/active color change.
      - A below-the-tiles **autoplay carousel** with edge arrows that displays rich media items (title/date/source, image or video/play option, short description, external link opens new tab).
      - Ensure CMS-editability of these items (schema support for video embeds).

- Ensure contrast/legibility stays correct regardless of CMS theme choices (eyebrows, text, buttons) and keep the “gallery rooms” feel.
- Prove changes via automated UI verification (testing_agent) and minimal visual spot checks.

---

## Implementation Steps

### Phase 1: POC (Core Verification of the UI Changes)
*(No external integrations; POC here is a “prove it visually + functionally” slice before broader polish.)*

**User stories (POC)**
1. As a visitor, I can visually distinguish each room from Values downward via alternating royal blue/white backgrounds.
2. As a visitor, I can read section labels (eyebrows) on both blue and white rooms.
3. As a visitor, I see Solutions carousel slides with the intended surface styling (**white cards + dark text**) and **7 total slides**.
4. As a visitor, I see Thoughts images/videos framed with a subtle outline.
5. As a visitor, the Contact room’s form panel feels appropriately sized and readable on desktop and mobile.
6. As a visitor, I see the Hero rotating word rendered as **solid shiny black** (no gradient) and still readable on the blue hero.
7. As a visitor, I can click a Value circle and see a glossy black active state + a readable highlight card (black text on white).
8. As a visitor, I see an infinite Organizations marquee between Values and Résumé.
9. As a visitor, I see “Voices and Impact” between Résumé and Services and can navigate its 3D carousel.
10. As a visitor, I see all Services cards with images + full descriptions + 3–4 bullets (no sheet required).
11. As a visitor, I see the Gallery room as “Through My Eyes” with autoplay carousel + arrows and no scrollbar.
12. As a visitor, clicking “Skip Intro” jumps directly to Services.
13. As a visitor, “Where You May Have Seen Me” (Media & Impact) shows a fast **30+** counter and three category tiles.
14. As a visitor, selecting Features/Podcasts/TV & Video changes the carousel content below.
15. As a visitor, the Media & Impact carousel auto-plays, pauses on hover/focus, has edge arrows, and each card opens its external link in a new tab.

**Steps**
- Confirm CMS section themes reflect the desired alternation (DB + seed script alignment).
- Ensure every room that uses `RoomEyebrow` passes `dark={themeFor(section.theme).isDark}`.
- Thoughts: apply media borders (room + article reader).
- Contact: resize spacing + constrain form panel width.
- Hero:
  - Rotating word styling is **solid shiny black** (subtle shine via text-shadow/stroke; no gradient).
  - Skip Intro jumps to **Services**.
- Values:
  - Titles: Faith / Connection / Service / Growth.
  - Glossy black active/hover circles.
  - Highlight card is explicit white with black text.
- Services:
  - Ensure 4 services exist including “Tech Solutions, Built Around You”.
  - Cards show image + full pain-point description + 3–4 bullets inline.
- Organizations:
  - Confirm `logos` room exists and marquee renders 21 placeholder tiles (swap CMS logos later).
- Voices & Impact:
  - Confirm 3D carousel rendering, controls, autoplay, and presence of 4 verified/published quotes.
- Solutions:
  - Confirm slides render with **white surface + dark text**.
  - Confirm total project count is **7** (2 real + 5 placeholders).
- Gallery:
  - Title/subtext updated.
  - Embla autoplay carousel (~3s) with arrows; no scrollbar; lightbox still works.
- Media & Impact:
  - Replace legacy 6-tile layout with **3 category tiles**.
  - Add fast **30+** animated counter.
  - Add autoplay carousel with arrows.
  - Support items with **video embeds** and/or images.
  - Ensure admin schema supports `category` (select) and `video_url`.

**POC Exit**
- Run `testing_agent` for a targeted pass over:
  - Home room order + rendering
  - Hero rotating word + Skip Intro jump target
  - Values renames + interaction + highlight card readability
  - Organizations marquee presence
  - Voices & Impact carousel interaction + autoplay
  - Services cards (image + full description + bullets)
  - Solutions carousel (white cards + dark text + 7 slides)
  - Thoughts + ArticleReader media borders
  - Gallery carousel autoplay + arrows
  - Media & Impact: counter, category tiles switching, carousel autoplay/arrows, external links
  - Contact UX
- If failures: fix immediately and re-run until green.

**POC Status (Current)**
- ✅ Original 4 UI polish items implemented and verified (iteration_8).
- ✅ Logos + Voices & Impact batch implemented and verified (iteration_9).
- ✅ Round 3 changes implemented and verified (iteration_10):
  - Hero rotating word solid shiny black (no gradient)
  - Skip Intro jumps to Services
  - Services cards show image + full description + bullets (sheet removed)
  - Solutions slides white + dark text
  - Gallery updated to “Through My Eyes” with Embla autoplay + arrows (no scrollbar)
- ✅ Round 4 changes implemented:
  - Values updated to Faith / Connection / Service / Growth with updated descriptions
  - Solutions expanded to 7 projects total (added 5 placeholders)
  - Media & Impact rebuilt: 30+ counter, 3 category tiles, content carousel with autoplay + arrows
  - Added backend/admin schema support for `impact_items.video_url` and category select
  - DB cleanup: removed old junk impact_items; inserted 22 curated media items extracted from Bretton_Key_Media_Portfolio.pdf
  - seed_content.py updated to mirror Values/Projects/Impact changes
- ✅ Build checks: `esbuild` PASS; backend AST parse PASS.
- ✅ Manual visual spot-checks completed:
  - Values: Faith / Connection / Service / Growth rendering confirmed
  - Media & Impact: layout confirmed (counter + tiles + carousel) via screenshot
- ⏳ Pending: **testing_agent verification for Round 4** (tile switching, autoplay/pause behavior, mobile view, Solutions carousel now showing 7 slides) + regression check.

---

### Phase 2: V1 App Development (Finalize and Harden the UI Changes)

**User stories (V1)**
1. As a visitor, I experience consistent blue/white alternation from Values through Contact with no odd palette breaks.
2. As a visitor, I can read all typography on royal-blue rooms (eyebrows, headings, body, buttons).
3. As a visitor, Solutions carousel navigation remains accessible and visible; the carousel can handle 7+ slides.
4. As a reader, I can scan Thoughts listings and see all media clearly framed and consistent.
5. As a visitor, I can use the Contact form comfortably on desktop and mobile.
6. As a visitor, the Organizations marquee scrolls smoothly, pauses on hover, and is accessible.
7. As a visitor, the Voices & Impact carousel feels premium and stable across devices.
8. As a visitor, Services content is immediately scannable and actionable.
9. As a visitor, Gallery autoplay is smooth, controllable via arrows, and does not interfere with lightbox.
10. As a visitor, Media & Impact tiles and carousel are responsive, accessible, and link-out behavior is correct.

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
  - Works with 7 items (and future growth).
- Verify Gallery carousel:
  - Autoplay interval is ~3 seconds.
  - Pauses on hover/focus.
  - Arrow controls work.
  - Lightbox still opens and supports arrow-key navigation.
- Verify Media & Impact:
  - Counter triggers once on entering viewport.
  - Only 3 category tiles show.
  - Hover/active styling is consistent.
  - Carousel switches content correctly.
  - Autoplay + pause-on-hover works.
  - Items with `video_url` embed correctly; otherwise show image or fallback icon.
  - External links open in a new window/tab.

**End of Phase 2**
- Run `testing_agent` end-to-end on:
  - Home navigation + room rendering
  - Hero/Skip Intro
  - Values interaction
  - Organizations marquee
  - Voices & Impact carousel
  - Services cards
  - Solutions carousel (7 slides)
  - Thoughts room + article reader
  - Gallery carousel
  - Media & Impact (counter + tiles + carousel)
  - Contact form basic interaction

---

### Phase 3: Additional Features / Follow-ups (Post-Verification)

**User stories (follow-up)**
1. As an admin, I can upload and swap in the **21 organization logos** via CMS to replace placeholders.
2. As an admin, I can upload **testimonial portraits** later (currently letter-avatar fallback is used).
3. As an admin, I can refine service images and bullet points over time via CMS.
4. As an admin, I can refine Media & Impact items over time, including adding **video_url** embeds.
5. As a visitor, I experience consistent spacing rhythm between rooms (no overly tall sections).
6. As a visitor, the floating Connect dialog layers correctly over all rooms.
7. As a maintainer, reseeding the DB reproduces the new room order and content without manual edits.

**Steps**
- Confirm CMS fields and guidance for:
  - Logos: `items[].logo_url` and `items[].name`.
  - Testimonials: `portrait_url` optional field.
  - Services: `image_url`, `description`, `capabilities` (bullets).
  - Media & Impact: `category` (Feature/Podcast/TV & Video), `org`, `date`, `image_url`, `video_url`, `external_link`, `description`.
- Optional: tune marquee and autoplay timings based on feedback.
- Replace placeholder org tiles with real uploaded logos.
- Add real thumbnails/images for media appearances where available.

---

## Next Actions
1. Run `testing_agent` now to validate **Round 4** additions:
   - Skip Intro still lands on Services
   - Values renamed to Connection/Growth and descriptions match selection
   - Solutions carousel renders 7 slides
   - Media & Impact: 30+ counter, category tiles switching, carousel autoplay/arrows, links open new tab
   - Mobile responsiveness for Media & Impact and Solutions
2. Fix any issues found (contrast, spacing, overflow, carousel controls, dialog layering), then re-run `testing_agent`.
3. Produce a short test report artifact (iteration JSON) summarizing pass/fail + screenshots.

---

## Success Criteria
- **Alternation**: From Values downward, rooms alternate **deep_royal_blue ↔ true_white** with correct typography contrast.
- **Hero word**: Rotating word renders as **solid shiny black (no gradient)** and remains legible on royal blue.
- **Skip Intro**: Lands on **How I Can Help (Services)** reliably with Lenis.
- **Values**: Titles are **Faith / Connection / Service / Growth**; active/hover circles use glossy black fill with white text; highlight card is white with black description text.
- **Organizations marquee**: Room exists between Values and Résumé, shows infinite horizontal scroll of 21 placeholder tiles; logos can be swapped later via CMS.
- **Voices & Impact**: Renders as a compact 3D carousel with 4 real verified/published testimonials.
- **Services**: All four service cards show an image, full pain-point description, and **3–4 bullet points** of deliverables.
- **Solutions**: Each slide uses a **white surface with dark text**, with controls visible; **7 published projects** visible.
- **Thoughts**: All image/video containers in Thoughts + ArticleReader show a subtle `--border-blue` outline.
- **Gallery**: Title/subtext updated; uses autoplay carousel (~3s) with arrows; no scrollbar; lightbox still works.
- **Media & Impact**: Counter animates quickly to **30+**; exactly 3 category tiles; selecting tiles updates the carousel; carousel autoplays with arrows; items show source/date/title/description and open external links in a new tab; supports video embeds via `video_url`.
- **Contact scale**: Contact room is appropriately sized; form panel constrained and readable.
- **Regression-free**: No broken navigation, no z-index/dialog issues, no layout overflow introduced.
