# UI Tweak Iteration Plan (Message 510 + New Feature Batch + Rounds 3–8)

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

### New Major Phase (Round 8): Full Admin Panel Overhaul for go-live on **brettonkey.com**
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
      - Confirm Connect/Contact form text is CMS-editable (already via Settings); flag that **Reason options remain fixed** because conditional logic depends on exact labels.

- Ensure the admin system remains deployable and reliable on Render (not Emergent-only).
- **MANDATORY**: After significant feature work, validate via `testing_agent_v3`.

---

## Implementation Steps

### Phase 1: POC (Core Verification of the UI Changes) — COMPLETED
*(Already completed through iteration_17; keeping for historical traceability.)*

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
- No new UI work requested beyond the Round 8 admin overhaul.

---

### Phase 3: Additional Features / Follow-ups — NOW ACTIVE (Round 8)

## Round 8 — Admin Panel Overhaul (Go-live readiness)

### User stories (Round 8)
1. As Bretton, I can go to `https://brettonkey.com/admin` and log in with a username/password.
2. As Bretton, I can create additional admin users and remove them.
3. As Bretton, I can add/remove sections and change their order.
4. As Bretton, I can edit navigation labels, placement, and show/hide items.
5. As Bretton, I can update brand colors and fonts via a theme editor or pick from presets.
6. As Bretton, I can upload media and use uploaded URLs throughout content.
7. As Bretton, I can view analytics dashboards (self-hosted) and optionally enable GA4.
8. As Bretton, I can edit header/footer content and form wording without code changes.

### Existing infrastructure to reuse (do NOT rebuild)
- Admin auth already exists:
  - `db.users` collection
  - bcrypt hashing
  - JWT (`/api/admin/login`, `/api/admin/me`, `get_current_admin`)
  - `seed_admin()` based on env vars (`ADMIN_EMAIL`, `ADMIN_PASSWORD`).
- Section editing already exists:
  - Dynamic schemas in `/app/frontend/src/lib/contentSchemas.js`
  - Dynamic editor UI in `/app/frontend/src/components/admin/DynamicForm.js`
  - Admin Rooms UI in `/admin/sections`.
- Media upload already exists (`/admin/media/upload` + Media Library UI).
- Navigation support already exists:
  - `navigation_items` collection + `/admin/navigation-items` endpoints.
  - Public nav auto-derived from published sections with `navigation_label`.
- Generic reorder endpoint already exists: `POST /api/admin/reorder/{collection}` (supports `sections`).
- `recharts` already installed for analytics charts.

### Backend implementation (additive, preserve existing logic)
**A) Users CRUD (multi-user admin accounts)**
- **models.py**:
  - Add `UserCreate` model: `{ email: str, password: str }` (note: we treat `email` as a username; can be non-email like `bkey`).
- **server.py**:
  - `GET /api/admin/users` (list users).
  - `POST /api/admin/users` (create user with bcrypt hash).
  - `DELETE /api/admin/users/{id}` (delete user).
  - Safety rules:
    - Block deleting the last remaining user.
    - Block deleting the currently logged-in user (or require a separate confirmation flow).

**B) Built-in analytics (self-hosted)**
- **models.py**:
  - Add `PageviewCreate`: `{ path, referrer, user_agent, visitor_id, ts }` (ts optional).
- **server.py**:
  - `POST /api/public/analytics/pageview` (unauthenticated; store event).
  - `GET /api/admin/analytics/summary?days=N`:
    - total views
    - unique visitors (by visitor_id)
    - views_by_day
    - top_paths
    - top_referrers
    - device breakdown (simple UA parsing: mobile/desktop/tablet)

**C) Global settings expansion (branding + GA)**
- **models.py**: extend `GlobalSettingsUpdate` with:
  - `ga_measurement_id`
  - Header/brand: `site_logo_url`
  - Theme token overrides:
    - `theme_bg_primary`, `theme_bg_secondary`, `theme_bg_blue_soft`
    - `theme_surface_blue`, `theme_surface_blue_dark`, `theme_accent_highlight`
    - `theme_text_primary`, `theme_text_secondary`, `theme_text_muted`
    - `theme_text_on_blue`, `theme_text_on_blue_muted`
    - `theme_border_primary`, `theme_border_blue`
    - `theme_font_display`, `theme_font_body`, `theme_font_editorial`

**D) Seed requested primary admin user**
- One-off migration script or update to `seed_admin()` to ensure `bkey / adm!np1` exists.
  - Preferred: one-off script that inserts if missing to avoid overwriting env-based seed.

### Frontend implementation (admin + public)

**A) API client updates (`/app/frontend/src/lib/api.js`)**
- Add admin endpoints:
  - `listUsers`, `createUser`, `deleteUser`
  - `getAnalyticsSummary`
- Add public analytics:
  - `publicApi.trackPageview`

**B) Analytics client + provider (public site)**
- New `/app/frontend/src/lib/analytics.js`:
  - Create/stash `visitor_id` in `localStorage`.
  - `trackPageview({ path, referrer, user_agent })`:
    - POST to `/api/public/analytics/pageview`
    - If GA is enabled, call `gtag('event','page_view', ...)`.
- New `/app/frontend/src/components/site/AnalyticsProvider.js`:
  - Reads `ga_measurement_id` from global settings.
  - Injects GA script only when set.
  - Tracks route changes (React Router) and sends pageview events.

**C) Theme injector (public site)**
- New `/app/frontend/src/components/site/ThemeInjector.js`:
  - Fetch `/api/public/global-settings`.
  - Apply any `theme_*` settings as CSS variables on `document.documentElement`.
  - Defaults remain in `index.css` if unset.
- Update `/app/frontend/src/App.js`:
  - Mount `<ThemeInjector />` and `<AnalyticsProvider />` inside `BrowserRouter`.

**D) New admin pages**
- `AdminUsers.js`:
  - List users
  - Create user form (username + password)
  - Delete user action with confirmation
- `AdminAnalytics.js`:
  - Summary cards + recharts graphs:
    - Line: views over time
    - Bar/pie: device breakdown
  - Lists: top pages, top referrers
  - Note: GA enabled/disabled status shown
- `AdminNavigation.js`:
  - List sections (display_order)
  - Up/Down reorder (uses existing reorder endpoint)
  - Inline edit `navigation_label`
  - Toggle `is_visible`
  - (No submenu)
- `AdminAppearance.js`:
  - Theme presets (quick switch)
  - Live color pickers for tokens
  - Font pickers (display/body/editorial)
  - Header settings:
    - Upload/select logo URL (using existing `MediaPickerInput`)
  - Save + Reset

**E) Admin shell updates**
- `/app/frontend/src/pages/admin/AdminLayout.js`:
  - Add sidebar entries:
    - Navigation
    - Appearance
    - Analytics
    - Users
- `/app/frontend/src/App.js` routes:
  - Add `/admin/users`, `/admin/analytics`, `/admin/appearance`, `/admin/navigation`.

**F) Header/Footer/Forms editability**
- Footer:
  - Already editable via Settings (`footer_text`, social links). Keep.
- Header:
  - Add brand mark in public nav:
    - If `settings.site_logo_url` set: show logo
    - Else show `settings.site_title`
- Forms:
  - Already editable text via Settings: connect dialog heading/copy + consent wording + privacy URL.
  - **Explicit constraint**: “Reason for connecting” dropdown options remain fixed because ConnectForm conditional logic depends on exact labels.

### Analytics + GA deployment notes (Render)
- Built-in analytics requires no 3rd party.
- GA requires adding `ga_measurement_id` in admin settings.
- Ensure `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` are set in Render env.

---

## Next Actions (Round 8)
1. Implement backend user CRUD + analytics endpoints + GlobalSettingsUpdate extensions.
2. Implement admin pages: Users / Analytics / Navigation / Appearance.
3. Implement public site ThemeInjector + AnalyticsProvider.
4. Seed `bkey / adm!np1` admin user.
5. Run `testing_agent_v3` covering:
   - /admin login with `bkey` credentials
   - Users create/list/delete
   - Navigation reorder/rename/hide reflected on public left nav
   - Appearance changes persist and affect public theme variables
   - Analytics dashboard renders and pageviews increase after visiting public pages
   - GA script only injected when ID set
   - Regression: existing CMS pages, Services/Calendly, Contact form unaffected

---

## Success Criteria

### Public site
- Theme variables can be overridden from CMS settings and persist across reloads.
- GA loads only when configured.
- Built-in analytics records pageviews on every route view.
- Header shows logo when provided; otherwise shows title.

### Admin site
- `/admin` is reachable only after login.
- Multi-user accounts supported; all users have full access.
- Users page supports create/list/delete with safety checks.
- Navigation page supports reorder/rename/show-hide and reflects on public nav.
- Appearance page supports presets + color pickers + font pickers, persisted in global settings and reflected on public site.
- Analytics page shows meaningful charts and aggregates for last N days.
- Media upload continues to work and can be used for logo and section images.

### Testing
- `testing_agent_v3` must pass for Round 8 before marking complete.

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

### Round 8 (new)
- Backend:
  - `/app/backend/models.py` (UserCreate, PageviewCreate, GlobalSettingsUpdate fields)
  - `/app/backend/server.py` (users endpoints, analytics endpoints)
  - `/app/backend/auth_utils.py` (seed bkey user via migration or extend seed safely)
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
  - `/app/frontend/src/App.js` (routes + providers)

---

## Test Artifacts
- `/app/test_reports/iteration_15.json`: 100% pass (Services expand/collapse + Calendly popup + UTM attribution)
- `/app/test_reports/iteration_16.json`: 100% pass (section reorder + merged Beyond the Work room + nav order)
- `/app/test_reports/iteration_17.json`: 100% pass (Beyond the Work carousel placement + Thoughts hover contrast)
- (Planned) iteration_18.json: Round 8 Admin Overhaul verification
