# plan.md

## 1. Objectives
- Deliver a cinematic “gallery rooms” personal site for Bretton J. Key where **all** content (copy/media/order/visibility/transitions) is CMS-driven from MongoDB.
- Provide a custom CMS on FastAPI + MongoDB that replicates Supabase-like capabilities: **JWT admin auth**, **draft/publish/archived**, **RLS-equivalent gating** (public reads published+visible only; testimonials require verified), **Object Storage media library**, and **publish-time version snapshots + rollback**.
- Ensure public experience is editorial/cinematic (not a template), using the exact design tokens + typography system, with accessible motion and reduced-motion fallback.
- Ensure admin can manage everything without code changes: sections/rooms, global settings, projects/services/thoughts/resume entries/testimonials, media uploads, inquiries, newsletter subscribers.

**Current status:** V1 objectives are achieved. Site + CMS are functional and rendering correctly with seeded real content. Remaining work is **final comprehensive UI verification** (admin flows + reduced-motion + mobile) and **launch content ops** (replace stock imagery, add verified testimonials).

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

### Phase 3 — Comprehensive testing + hardening ⏳ IN PROGRESS

#### Testing performed ✅
- testing_agent_v3 executed (two iterations).
- Backend automated coverage: **100% (43/43 tests passed)**.
- Frontend end-to-end coverage previously validated:
  - room rendering and navigation
  - skip-intro and CTA scrolling
  - mobile nav drawer
  - project/article detail navigation
  - contact form → inquiries admin flow
  - admin login/logout/route protection
  - testimonials verified-gate behavior

#### Critical bugs found and fixed ✅
1. **React rules-of-hooks compile failure** (entire app failed to compile/render):
   - Cause: `TestimonialsRoom.js` had an early `return null` **before** a `useEffect` hook.
   - Fix: moved the early return **after all hooks are declared**.
2. **Unicode escape sequences rendered literally in JSX text nodes** (`\u00b7`, `\u2026`):
   - Fix: wrapped affected text in JS string/template literals.
   - Fixed occurrences:
     - `ThoughtsRoom.js` featured label
     - `AdminSectionEditor.js` loading text
   - Audited all other `\u` occurrences in `frontend/src` and confirmed remaining usages are safe.
3. **Content hygiene**: removed stray test data leaked from prior CRUD tests:
   - Deleted: 2 duplicate “Test Article” thoughts, 2 “Test Service” services, 2 “Test Impact Item” impact items.

#### Additional product completion ✅
- **ArticleReader upgraded** to match “Thoughts & Field Notes” requirements:
  - Share block (LinkedIn, X/Twitter, Copy Link w/ clipboard API + Sonner toast feedback)
  - Related articles section (prioritizes same-category, max 3)
  - Scroll-to-top on slug change

#### Verification performed (manual/screenshot) ✅
- Confirmed via screenshot pass that all rooms render correctly with seeded content:
  - Hero, Introduction, Values, Founder Story, Resume, Services, Projects, Thoughts, Impact, Personal, Gallery, Contact.
- **TestimonialsRoom intentionally hidden** until real verified testimonials exist (RLS-equivalent gate + seeded draft/unverified placeholders).

#### Not yet independently re-verified end-to-end in UI ⏳
These flows are built and API-tested, but should be click-tested once more after the recent fixes:
- Admin Section Editor: publish toggle, reorder persistence, version rollback UI interactions.
- Admin Media Library: upload/copy-url/delete interactions.
- Admin CRUD pages: reorder + persistence confirmation for all collections.
- Admin Settings: edit + persist confirmation.
- Reduced-motion emulation (prefers-reduced-motion) end-to-end.
- ArticleReader share actions + related navigation.

**Phase 3 exit criteria (updated):**
- Run one comprehensive testing_agent pass covering:
  - Public site: navigation, rooms, project detail, thoughts reader, contact + newsletter
  - Admin: login, sections CRUD, publish/visibility, reorder, version rollback
  - Media library: upload/list/copy/delete
  - Reduced-motion + mobile responsiveness

---

### Phase 4 — Polish pass ⏳ OPTIONAL / NEXT
- Visual refinement per `/app/design_guidelines.md`:
  - tighten room rhythm, spacing, type scale
  - ensure blue highlight used only for short phrases
  - ensure photography masking remains subtle and consistent
- Performance/accessibility:
  - lazy-loading checks, focus states, keyboard navigation, aria labels
- SEO:
  - confirm global settings defaults applied (title/description/og)
- Optional motion polish:
  - refine Founder Story GSAP behavior if desired (ensure reduced-motion fallback remains stable)
  - consider reintroducing subtle Lenis-style inertia only if it does not break deep links/testing (current native scrolling is reliable)

---

## 3. Next Actions
1. **Run testing_agent (P0)**
   - Full E2E pass (public + admin) using the updated UI (ArticleReader share/related) and recent compile fixes.
2. **Launch content operations (P0)**
   - Replace stock imagery with Bretton’s real photos via Admin → Media Library.
   - Replace testimonial placeholders with real quotes and set `verified=true` + `status=published`.
3. **Optional polish (P1)**
   - Fine-tune room transitions and Founder Story effect per guidelines.
   - Add minor editorial enhancements (e.g., reading time consistency, OG meta verification).

---

## 4. Success Criteria
✅ **Met (V1):**
- POC proven: JWT auth, media upload round-trip, draft→publish→public render, testimonial verified gate, version snapshot + rollback.
- V1 site renders **only** CMS-published content; no primary content hardcoded in React.
- Admin can manage all key collections, reorder rooms, publish, and roll back.
- Public experience meets motion/visual constraints, supports navigation/deep links, and has a working contact form + newsletter subscription.
- ArticleReader includes share tools + related-articles module.
- Content hygiene maintained (no stray test data in public collections).

⏳ **Remaining (verification/polish):**
- Final comprehensive UI click-test (admin flows + media + reduced-motion + mobile) via testing_agent.
- Replace placeholders (images/testimonials) with real assets for final launch.
