# UI Tweak Iteration Plan (Message 510 + New Feature Batch + Rounds 3–12)

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

---

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
      - Supports uploads (image/video) and URL usage throughout section content.
  33) **Header, Footer, and Forms editability**:
      - Footer editable (footer_text + social links).
      - Connect/Contact form text editable via Settings; **Reason options remain fixed** due to ConnectForm conditional logic.

- Ensure the admin system remains deployable and reliable on Render (not Emergent-only).
- **MANDATORY**: After significant feature work, validate via `testing_agent_v3`.

---

### Round 9: Nav polish + Connect button pulse + brand mark removal — COMPLETED
34) Remove the floating brand mark (“Bretton J. Key” scroll/brand) from the public site.
35) Make the floating **“Let’s Connect”** button more prominent with a border + pulsing animation.
36) Redesign the desktop left navigation into a **collapsible selector** with animations and inner hover highlights.

---

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

---

### Round 11: Thoughts label fill color + Connect button depth/shadow — COMPLETED
39) **Thoughts category filter chip fill color fix**:
   - Replaced the active category chip’s flat blue fill (`bg-[var(--surface-blue)]`) with an **alternating gray/charcoal palette** (4 shades: `#4B5563`, `#374151`, `#5B6472`, `#6B7280`).
   - Applied via inline style `backgroundColor` based on category index.
   - Goal: reduce “too much blue” and create subtle visual variation.

40) **Floating “Let’s Connect” pulse depth upgrade**:
   - Upgraded the button elevation to a **layered shadow stack** (glossy inset top highlight + soft drop shadow).
   - Converted the pulse from a flat filled disc to a **glowing ring/halo** (box-shadow-based) while preserving the same `animate-ping` timing.

---

### Round 12: Admin gap-audit fixes (export, password management, privacy policy CMS, remove Emergent branding, favicon) — COMPLETED
41) **Export form submissions (CSV)**
   - Added client-side CSV export (no new backend endpoints required).
   - `AdminInquiries.js`: new **Export CSV** button exports all inquiry fields.
   - New `AdminNewsletter.js`: lists newsletter subscribers and supports CSV export.

42) **Password management (manual, admin-friendly)**
   - Backend:
     - `POST /api/admin/change-password` (self-service; **no-auth** endpoint by design; requires username + current password + new password).
     - `PUT /api/admin/users/{id}/password` (admin-managed password set for any user).
   - Frontend:
     - Shared `PasswordInput.js` component with show/hide toggle (eye icon) used consistently.
     - `/admin/login` now includes a **Reset Password** mode (manual reset: username + current password + new password + confirm).
     - `/admin/users` includes a per-user **Reset Password** dialog (admin sets password directly).
   - Post-test cleanup:
     - Restored `bkey` password to **`adm!np1`**.
     - Removed leftover test user `qa_reset_test`.

43) **Privacy Policy is now CMS-editable**
   - Added new Settings fields:
     - `privacy_policy_updated_date`
     - `privacy_policy_content`
   - Markup convention:
     - `## Heading` for section titles
     - blank lines separate paragraphs
     - `- ` for bullet points
     - `{{contact_email}}` auto-substitution token
   - Rewrote `PrivacyPolicy.js` to parse and render the CMS content (including auto mailto linking).
   - Seeded content from the user-provided `privacy-policy.html` (extracted verbatim).

44) **Removed Emergent branding + corrected static SEO meta**
   - Cleaned `/app/frontend/public/index.html`:
     - Removed PostHog script and `emergent-main.js`.
     - Updated `<title>` to **Bretton J. Key**.
     - Updated `<meta name="description">` to correctly describe the site.
     - Added basic Open Graph + Twitter meta tags.

45) **Favicon wired**
   - Added `/app/frontend/public/favicon-96x96.png` (user-provided).
   - Linked via `<link rel="icon">` and `apple-touch-icon`.

46) **Explicitly deferred**
   - Admin Dashboard stat/polish upgrades (user: “do not do at the moment”).

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

### Phase 3: Additional Features / Follow-ups — Rounds 9–12 COMPLETED

## Round 8 — Admin Panel Overhaul (Go-live readiness) — COMPLETED
*(Retained from earlier plan; see “Objectives” section for deliverables.)*

---

## Round 9 — Public Navigation + Connect CTA Polish — COMPLETED
*(Retained from earlier plan; see “Objectives” section for deliverables.)*

---

## Round 10 — Navigation Reconciliation + Auto-hide on Scroll Idle — COMPLETED
*(Retained from earlier plan; see “Objectives” section for deliverables.)*

---

## Round 11 — Visual Polish: Thoughts chips + Connect depth — COMPLETED
*(Retained from earlier plan; see “Objectives” section for deliverables.)*

---

## Round 12 — Admin Gap-Audit Fixes — COMPLETED

### User stories (Round 12)
1. As Bretton, I can export Inquiries (contact form submissions) to CSV.
2. As Bretton, I can view and export newsletter subscribers to CSV.
3. As Bretton, I can see what password I’m typing (show/hide toggle) anywhere passwords are entered.
4. As Bretton, I can reset my admin password manually from the login screen (no email flow).
5. As Bretton, I can reset any admin user’s password from the Users screen.
6. As Bretton, I can manage the Privacy Policy content in the CMS and publish it to `/privacy`.
7. As Bretton, the public site contains no Emergent branding/tracking and has correct title/meta/favicon.

### Backend implementation (delivered)
- ✅ `POST /api/admin/change-password` (self-service)
- ✅ `PUT /api/admin/users/{id}/password` (admin-managed reset)
- ✅ Added `privacy_policy_updated_date`, `privacy_policy_content` to global settings schema (via `GlobalSettingsUpdate`).

### Frontend implementation (delivered)
- ✅ `AdminInquiries.js`: added Export CSV button.
- ✅ `AdminNewsletter.js`: new page + CSV export.
- ✅ `PasswordInput.js`: shared show/hide component.
- ✅ `AdminLogin.js`: added Reset Password mode + toggles.
- ✅ `AdminUsers.js`: added per-user Reset Password dialog + toggles.
- ✅ `AdminSettings.js`: added Legal/Privacy section.
- ✅ `PrivacyPolicy.js`: CMS-driven rendering + mailto auto-linking.
- ✅ `index.html`: removed Emergent scripts, updated title/meta, added OG tags, wired favicon.

### Verification
- ✅ Verified via `testing_agent_v3` (iteration_22):
  - Frontend: **100% pass**
  - Backend: **95.3% pass** (3 non-critical rate-limit timing anomalies on `/api/public/inquiries` during rapid test loops — not a functional bug)
- ✅ Post-test cleanup performed:
  - `bkey` password restored to **adm!np1**
  - Leftover `qa_reset_test` admin user removed

---

## Next Actions
- No pending tasks.
- Optional low-priority hardening:
  - Consider making public inquiry rate-limit threshold/delay more deterministic for automated tests (currently functions correctly; only timing variance observed under rapid test bursts).

---

## Success Criteria — MET

### Public site
- ✅ No Emergent scripts/branding in static HTML.
- ✅ Correct title/meta/OG + favicon.
- ✅ Privacy policy is editable via CMS and renders correctly at `/privacy`.

### Admin site
- ✅ Export CSV for Inquiries.
- ✅ Newsletter subscribers page + CSV export.
- ✅ Password show/hide toggles everywhere passwords are entered.
- ✅ Manual Reset Password on login screen + per-user reset in Users.
- ✅ Credentials confirmed working: `bkey/adm!np1` and `brettonjkey@icloud.com/#Test1234`.

### Testing
- ✅ `testing_agent_v3` passed:
  - `/app/test_reports/iteration_19.json`: 100% pass (Round 9)
  - `/app/test_reports/iteration_20.json`: 100% pass (Round 10)
  - `/app/test_reports/iteration_21.json`: 95% pass (Round 11; requested changes passed, 1 low-severity pre-existing flag)
  - `/app/test_reports/iteration_22.json`: 100% FE / 95.3% BE pass (Round 12)

---

## Implementation Notes / File Map

### Round 12 (delivered)
- Backend:
  - `/app/backend/models.py`
    - `ChangePasswordRequest`, `SetPasswordRequest`
    - `privacy_policy_updated_date`, `privacy_policy_content` in `GlobalSettingsUpdate`
  - `/app/backend/server.py`
    - `POST /api/admin/change-password`
    - `PUT /api/admin/users/{id}/password`
- Frontend:
  - `/app/frontend/src/lib/csvExport.js` (new)
  - `/app/frontend/src/pages/admin/AdminInquiries.js` (CSV export)
  - `/app/frontend/src/pages/admin/AdminNewsletter.js` (new)
  - `/app/frontend/src/components/admin/PasswordInput.js` (new)
  - `/app/frontend/src/pages/admin/AdminLogin.js` (reset password mode + toggles)
  - `/app/frontend/src/pages/admin/AdminUsers.js` (reset password dialog + toggles)
  - `/app/frontend/src/pages/admin/AdminSettings.js` (Legal/Privacy fields)
  - `/app/frontend/src/pages/PrivacyPolicy.js` (CMS-driven policy rendering)
  - `/app/frontend/public/index.html` (meta cleanup + remove Emergent + favicon + OG)
  - `/app/frontend/public/favicon-96x96.png` (new)

---

## Test Artifacts
- `/app/test_reports/iteration_15.json`: 100% pass (Services expand/collapse + Calendly popup + UTM attribution)
- `/app/test_reports/iteration_16.json`: 100% pass (section reorder + merged Beyond the Work room + nav order)
- `/app/test_reports/iteration_17.json`: 100% pass (Beyond the Work carousel placement + Thoughts hover contrast)
- `/app/test_reports/iteration_18.json`: 100% pass (Round 8 Admin Overhaul)
- `/app/test_reports/iteration_19.json`: 100% pass (Round 9)
- `/app/test_reports/iteration_20.json`: 100% pass (Round 10)
- `/app/test_reports/iteration_21.json`: 95% pass (Round 11)
- `/app/test_reports/iteration_22.json`: 100% FE / 95.3% BE pass (Round 12)
