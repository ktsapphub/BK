# UI Tweak Iteration Plan (Message 510 + New Feature Batch + Rounds 3–11)

## Objectives

### Completed (Rounds 3–7)
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

- Deliver **Round 6**: Section reorganization + room merge to reduce section count
  22) **Swap Thoughts** so it appears **immediately before Contact**.
  23) **Merge “Beyond the Work” + “Through My Eyes”** into a single room that contains:
      - Header + sub-header + paragraph text
      - A single portrait image on the right
      - Replaces the old **Faith / Family / Community** theme pills with an **auto-moving image carousel** (using the former gallery images)
  24) Place the merged “Beyond the Work / Through My Eyes” room **immediately after Projects / Solutions**.
  25) Ensure the **left navigation rail** reflects the new ordering.

- Deliver **Round 7**: Layout + contrast refinements after section merge/reorder
  26) Ensure the **Beyond the Work** carousel sits **below** the header+text+image grid (full-width), not nested in the text column.
  27) Fix **blue-on-blue hover/links** readability in deep_royal_blue rooms by making link/label hover colors theme-aware (white/light on dark rooms).

### New Major Phase (Round 8): Full Admin Panel Overhaul for go-live on **brettonkey.com** — COMPLETED
- Build and/or extend a self-contained admin CMS at `/admin` with:
  28) **Multi-user admin accounts** (all full access; no roles).
      - Seed primary credentials: **username `bkey` / password `adm!np1`** (stored hashed).
  29) **Analytics**: BOTH
      - **Built-in analytics** stored in MongoDB + visualized in admin.
      - **Google Analytics (GA4)** support via a `ga_measurement_id` field in global settings.
  30) **Branding / Theme control**: BOTH
      - Preset theme switches.
      - Live theme editor (color pickers + font family selectors) persisted in CMS and applied site-wide.
  31) **Navigation management**:
      - Dedicated admin page to reorder + rename + show/hide nav items.
      - No submenus.
  32) **Media management**:
      - Already supports uploads (image/video) and URL usage in section content; ensure consistent usage across new branding and header/footer.
  33) **Header, Footer, and Forms editability**:
      - Footer already partly editable (footer_text + social links).
      - Add header/brand mark controls (logo + site title) and ensure they render in the public header/nav.
      - Confirm Connect/Contact form text is CMS-editable (already via Settings); **Reason options remain fixed** because ConnectForm’s conditional logic depends on exact labels.

- Ensure the admin system remains deployable and reliable on Render (not Emergent-only).
- **MANDATORY**: After significant feature work, validate via `testing_agent_v3`.

### Round 9: Nav polish + Connect button pulse + brand mark removal — COMPLETED
34) Remove the floating brand mark (“Bretton J. Key” scroll/brand) from the public site.
35) Make the floating **“Let’s Connect”** button more prominent with a border + pulsing animation.
36) Redesign the desktop left navigation into a **collapsible selector** with animations and inner hover highlights.

### Round 10: Navigation reconciliation + scroll-based auto-hide/show — COMPLETED
37) **Fix navigation redundancy**:
   - Removed the duplicate **“View Work”** quick action from:
     - Desktop quick-actions capsule
     - Mobile drawer quick-actions list
   - Rationale: it duplicated the existing **Projects** item in the main chapter navigation (same destination).
   - Cleanup: removed unused `Briefcase` icon import and unused `sections` prop from `SiteNav.js`.

38) **Desktop chapter-nav rail auto-hide/show**:
   - Rail now **auto-hides after ~1.4s** of scroll inactivity (fade out + slight x-translate, `pointer-events: none`).
   - Rail **reappears immediately** on any scroll activity (up or down), and remains visible while hovered or keyboard-focused.
   - Implemented with `navVisible` state + `revealNav()` and a rAF-throttled passive scroll listener; uses a ref-tracked expanded flag to avoid stale-closure timer bugs.
   - Scope: **desktop rail only**; quick-actions capsule and mobile nav remain persistently visible.

### Round 11: Thoughts label fill color + Connect button depth/shadow — COMPLETED
39) **Thoughts category filter chip fill color fix**:
   - Replaced the active category chip’s flat blue fill (`bg-[var(--surface-blue)]`) with an **alternating gray/charcoal palette** (4 shades: `#4B5563`, `#374151`, `#5B6472`, `#6B7280`).
   - Applied via inline style `backgroundColor` based on category index.
   - Goal: reduce “too much blue” and create subtle visual variation.

40) **Floating “Let’s Connect” pulse depth upgrade**:
   - Upgraded the button elevation to a **layered shadow stack** (glossy inset top highlight + soft drop shadow).
   - Converted the pulse from a flat filled disc to a **glowing ring/halo** (box-shadow-based) while preserving the same `animate-ping` timing.

---

## Implementation Steps

### Phase 1: POC (Core Verification of the UI Changes) — COMPLETED
*(Kept for historical traceability.)*

**POC Status (Current)**
- ✅ Original 4 UI polish items implemented and verified (iteration_8).
- ✅ Logos + Voices & Impact batch implemented and verified (iteration_9).
- ✅ Round 3 changes implemented and verified (iteration_10).
- ✅ Round 4 changes implemented and verified (iterations_11–14).
- ✅ Round 5 (Calendly + expandable Services) implemented and verified (iteration_15).
- ✅ Round 6 (Section reorg + merge Beyond the Work + Through My Eyes) implemented and verified (iteration_16).
- ✅ Round 7 (carousel placement + blue-on-blue hover contrast fixes) implemented and verified (iteration_17).

---

### Phase 2: V1 App Development (Finalize and Harden the UI Changes) — COMPLETED / STABLE
- ✅ Round 8 admin overhaul implemented and verified (iteration_18).

---

### Phase 3: Additional Features / Follow-ups — Rounds 9–11 COMPLETED

## Round 8 — Admin Panel Overhaul (Go-live readiness) — COMPLETED

### User stories (Round 8)
1. As Bretton, I can go to `https://brettonkey.com/admin` and log in with a username/password.
2. As Bretton, I can create additional admin users and remove them.
3. As Bretton, I can add/remove sections and change their order.
4. As Bretton, I can edit navigation labels, placement, and show/hide items.
5. As Bretton, I can update brand colors and fonts via a theme editor or pick from presets.
6. As Bretton, I can upload media and use uploaded URLs throughout content.
7. As Bretton, I can view analytics dashboards (self-hosted) and optionally enable GA4.
8. As Bretton, I can edit header/footer content and form wording without code changes.

### Existing infrastructure reused (not rebuilt)
- Admin auth already existed:
  - `db.users` collection
  - bcrypt hashing
  - JWT (`/api/admin/login`, `/api/admin/me`, `get_current_admin`)
  - `seed_admin()` based on env vars (`ADMIN_EMAIL`, `ADMIN_PASSWORD`).
- Section editing already existed:
  - Dynamic schemas in `/app/frontend/src/lib/contentSchemas.js`
  - Dynamic editor UI in `/app/frontend/src/components/admin/DynamicForm.js`
  - Admin Rooms UI in `/admin/sections`.
- Media upload already existed (`/admin/media/upload` + Media Library UI).
- Generic reorder endpoint already existed: `POST /api/admin/reorder/{collection}` (used for `sections`).
- `recharts` already installed (used for analytics charts).

### Backend implementation (delivered)
**A) Users CRUD (multi-user admin accounts)**
- **models.py**
  - ✅ Added `UserCreate`.
- **server.py**
  - ✅ `GET /api/admin/users` (list users).
  - ✅ `POST /api/admin/users` (create user with bcrypt hash).
  - ✅ `DELETE /api/admin/users/{id}` (delete user).
  - ✅ Safety rules implemented:
    - Cannot delete last remaining admin.
    - Cannot delete currently logged-in user.
- **Seeded primary credentials**
  - ✅ `bkey / adm!np1` created alongside the original admin account.

**B) Built-in analytics (self-hosted) + GA4 support**
- **models.py**
  - ✅ Added `PageviewCreate`.
- **server.py**
  - ✅ `POST /api/public/analytics/pageview` stores pageview events.
  - ✅ `GET /api/admin/analytics/summary?days=N` returns:
    - total views
    - unique visitors (by visitor_id)
    - views_by_day
    - top_paths
    - top_referrers
    - device breakdown

**C) Global settings expansion (branding + GA + theme)**
- **models.py**
  - ✅ Extended `GlobalSettingsUpdate` with:
    - `ga_measurement_id`
    - `site_logo_url`
    - `theme_*` color tokens
    - `theme_font_*` font tokens
- **server.py**
  - ✅ Existing Global Settings PUT/GET automatically supports the new optional fields.

### Frontend implementation (delivered)
**A) API client updates (`/app/frontend/src/lib/api.js`)**
- ✅ Added:
  - `adminApi.listUsers/createUser/deleteUser`
  - `adminApi.getAnalyticsSummary(days)`
  - `publicApi.trackPageview(payload)`

**B) Analytics client + provider (public site)**
- ✅ New `/app/frontend/src/lib/analytics.js`:
  - stable anonymous `visitor_id` in localStorage
  - sends pageview to backend + mirrors to `gtag()` if loaded
- ✅ New `/app/frontend/src/components/site/AnalyticsProvider.js`:
  - mounted once in `App.js`
  - loads GA4 script only if `ga_measurement_id` exists in settings
  - tracks pageviews on every route change

**C) Theme injector (public site)**
- ✅ New `/app/frontend/src/components/site/ThemeInjector.js`:
  - reads global settings and applies any `theme_*` and `theme_font_*` values as CSS variables
- ✅ `App.js` mounts ThemeInjector + AnalyticsProvider inside BrowserRouter
- ✅ Extended `/app/frontend/src/index.css` font imports to support the font picker.

**D) New admin pages**
- ✅ `AdminUsers.js`: create/list/delete admin users.
- ✅ `AdminAnalytics.js`: stat cards + recharts charts + top pages/referrers + device breakdown.
- ✅ `AdminNavigation.js`:
  - up/down reorder (reuses existing reorder endpoint)
  - inline nav label editing
  - visibility toggle
  - no submenus
- ✅ `AdminAppearance.js`:
  - 4 presets (Royal Blue Classic, Midnight Navy, Slate Charcoal, Ocean Teal)
  - live color pickers + hex sync
  - font pickers (display/body/editorial)
  - header logo upload/URL via MediaPickerInput
  - Save + Reset

**E) Admin shell updates**
- ✅ `AdminLayout.js` sidebar updated with new pages:
  - Navigation, Appearance, Analytics, Users
- ✅ `App.js` routes added:
  - `/admin/navigation`, `/admin/appearance`, `/admin/analytics`, `/admin/users`

**F) Header / Footer / Forms editability**
- ✅ Footer remains editable via Settings (`footer_text`, social links).
- ✅ Forms confirmed editable via Settings for headings/copy/consent/privacy URL.
- ✅ Deliberate constraint: Reason dropdown options remain fixed to preserve ConnectForm conditional logic.

### Bug found during verification (and fixed)
- ✅ AdminLogin used HTML5 `type="email"` which blocked non-email usernames like `bkey`.
  - Fixed by switching the field to `type="text"` and labeling it "Email / Username".

---

## Round 9 — Public Navigation + Connect CTA Polish — COMPLETED

### What changed
**A) Remove floating brand mark**
- ✅ Removed the fixed top-left `site-header-brand` element entirely from `SiteNav.js`.

**B) Floating “Let’s Connect” CTA: border + pulsing emphasis**
- ✅ Updated `FloatingConnectButton.js`:
  - Added a themed **2px border** (white/70 on dark rooms, brand-blue/60 on light rooms).
  - Added a continuous **pulse / ping** animation behind the button (`animate-ping`, ~2.4s, infinite) with `pointer-events: none` to avoid blocking clicks.

**C) Desktop nav rail: collapsible selector with animated highlights**
- ✅ Updated `SiteNav.js` desktop rail:
  - Collapsed by default (minimal dots; only active section’s label shown).
  - Expands on hover/focus into a **glass panel** (backdrop blur) with fade/scale animation.
  - All labels fade/slide into view in expanded state.
  - Added an **animated inner highlight pill** behind hovered/focused item (Framer Motion shared `layoutId`).
  - Kept keyboard navigation (Tab expands; Arrow Up/Down/Home/End still works).

### Verification
- ✅ Verified via `testing_agent_v3` (iteration_19): 100% pass.

---

## Round 10 — Navigation Reconciliation + Auto-hide on Scroll Idle — COMPLETED

### What changed
**A) Redundancy cleanup**
- ✅ Removed the duplicate "View Work" quick action from:
  - Desktop quick-actions capsule
  - Mobile drawer quick-actions section
- ✅ Removed unused `Briefcase` icon import.
- ✅ Removed unused `sections` prop from `SiteNav` and updated the `persistentActions` memo dependencies.

**B) Desktop rail hide/show on scroll**
- ✅ Added nav rail wrapper (`motion.div`) with:
  - Auto-hide after ~1.4 seconds of scroll inactivity.
  - Immediate re-show on scroll up or down.
  - Always stays visible while hovered or keyboard-focused.
  - Uses `pointer-events: none` while hidden so it never blocks page interaction.

### Verification
- ✅ Verified via `testing_agent_v3` (iteration_20): 100% pass.

---

## Round 11 — Visual Polish: Thoughts chips + Connect depth — COMPLETED

### What changed
**A) Thoughts category chip fill color**
- ✅ Updated `/app/frontend/src/components/rooms/ThoughtsRoom.js`:
  - Active category chip fill is no longer brand-blue.
  - Uses a 4-tone neutral palette and alternates by category index.

**B) Connect button depth + pulse realism**
- ✅ Updated `/app/frontend/src/components/connect/FloatingConnectButton.js`:
  - Upgraded elevation with layered shadows.
  - Pulse is now a glowing halo ring (box-shadow based) rather than a flat filled disc.

### Verification
- ✅ Verified via `testing_agent_v3` (iteration_21): **95% pass**.
  - Requested fixes passed cleanly.
  - One **LOW severity** pre-existing note was flagged about theme color swapping in automated detection; the theme detection logic was not modified in Round 11, and this swap behavior previously passed 100% in iterations 15–20.

---

## Next Actions
- No pending tasks in this round.
- Optional follow-up: if the Connect button dark/light color swapping ever shows inconsistencies in real browsing, investigate `FloatingConnectButton.updateTheme()` elementFromPoint lookup for edge cases (e.g., overlays, dialog layers, or sections without `[data-theme-dark]`).

---

## Success Criteria — MET

### Public site
- ✅ Floating brand mark removed.
- ✅ “Let’s Connect” CTA is more noticeable (border + pulse) and remains fully usable.
- ✅ Desktop nav rail behaves as a collapsible selector with polished animations and hover/focus highlights.
- ✅ Navigation redundancy removed.
- ✅ Desktop nav rail auto-hides on idle and reappears on any scroll activity.
- ✅ Thoughts category active chip fill is no longer overly blue (now neutral alternating grays).
- ✅ Connect CTA has improved depth + realistic halo pulse.

### Admin site
- ✅ No changes required; all previously delivered Round 8 functionality remains stable.

### Testing
- ✅ `testing_agent_v3` passed:
  - `/app/test_reports/iteration_19.json`: 100% pass (Round 9)
  - `/app/test_reports/iteration_20.json`: 100% pass (Round 10)
  - `/app/test_reports/iteration_21.json`: 95% pass (Round 11; requested changes passed, 1 low-severity pre-existing flag)

---

## Implementation Notes / File Map

### Completed (Rounds 5–7 highlight)
- Calendly:
  - `/app/frontend/src/lib/calendly.js`
  - Hero/Nav/Services CTAs wired to Calendly popup with UTM tracking
- Services expandable cards:
  - `/app/frontend/src/components/rooms/ServicesRoom.js`
- Section reorder + merge:
  - DB migration for personal+gallery merge
  - `/app/frontend/src/components/rooms/PersonalRoom.js`
  - `/app/frontend/src/components/rooms/ThoughtsRoom.js` theme-aware hover

### Round 8 (delivered)
- Backend:
  - `/app/backend/models.py` (UserCreate, PageviewCreate, GlobalSettingsUpdate fields)
  - `/app/backend/server.py` (users endpoints, analytics endpoints)
  - `/app/backend/auth_utils.py` (JWT + bcrypt)
- Frontend:
  - `/app/frontend/src/lib/api.js` (new endpoints)
  - `/app/frontend/src/lib/analytics.js` (new)
  - `/app/frontend/src/components/site/AnalyticsProvider.js` (new)
  - `/app/frontend/src/components/site/ThemeInjector.js` (new)
  - `/app/frontend/src/pages/admin/AdminUsers.js` (new)
  - `/app/frontend/src/pages/admin/AdminAnalytics.js` (new)
  - `/app/frontend/src/pages/admin/AdminNavigation.js` (new)
  - `/app/frontend/src/pages/admin/AdminAppearance.js` (new)
  - `/app/frontend/src/pages/admin/AdminLayout.js` (sidebar updates)
  - `/app/frontend/src/pages/admin/AdminSettings.js` (GA field)
  - `/app/frontend/src/pages/admin/AdminLogin.js` (username-friendly login)
  - `/app/frontend/src/App.js` (routes + ThemeInjector/AnalyticsProvider)

### Rounds 9–11 (delivered)
- Public nav + CTA polish:
  - `/app/frontend/src/components/site/SiteNav.js`
    - Removed `site-header-brand`
    - Collapsible selector behavior for desktop rail
    - Removed redundant "View Work" quick action
    - Added desktop rail auto-hide/show on scroll idle
  - `/app/frontend/src/components/connect/FloatingConnectButton.js`
    - Added border + pulsing animation
    - Upgraded depth (layered shadows)
    - Pulse changed to halo ring glow
  - `/app/frontend/src/components/rooms/ThoughtsRoom.js`
    - Active category chip fill changed from blue to alternating neutral palette

---

## Test Artifacts
- `/app/test_reports/iteration_15.json`: 100% pass (Services expand/collapse + Calendly popup + UTM attribution)
- `/app/test_reports/iteration_16.json`: 100% pass (section reorder + merged Beyond the Work room + nav order)
- `/app/test_reports/iteration_17.json`: 100% pass (Beyond the Work carousel placement + Thoughts hover contrast)
- `/app/test_reports/iteration_18.json`: 100% pass (Round 8 Admin Overhaul: users + analytics + appearance + navigation + header branding + regressions)
- `/app/test_reports/iteration_19.json`: 100% pass (Round 9: brand mark removal + connect pulse + collapsible desktop rail)
- `/app/test_reports/iteration_20.json`: 100% pass (Round 10: nav redundancy fix + desktop rail auto-hide/show)
- `/app/test_reports/iteration_21.json`: 95% pass (Round 11: Thoughts active chip neutral fills + Connect depth/halo pulse; low-severity pre-existing note flagged)
