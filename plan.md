# plan.md

## 1. Objectives
- Deliver a cinematic “gallery rooms” personal site for Bretton J. Key where **all** content (copy/media/order/visibility/transitions) is CMS-driven from MongoDB.
- Provide a custom CMS on FastAPI + MongoDB that replicates Supabase-like capabilities: **JWT admin auth**, **draft/publish/archived**, **RLS-equivalent gating** (public reads published+visible only; testimonials require verified), **Object Storage media library**, and **publish-time version snapshots + rollback**.
- Ensure public experience is editorial/cinematic (not a template), using the exact design tokens + typography system, with accessible motion and reduced-motion fallback.
- Ensure admin can manage everything without code changes: sections/rooms, global settings, projects/services/thoughts/resume entries/testimonials, media uploads, inquiries.

**Current status:** Objectives above are achieved in V1. Remaining work is validation/spot-checks + content/asset replacement + optional polish.

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
- design_agent guidelines produced and applied: `/app/design_guidelines.md`.
- Stock imagery used as placeholders (user-approved), replaceable via CMS Media Library.

#### Backend (complete CMS APIs) ✅
- Expanded to full set of collections + endpoints:
  - `users`, `pages`, `sections`, `career_entries`, `testimonials`, `projects`, `services`, `thoughts`, `impact_items`, `navigation_items`, `global_settings`, `inquiries`, `content_versions`, `media_items`.
- Admin features:
  - CRUD across all collections
  - Draft/publish/archive + visibility
  - Reorder endpoint
  - Version history + rollback for sections
  - Inquiries inbox + status updates
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
  - **Lenis removed** to preserve deep links / scroll restoration / programmatic navigation reliability; native `scrollIntoView` + `scroll-behavior:smooth` used.
- Extra public pages:
  - `/projects/:slug` (ProjectDetail)
  - `/thoughts/:slug` (ArticleReader)
- Contact flow:
  - Real form → `POST /api/public/inquiries` → success feedback.

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
- Old site-derived: personal/values/founder story elements, ventures.
- Projects:
  - Date Jar (live)
  - KeyTech Solutions (consulting)
- Thoughts: 3 authored thought-leadership articles published.
- Testimonials: seeded as **draft + unverified placeholders** (by design; do not render publicly until user supplies real quotes and sets verified).
- Contact: real email/phone/location + Calendly scheduling URL.

---

### Phase 3 — Comprehensive testing + hardening ✅ PARTIALLY COMPLETE

#### Testing performed ✅
- testing_agent_v3 executed (two iterations).
- Backend automated coverage: **100% (43/43 tests passed)**.
- Frontend end-to-end coverage validated:
  - room rendering and navigation
  - skip-intro and CTA scrolling
  - mobile nav drawer
  - project/article detail navigation
  - contact form → inquiries admin flow
  - admin login/logout/route protection
  - testimonials verified-gate behavior

#### Bugs found and fixed ✅
1. **Rooms invisible due to Framer Motion whileInView not firing** → RoomWrapper now animates on mount (`animate="show"`).
2. **Lenis breaking programmatic scroll / nav clicks / skip intro** → Lenis removed; native smooth scrolling used.
3. **Dialog/Sheet close buttons not closing (blocking site after modal open)** → added explicit close buttons:
   - `service-sheet-close-button`
   - `gallery-lightbox-close-button`

All three fixes were verified by testing_agent.

#### Not yet independently re-verified end-to-end in UI (lower risk; backend already verified) ⏳
These flows are built and API-tested, but not fully click-tested in the second iteration due to time constraints:
- Admin Section Editor: publish toggle, reorder persistence, version rollback UI interactions.
- Admin Media Library: upload/copy-url/delete interactions.
- Admin CRUD pages: reorder + persistence confirmation for all collections.
- Admin Settings: edit + persist confirmation.
- Reduced-motion emulation (prefers-reduced-motion) end-to-end.

**Phase 3 exit criteria (updated):**
- Run one more short testing pass (or manual QA checklist) to confirm the UI-level items above.

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
- Optional: refine Founder Story GSAP pin behavior if desired (ensure reduced-motion fallback remains stable).

---

## 3. Next Actions
1. **Quick QA/verification pass (recommended):**
   - Admin Section Editor: publish/unpublish + version rollback
   - Media library: upload/copy/delete
   - Global settings: save + persist
   - Reduced-motion emulation
2. **Content operations for launch:**
   - Replace stock imagery with Bretton’s real photos via Admin → Media Library.
   - Replace testimonial placeholders with real quotes and set `verified=true` + `status=published`.
3. **Optional polish:**
   - Fine-tune room transitions and Founder Story pin effect per guidelines.

---

## 4. Success Criteria
✅ **Met (V1):**
- POC proven: JWT auth, media upload round-trip, draft→publish→public render, testimonial verified gate, version snapshot + rollback.
- V1 site renders **only** CMS-published content; no primary content hardcoded in React.
- Admin can manage all key collections, reorder rooms, publish, and roll back.
- Public experience meets motion/visual constraints, supports navigation/deep links, and has a working contact form.

⏳ **Remaining (verification/polish):**
- UI-level spot-check of remaining admin flows + reduced-motion emulation.
- Replace placeholders (images/testimonials) with real assets for final launch.
