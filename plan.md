# plan.md

## 1. Objectives
- Deliver a cinematic “gallery rooms” personal site for Bretton J. Key where **all** content (copy/media/order/visibility/transitions) is CMS-driven from MongoDB.
- Provide a custom CMS on FastAPI + MongoDB that replicates Supabase-like capabilities: **JWT admin auth**, **draft/publish/archived**, **RLS-equivalent gating** (public reads published+visible only; testimonials require verified), **Object Storage media library**, and **publish-time version snapshots + rollback**.
- Ensure public experience is editorial/cinematic (not a template), using the exact design tokens + typography system, with accessible motion and reduced-motion fallback.
- Ensure admin can manage everything without code changes: sections/rooms, global settings, projects/services/thoughts/resume entries/testimonials, media uploads, inquiries, newsletter subscribers.

**Current status:** ✅ V1 objectives achieved **and fully end-to-end verified**. Public site, admin CMS, and all APIs are functioning with seeded real content. Phase 3 comprehensive testing is complete with a 100% pass rate and zero issues found. Remaining work is **launch content operations** (real imagery + real verified testimonials) and optional Phase 4 polish.

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

### Phase 3 — Comprehensive testing + hardening ✅ COMPLETE

#### Testing performed ✅
- testing_agent_v3 executed a comprehensive E2E pass (see `/app/test_reports/iteration_2.json`).
- **Backend:** 100% pass rate (17/17 endpoint tests).
- **Frontend public:** 100% pass rate (all rooms render, all core interactions work, zero console errors).
- **Frontend admin:** 100% pass rate (login, dashboard, sections, CRUD pages, media library, settings, inquiries).

#### Critical regressions prevented / fixes verified ✅
- Confirmed that the prior **React rules-of-hooks** regression in `TestimonialsRoom.js` is fully resolved (site compiles cleanly; no red overlay).
- Confirmed Unicode escape rendering issues do not appear in UI.

#### Feature verification ✅
- ArticleReader enhancements verified:
  - Share block (LinkedIn, X/Twitter, Copy Link)
  - Related articles section
  - Scroll-to-top on article navigation

**Phase 3 exit criteria:** ✅ Met (comprehensive automated + UI verification complete with zero issues).

---

### Phase 4 — Polish pass ⏳ OPTIONAL / NEXT
> Not required for functional completion; remaining items are launch content-ops and optional aesthetic refinements.

- Launch content operations (recommended):
  - Replace stock imagery with Bretton’s real photos via Admin → Media Library.
  - Replace testimonial placeholders with real quotes and set `verified=true` + `status=published` (to make the Testimonials room appear publicly).
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
  - consider reintroducing subtle inertia only if it does not break deep links/testing (current native scrolling is reliable)

---

## 3. Next Actions
1. **Launch content operations (P0, non-dev)**
   - Upload real imagery via Admin → Media Library and swap image URLs in sections/projects.
   - Add real testimonials; mark them `verified=true` and `status=published`.
2. **Optional polish (P1, dev or design)**
   - Minor typography/spacing refinements and motion tuning per guidelines.
   - Final SEO/OG review in Global Settings.

---

## 4. Success Criteria
✅ **Met (V1 + verified):**
- POC proven: JWT auth, media upload round-trip, draft→publish→public render, testimonial verified gate, version snapshot + rollback.
- V1 site renders **only** CMS-published content; no primary content hardcoded in React.
- Admin can manage all key collections, reorder rooms, publish, and roll back.
- Public experience meets motion/visual constraints, supports navigation/deep links, and has a working contact form + newsletter subscription.
- ArticleReader includes share tools + related-articles module.
- Content hygiene maintained (no stray test data in public collections).
- Comprehensive E2E pass completed with **100% success** and **zero open issues**.

⏳ **Remaining (optional / launch ops):**
- Replace placeholder imagery with real assets.
- Add verified testimonials to make the Testimonials room appear publicly.
