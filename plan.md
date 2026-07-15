# UI Tweak Iteration Plan (Message 510 + New Feature Batch + Rounds 3–6)

## Objectives
- Deliver the requested UI polish pass across the original **4 items**:
  1) Room background alternation from **Values → bottom** using **deep_royal_blue ↔ true_white**.
  2) Solutions carousel slide/card backgrounds match the intended styling (**white cards with dark text**).
  3) Thoughts media containers get a subtle 1px soft blue/gray border.
  4) Contact room feels properly scaled (not oversized), with a better-proportioned form panel.

- Deliver the **new feature batch** requested after the previous finish:
  5) Hero rotating word styling: iterated from gradient gloss → **solid shiny black (no gradient)**.
  6) Values room: glossy black active/hover circles + fix highlight description card to **white fill + black text**.
  7) Services room: add new service **“Tech Solutions, Built Around You”** and make services immediately scannable.
  8) Insert new **Organizations (logos)** room between Values and Résumé with an infinite marquee carousel.
  9) Repurpose testimonials into **“Voices and Impact”** and move it between Résumé and Services as a compact **3D carousel**.

- Deliver **Round 3 of tweaks** (post Logos/Voices batch):
  10) Hero rotating word is **solid shiny black** (not gradient) and legible.
  11) Services cards show **image + full pain-point description + 3–4 deliverable bullets** directly on the card.
  12) Solutions carousel slides are **white background with black/dark text**.
  13) Gallery room rename and behavior: **“Field Notes” → “Through My Eyes”**, subtext: **“Moments that shape and mold me.”**; remove scrollbar and replace with **autoplay carousel (~3s) + arrows**.
  14) Hero “Skip Intro” jumps to **How I Can Help (Services)**.

- Deliver **Round 4 of tweaks** (Media portfolio + content expansion):
  15) Re-confirm Skip Intro still lands on **Services** (no regression).
  16) Values renames and copy: **Community → Connection**, **Simplicity → Growth**.
  17) Solutions content expansion: add **5 placeholder projects** for **7 total** published slides.
  18) Media & Impact overhaul (counter + 3 category tiles + detail carousel; supports image/video).

- Deliver **Round 5**: Expandable Services UI + Calendly popup scheduling with source tracking
  19) Services containers become **expandable** (collapsed summary + “Explore More” affordance).
  20) All prominent CTAs route to a **Calendly pop-up widget**.
  21) Calendly bookings capture **source attribution** via UTM parameters:
      - Hero “Let’s Talk” = `utm_content=opener`
      - Nav “Schedule a Conversation” = `utm_content=schedule_a_conversation`
      - Services CTAs = `utm_content=01_Agile`, `02_PO`, `03_Speaking`, `04_Tech`

- Deliver **Round 6 (NEW)**: Section reorganization + room merge to reduce section count
  22) **Swap Thoughts** so it appears **immediately before Contact**.
  23) **Merge “Beyond the Work” + “Through My Eyes”** into a single room that contains:
      - Header + sub-header + paragraph text
      - A single portrait image on the right
      - Replaces the old **Faith / Family / Community** theme pills with an **auto-moving image carousel** (using the former gallery images)
  24) Place the merged “Beyond the Work / Through My Eyes” room **immediately after Projects / Solutions** (in Thoughts’ previous slot).
  25) Ensure the **left navigation rail** reflects the new ordering.

- Ensure contrast/legibility stays correct regardless of CMS theme choices and keep the “gallery rooms” feel.
- Prove changes via automated UI verification (`testing_agent_v3`) and minimal visual spot checks.

---

## Implementation Steps

### Phase 1: POC (Core Verification of the UI Changes)
*(POC here is a “prove it visually + functionally” slice before broader polish.)*

**User stories (POC)**
1. As a visitor, I can visually distinguish each room from Values downward via alternating royal blue/white backgrounds.
2. As a visitor, I can read section labels (eyebrows) on both blue and white rooms.
3. As a visitor, I see Solutions carousel slides with the intended surface styling (**white cards + dark text**) and **7 total slides**.
4. As a visitor, I see Thoughts images/videos framed with a subtle outline.
5. As a visitor, the Contact room’s form panel feels appropriately sized and readable on desktop and mobile.
6. As a visitor, I see the Hero rotating word rendered as **solid shiny black** (no gradient).
7. As a visitor, I can click a Value circle and see a glossy black active state + a readable highlight card.
8. As a visitor, I see an infinite Organizations marquee between Values and Résumé.
9. As a visitor, I see “Voices and Impact” between Résumé and Services and can navigate its 3D carousel.
10. As a visitor, I see all Services cards scannable by default and expandable for details.
11. As a visitor, clicking “Skip Intro” jumps directly to Services.
12. As a visitor, Media & Impact shows a fast **30+** counter and three category tiles.
13. As a visitor, I can expand a service tile via **Explore More** and collapse it.
14. As a visitor, “Let’s Talk” CTAs open a **Calendly popup** and each booking is tagged with origin.
15. As a visitor, “Beyond the Work” contains a “Through My Eyes” carousel and there is no duplicate standalone gallery room.
16. As a visitor, Thoughts appears directly before Contact.

**Steps**
- Confirm CMS section themes reflect desired alternation.
- Ensure every room that uses `RoomEyebrow` passes `dark={themeFor(section.theme).isDark}`.
- Implement/verify:
  - Hero: solid shiny black rotating word; Skip Intro → Services.
  - Values: glossy active circles; highlight card white/black.
  - Logos: infinite marquee.
  - Testimonials → Voices and Impact: 3D carousel.
  - Projects/Solutions: white cards + dark text; 7 total projects.
  - Media & Impact: counter + 3 category tiles + autoplay detail carousel.
  - Services: expandable cards + Calendly CTAs.
  - **Round 6 merge & reorder**:
    - Merge gallery images into personal content as `gallery_images`, add `eyebrow`.
    - Hide standalone gallery section from rendering/nav.
    - Move personal to immediately after projects.
    - Move thoughts to immediately before contact.
    - Verify nav is derived from section order and reflects changes.

**POC Exit**
- Run `testing_agent_v3` covering:
  - Home room order + rendering
  - Nav order correctness + smooth scroll targets
  - Hero (rotating word + Skip Intro)
  - Values interactions
  - Logos marquee
  - Voices & Impact carousel
  - Services expand/collapse + Calendly popup + UTM correctness
  - Projects carousel
  - Media & Impact category switching
  - **Merged Beyond the Work**: carousel autoplay + lightbox
  - Thoughts placement (directly before Contact)
  - Contact UX

**POC Status (Current)**
- ✅ Original 4 UI polish items implemented and verified (iteration_8).
- ✅ Logos + Voices & Impact batch implemented and verified (iteration_9).
- ✅ Round 3 changes implemented and verified (iteration_10).
- ✅ Round 4 changes implemented and verified (iterations_11–14).
- ✅ Round 5 (Calendly + expandable Services) implemented and verified (iteration_15).
- ✅ Round 6 (Section reorg + merge Beyond the Work + Through My Eyes) implemented and verified (iteration_16).

---

### Phase 2: V1 App Development (Finalize and Harden the UI Changes)

**User stories (V1)**
1. As a visitor, I experience consistent blue/white alternation through the final section order.
2. As a visitor, I can read typography on royal-blue rooms (eyebrows, headings, body, buttons).
3. As a visitor, Projects/Solutions carousel navigation remains accessible and visible.
4. As a reader, Thoughts section is easy to scan and now correctly placed before Contact.
5. As a visitor, I can use the Contact form comfortably on desktop and mobile.
6. As a visitor, the Organizations marquee scrolls smoothly, pauses on hover, and is accessible.
7. As a visitor, the Voices & Impact carousel feels premium and stable across devices.
8. As a visitor, Services expand/collapse behavior is smooth and keyboard accessible.
9. As a visitor, Calendly popup opens quickly and reliably from Hero/Nav/Services.
10. As a visitor, the merged “Beyond the Work / Through My Eyes” room’s carousel and lightbox work across devices.

**Steps**
- Audit theme-dependent styling regressions after the reorder.
- Verify merged room responsiveness:
  - Carousel sizing on mobile
  - Lightbox controls and keyboard behavior
  - No overflow of captions
- Verify nav scroll targets after reorder.
- Verify Calendly popup unaffected.

**End of Phase 2**
- Re-run `testing_agent_v3` end-to-end on the final section order and all interactive elements.

---

### Phase 3: Additional Features / Follow-ups (Post-Verification)

**User stories (follow-up)**
1. As an admin, I can manage the merged room content entirely via CMS fields.
2. As an admin, I can upload and swap in the 21 organization logos via CMS.
3. As an admin, I can refine service images and bullet points via CMS.
4. (Optional) As a visitor, remaining CTAs (e.g., Contact room scheduling link and FloatingConnectButton) also open Calendly with unique UTM tags.

**Steps**
- CMS guidance updates:
  - Personal (merged room) fields now: `eyebrow`, `heading`, `statement`, `image`, `gallery_images[]`.
  - Gallery room is intentionally disabled (draft + hidden).
- Optional: route additional CTAs through `openCalendlyPopup()` with `utm_content` identifiers.

---

## Next Actions
1. ✅ Completed: Expandable Services + Calendly popup integration with source-tracked UTM parameters.
2. ✅ Completed: Section reorganization + merge Beyond the Work with Through My Eyes + nav reflects new order.
3. Optional (if requested): apply Calendly popup to remaining CTAs (Contact scheduling link, FloatingConnectButton) with additional identifier tags.

---

## Success Criteria
- **Final Section Order** (and nav order) is:
  1) Home (Hero)
  2) Introduction
  3) Values
  4) Organizations
  5) Résumé
  6) Voices and Impact
  7) Services
  8) Projects (Solutions)
  9) Beyond the Work (merged with Through My Eyes)
  10) In the Field (Media & Impact)
  11) Thoughts
  12) Contact
- **Beyond the Work merged room**:
  - Shows eyebrow/sub-header, heading, paragraph text, image on right
  - Replaces Faith/Family/Community pills with an auto-moving image carousel sourced from former gallery images
  - No duplicate standalone gallery room appears
- **Services**:
  - Expandable containers show image + number + title + “Explore More”
  - Expanded view reveals description + bullets + CTA
- **Calendly**:
  - Popup opens from Hero/Nav/Services with correct UTM attribution:
    - `opener`, `schedule_a_conversation`, `01_Agile`, `02_PO`, `03_Speaking`, `04_Tech`
- **Nav**:
  - Left navigation reflects the new ordering and scroll targets correctly via Lenis
- **Regression-free**:
  - Projects carousel, Services expand/collapse, Calendly popups, Media & Impact module, and Contact form still function with no console errors

---

## Implementation Notes / File Map
### Round 5 (Calendly + expandable Services)
- `/app/frontend/src/lib/calendly.js`: `loadCalendlyScript()` + `openCalendlyPopup({ baseUrl, utm, prefill })`
- `/app/frontend/src/App.js`: preloads Calendly script on mount
- `/app/frontend/src/components/rooms/RoomRenderer.js`: passes `settings` to HeroRoom/ServicesRoom
- `/app/frontend/src/components/rooms/HeroRoom.js`: “Let’s Talk” opens Calendly popup with UTM
- `/app/frontend/src/components/site/SiteNav.js`: schedule action opens Calendly popup with UTM
- `/app/frontend/src/components/rooms/ServicesRoom.js`: expandable/accordion services + Calendly CTAs
- `/app/frontend/tailwind.config.js`: added `collapsible-down/up` animations

### Round 6 (Section reorg + merge Beyond the Work + Through My Eyes)
- **DB migration (one-off script)**:
  - Merged `gallery.content.images` → `personal.content.gallery_images`
  - Added `personal.content.eyebrow` = "Through My Eyes"
  - Removed `personal.content.themes`
  - Soft-deleted standalone gallery section: `is_visible=false`, `status=draft`, `navigation_label=null`
  - Reordered display_order: personal=9, impact=10, thoughts=11, contact=12
  - Adjusted themes for alternation: personal=deep_royal_blue, impact=true_white, thoughts=deep_royal_blue
- `/app/frontend/src/components/rooms/PersonalRoom.js`: rebuilt to render header/sub-header/paragraph/image-right + autoplay carousel + lightbox
- `/app/frontend/src/lib/contentSchemas.js`: updated `personal` schema fields to match merged structure

---

## Test Artifacts
- `/app/test_reports/iteration_15.json`: 100% pass (Services expand/collapse + Calendly popup + UTM attribution + regressions)
- `/app/test_reports/iteration_16.json`: 100% pass (section reorder + merged Beyond the Work room + nav order + regressions)
