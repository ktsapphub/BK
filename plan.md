# plan.md

## 1. Objectives
- Deliver a cinematic “gallery rooms” personal site for Bretton J. Key where **all** content (copy/media/order/visibility/transitions) is CMS-driven from MongoDB.
- Provide a custom CMS on FastAPI + MongoDB that replicates Supabase-like capabilities: **JWT admin auth**, **draft/publish/archived**, **RLS-equivalent gating** (public reads published+visible only; testimonials require verified), **Object Storage media library**, and **publish-time version snapshots + rollback**.
- Ensure public experience is editorial/cinematic (not a template), using the exact design tokens + typography system, with accessible motion and reduced-motion fallback.
- Ensure admin can manage everything without code changes: sections/rooms, global settings, projects/services/thoughts/resume entries/testimonials, media uploads, inquiries, newsletter subscribers.
- Provide a **minimal floating navigation system** that is fully CMS-derived (published + visible + in-nav), supports deep links and keyboard navigation, and adapts automatically to room theme.
- Provide a **thought-leadership “Thoughts” index** that is immersive (expandable per-article), supports image/video media, and paginates beyond 5.
- Provide a **persistent “Let’s Connect” + unified Contact System**:
  - A floating connect button across public routes.
  - A responsive, accessible dialog (drawer/modal/bottom sheet/fullscreen) with discard-warning.
  - A shared form component used both in the dialog and the Contact room.
  - Strict consent collection + server-side re-validation + consent recordkeeping + spam protection.
  - A real Privacy Policy page linked near consent.

**Current status:** ✅ V1 objectives achieved **and end-to-end verified**.
- Public site, admin CMS, and all APIs are functioning with seeded real content.
- New features completed and verified:
  - Minimal floating SiteNav (desktop rail + progress line + mobile drawer + persistent quick actions)
  - ThoughtsRoom accordion (expandable articles) + image/video support + pagination logic
  - Persistent “Let’s Connect” system (floating button + responsive dialog + shared ConnectForm + privacy policy + consent recordkeeping)
- Comprehensive testing completed with a 100% pass rate (backend + public + admin) and **zero open issues**.
- Remaining work is **optional Phase 4 launch content operations** (replace stock imagery + add verified testimonials + set resume PDF URL) and minor polish.

---

## 2. Implementation Steps

### Phase 0 — Integration playbook + best-practice quick research ✅ COMPLETE
- Get Object Storage integration playbook for: init, upload, retrieval, deletion, file naming, size/type limits.
- Quick best-practice research for: draft/publish modeling, version snapshot strategy, safe media handling.

**Outcome:** Storage approach implemented successfully using Emergent Object Storage integration.

---

### Phase 1 — Core POC (isolation) ✅ COMPLETE
**Goal:** prove the backbone works with real data flow and no hardcoded content.

**Backend (minimal, POC scope) ✅**
- Implemented minimum collections: `users`, `pages`, `sections`, `career_entries`, `testimonials`, `media_items`, `content_versions`.
- JWT admin auth:
  - Seeded admin user: `brettonjkey@icloud.com` (bcrypt-hashed `#Test1234`).
  - Endpoints: `POST /api/admin/login`, JWT verification + protected routes.
- CMS core endpoints (admin): CRUD, publish/unpublish, version snapshot on publish + rollback.
- Public read endpoints (RLS-equivalent):
  - `GET /api/public/page/{slug}` returns **only** `status=published` and `is_visible=true`.
  - `GET /api/public/testimonials` returns **only** `verified=true` and `status=published`.
- Media endpoints (admin): upload/list/delete backed by object storage; metadata stored in `media_items`.

**Frontend (minimal POC UI) ✅**
- Minimal dynamic renderer + minimal admin UI to validate end-to-end content flow.

**POC test script ✅**
- `backend/scripts/poc_core_flow_test.py` created and passing:
  - Admin login/JWT
  - Object storage upload + public retrieval
  - Draft → publish → public render
  - Verified testimonial gate
  - Publish snapshot + rollback affecting public output

**Exit criteria ✅ met**
- POC script passes reliably; public API never leaks drafts; verified-gate enforced; media upload works.

---

### Phase 2 — V1 App development (full build around proven core) ✅ COMPLETE

#### Design + content system setup ✅
- Global CSS variables implemented exactly per spec; no forbidden color tints used.
- Typography implemented:
  - **Fraunces** (editorial/pull quotes), **Urbanist** (display), **Lexend** (body).
- Design guidelines produced and applied: `/app/design_guidelines.md`.
- Stock imagery used as placeholders (user-approved), replaceable via the CMS Media Library.

#### Backend (complete CMS APIs) ✅
- Expanded to full set of collections + endpoints:
  - `users`, `pages`, `sections`, `career_entries`, `testimonials`, `projects`, `services`, `thoughts`, `impact_items`, `navigation_items`, `global_settings`, `inquiries`, `newsletter_subscribers`, `content_versions`, `media_items`.
- Admin features:
  - CRUD across all collections
  - Draft/publish/archive + visibility
  - Reorder endpoint
  - Version history + rollback for sections
  - Inquiries inbox + status updates
  - Newsletter subscriber list
  - Navigation endpoint (auto-derived; optional manual override)
  - Global settings endpoint
- Public endpoints enforce RLS-equivalent rules:
  - Only published+visible content
  - Testimonials require verified+published

#### Frontend public site (all “rooms”) ✅
- Dynamic room assembly from `GET /api/public/page/home` + supplementary collection fetches.
- Room renderer + components:
  - `hero, introduction, values, founder_story, resume, services, projects, testimonials, thoughts, impact, personal, gallery, contact`.
  - `CustomRoom` fallback for unknown types.
- Motion/transition system:
  - CMS `transition_style` mapped to Framer Motion variants.
  - Reduced-motion fallback implemented.
  - Lenis integration retained as an API-compatible no-op (`lenisSingleton.js`), with **native smooth scrolling** for reliability.
- Extra public pages:
  - `/projects/:slug` (ProjectDetail)
  - `/thoughts/:slug` (ArticleReader)
- Contact + newsletter:
  - Contact form → `POST /api/public/inquiries`
  - Newsletter opt-in → `POST /api/public/newsletter`

#### Frontend admin CMS ✅
- `/admin/login` JWT login + protected routes.
- Admin layout + dashboard.
- Sections list:
  - reorder controls
  - publish/unpublish toggle
  - visibility toggle
  - create new section
- Section editor:
  - schema-driven DynamicForm per section type
  - settings tab (theme/transition/nav label)
  - history tab (version snapshots + rollback)
- Media library:
  - upload/list/delete using object storage
- Generic CRUD pages:
  - Career entries, Testimonials, Projects, Services, Thoughts, Media & Impact
- Inquiries inbox.
- Global settings editor.
- Logout.

#### Seeded real content ✅
- Resume-derived: 8 career entries with achievements.
- Founder story: Date Jar narrative chapters.
- Projects:
  - Date Jar (Live)
  - KeyTech Solutions (Live)
- Thoughts: 3 authored thought-leadership articles published.
- Testimonials: seeded as **draft + unverified placeholders** (by design; will not render publicly until replaced + verified).
- Contact: real email/phone/location + Calendly scheduling URL.

---

### Phase 3 — Testing + hardening + navigation/thoughts/connect feature completion ✅ COMPLETE

#### Critical regressions prevented / fixes verified ✅
- Fixed and verified a **React rules-of-hooks** compile regression (`TestimonialsRoom.js` early return before a hook) that previously broke the entire frontend.
- Fixed and audited **Unicode escape sequences** that were rendering literally in JSX in a few places.
- Ensured **content hygiene** by removing stray test data created during prior test runs.

#### ArticleReader enhancements ✅
- `/thoughts/:slug` reader verified:
  - Share block (LinkedIn, X/Twitter, Copy Link)
  - Related articles section
  - Scroll-to-top on slug change

#### Minimal floating SiteNav ✅
Implemented and verified a navigation system that is entirely CMS-derived:
- **Desktop:** vertical chapter index edge rail (left) + **progress line** filling 0–100% based on scroll.
- **Active section indicator** uses multiple signals beyond color:
  - marker dot scale + ring
  - label position shift
  - font-weight change
  - animated underline
- **Theme adaptation:** nav colors automatically switch light↔dark based on the currently-visible room theme, read from RoomWrapper attributes (`data-theme-dark`).
- **Keyboard:** roving navigation support (ArrowUp/Down/Home/End) and native anchor semantics.
- **Deep links:** clicking updates URL hash; home page supports hash scrolling on load.
- **Persistent actions:** View Work + conditional actions from Global Settings:
  - Download Résumé (only if `resume_pdf_url` set)
  - Connect on LinkedIn (if `social_linkedin` set)
  - Schedule a Conversation (if `scheduling_url` set)
- **Mobile:** accessible drawer (Sheet) with visible close control, large tap targets, logical focus, and Escape-to-close.

Key implementation notes:
- `RoomWrapper.js` emits `data-theme` and `data-theme-dark` attributes.
- `Home.js` passes `sections` + `settings` into SiteNav, and supports initial hash scroll.

#### ThoughtsRoom immersive accordion + media + pagination ✅
- Featured article stays as a showcase card.
- Remaining articles render as an **Accordion**, expanding inline per article.
- Expansion supports:
  - image (`featured_image`)
  - or video (`video_url`) via `resolveVideoEmbed()` supporting YouTube/Vimeo/direct file
- Category filter preserved; changing category resets pagination.
- Pagination: appears once non-featured filtered article count exceeds 5 (PAGE_SIZE=5).

Backend/schema updates to support media:
- Backend `ThoughtCreate` model: added optional `video_url`.
- Admin thought CRUD schema (`collectionSchemas.js`) updated to allow editing `video_url`.

#### Persistent “Let’s Connect” + unified Contact System ✅
Implemented a shared contact/inquiry experience with strict consent and recordkeeping.

**Backend updates (models.py, server.py) ✅**
- `InquiryCreate` fully rewritten to support:
  - Core fields: name, email, phone, reason, message
  - Conditional fields: project_type/stage, pick_brain_topic, speaking_* fields, use_app_project_id, partnership_type
  - Consent fields: contact_consent + text + version, marketing_consent + text
  - Source tracking: source_page, source_section, source_channel, related_project_id, submission_id
  - Spam field: `hp` honeypot
- `GlobalSettingsUpdate` extended with:
  - connect dialog heading/copy
  - contact consent text + supporting text + version
  - marketing consent text
  - newsletter_enabled
  - privacy_policy_url
- Startup backfill: new global settings keys are added without overwriting existing values.
- `POST /api/public/inquiries` rewritten:
  - Honeypot: silent fake-success when `hp` filled (not persisted)
  - Rate limiting: in-memory IP limiter (5 requests / 15 minutes → 429)
  - Consent re-validation server-side: rejects without consent with **exact required error**
  - Sanitization: strips control characters; caps message at 1500
  - Dedupe guard: identical email+message within 2 minutes returns prior id (no duplicate row)
  - Consent recordkeeping persisted: contact_consent_at, marketing_consent_at, and version defaulting to `contact-consent-v1`

**Frontend implementation ✅**
- Shared single-source config: `/app/frontend/src/lib/connectOptions.js` (exact reason labels + conditional option lists + consent defaults + contextual success next steps).
- `ConnectForm` component (shared): `/app/frontend/src/components/connect/ConnectForm.js`
  - Exact field order per spec; conditional fields per reason
  - Message length counter + max 1500
  - Preferred contact method hides phone/text options unless phone present
  - Required consent checkbox (unchecked by default) with programmatic error association + screen-reader alert
  - Optional marketing checkbox only if newsletter enabled
  - Submit disabled until required fields valid + consent checked
  - Success state copy per spec + contextual next steps by reason
  - Failure state preserves data and shows generic error banner
  - `idPrefix` support to avoid duplicate DOM ids when embedded twice (Contact room + dialog)
- Responsive dialog shell: `/app/frontend/src/components/connect/ConnectDialog.js`
  - Variants: fullscreen (<400px), bottom sheet (<768px), modal (<1536px), drawer (>=1536px)
  - Focus trap + Escape-to-close + background scroll lock via Radix Dialog
  - Discard-warning confirmation via AlertDialog when dirty
  - Returns focus to trigger on close
- Persistent button: `/app/frontend/src/components/connect/FloatingConnectButton.js`
  - Visible across public routes; hidden on `/admin/*` and while dialog open
  - Safe-area aware offsets; 44px+ target; no pulsing/bouncing
  - Auto theme contrast by sampling nearest `[data-theme-dark]` under button via `elementFromPoint`
  - Project-page prefill support: detects `/projects/:slug` and passes project id into dialog for “Use your app(s)”
- Contact room refactor: `ContactRoom.js` now embeds the same ConnectForm (one inquiries system; no duplicate tables/records).
- Privacy policy: new page `/privacy` (`PrivacyPolicy.js`), linked near consent.
- Admin settings: `AdminSettings.js` extended with a “Let’s Connect & Privacy” section (editable dialog + consent copy, newsletter toggle, privacy URL) and guidance to bump consent version when wording changes.
- App integration: `App.js` mounts `FloatingConnectButton` globally for public routes and adds `/privacy` route.

**Bug fix round (Connect system) ✅**
- **Issue discovered (testing_agent iteration_4):** 3 CRITICAL frontend bugs:
  1) Discard confirmation dialog buttons not clickable
  2) Conditional fields not appearing when selecting a reason
  3) Submit button never enabling
- **Root cause:** a single z-index stacking conflict:
  - custom `ConnectDialog` overlay/content (`z-[65]` / `z-[70]`) sat above nested Radix Select dropdown (`z-50`) and shared AlertDialog (`z-50`), making click targets unreachable.
- **Fix applied:**
  - Added `!z-[80]` to all `SelectContent` instances inside `ConnectForm.js`
  - Raised `alert-dialog.jsx` default z-index from `z-50` to `z-[100]` (confirmation dialogs should outrank regular dialogs app-wide)
- **Re-verification:** confirmed fixed using real (non-forced) Playwright clicks.

#### Testing performed ✅
- Initial comprehensive test suite: prior iterations achieved 100% pass.
- **Connect bug-fix re-test:** `testing_agent_v3` iteration_5 re-ran the full suite:
  - 100% pass across backend inquiry validations, frontend connect dialog critical fixes, mobile dialog variants (bottom sheet + full-screen), full site regression, and admin CMS.
  - No remaining action items.
- Data hygiene: all test inquiries removed; backend restarted to clear in-memory limiter state.

**Phase 3 exit criteria:** ✅ Fully met (including mobile dialog variants + critical bug-fix round).

---

### Phase 4 — Polish pass ⏳ OPTIONAL / NEXT
> Not required for functional completion; remaining items are launch content-ops and optional aesthetic refinements.

- Launch content operations (recommended):
  - Replace stock imagery with Bretton’s real photos via Admin → Media Library.
  - Replace testimonial placeholders with real quotes and set `verified=true` + `status=published` (to make the Testimonials room appear publicly).
  - Optional: set `resume_pdf_url` in Global Settings to enable the persistent “Download Résumé” nav action.
- Visual refinement per `/app/design_guidelines.md`:
  - tighten room rhythm, spacing, type scale
  - ensure blue highlight used only for short phrases
  - ensure photography masking remains subtle and consistent
- Performance/accessibility:
  - lazy-loading checks, focus states, keyboard navigation, aria labels
  - ensure Connect dialog variants remain consistent across breakpoints
- SEO:
  - confirm global settings defaults applied (title/description/og)
- Optional motion polish:
  - refine Founder Story GSAP behavior if desired (ensure reduced-motion fallback remains stable)
  - consider reintroducing subtle inertia only if it does not break deep links/testing (current native scrolling is reliable)

---

## 3. Next Actions
1. **Launch content operations (P0, non-dev)**
   - Upload real imagery via Admin → Media Library and swap image URLs in sections/projects.
   - Add real testimonials; mark them `verified=true` and `status=published`.
   - Upload résumé PDF and set `resume_pdf_url` in Global Settings to enable the nav quick action.
2. **Optional polish (P1)**
   - Minor typography/spacing refinements and motion tuning per guidelines.
   - Final SEO/OG review in Global Settings.
   - If spam observed, add Turnstile/CAPTCHA behind a feature flag.

---

## 4. Success Criteria
✅ **Met (V1 + verified):**
- POC proven: JWT auth, media upload round-trip, draft→publish→public render, testimonial verified gate, version snapshot + rollback.
- V1 site renders **only** CMS-published content; no primary content hardcoded in React.
- Admin can manage all key collections, reorder rooms, publish, and roll back.
- Public experience meets motion/visual constraints, supports navigation/deep links.
- **Minimal floating navigation** is CMS-derived, supports keyboard + anchors, shows active section with multi-signal indicators, adapts light/dark automatically, and collapses to an accessible mobile drawer.
- **ThoughtsRoom** provides expandable per-article previews, supports image/video URLs, and paginates beyond 5.
- ArticleReader includes share tools + related-articles module.
- **Persistent “Let’s Connect” system**:
  - Floating connect button persists across public routes and is hidden on admin/auth routes.
  - Responsive dialog variants implemented with focus trapping, Escape close, discard-warning, and focus return.
  - Shared ConnectForm used by both floating dialog and ContactRoom; no duplicated inquiry storage.
  - Consent is required and re-validated server-side; consent wording/version/timestamps are recorded per submission.
  - Spam protection via honeypot + rate limiting + dedupe guard.
  - Privacy Policy page exists and is linked near consent.
- Content hygiene maintained (no stray test data in public collections).
- **Bug fix round completed:** z-index stacking conflict resolved; re-tested with `testing_agent_v3` iteration_5 at 100% pass rate.

⏳ **Remaining (optional / launch ops):**
- Replace placeholder imagery with real assets.
- Add verified testimonials to make the Testimonials room appear publicly.
- (Optional) Add resume PDF URL to enable “Download Résumé” persistent action.
