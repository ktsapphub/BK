# plan.md

## 1. Objectives
- Deliver a cinematic “gallery rooms” personal site for Bretton J. Key where **all** content (copy/media/order/visibility/transitions) is CMS-driven from MongoDB.
- Build a custom CMS on FastAPI+Mongo that replicates Supabase-like capabilities: **JWT admin auth**, **draft/publish/archived**, **RLS-equivalent gating** (public reads published+visible only), **Object Storage media library**, and **publish-time version snapshots + rollback**.
- Prove the **core dynamic section architecture** end-to-end (draft → publish → render) + media upload round-trip **before** building all section types and full UI.

## 2. Implementation Steps

### Phase 0 — Integration playbook + best-practice quick research
- Get Object Storage integration playbook for: signed upload, public/private access, deletion, caching, file naming, size/type limits.
- Web-search best practices for: CMS draft/publish modeling in Mongo, content versioning strategy (append-only snapshots), and safe media handling.

### Phase 1 — Core POC (isolation) 
**Goal:** prove the backbone works with real data flow and no hardcoded content.

**Backend (minimal, POC scope)**
- Define Mongo models/collections (minimum): `users`, `pages`, `sections`, `career_entries`, `testimonials`, `media_items`, `content_versions`.
- Implement JWT admin auth:
  - Seed admin user: `brettonjkey@icloud.com` (bcrypt-hashed `#Test1234`).
  - Endpoints: `POST /api/admin/login`, JWT middleware, role check.
- Implement CMS core endpoints (admin):
  - CRUD for pages/sections and `career_entries`.
  - Section publish/unpublish: set `status`, `published_at`, enforce `display_order`.
  - Versioning on publish: write snapshot into `content_versions` + rollback endpoint.
- Implement public read endpoints (RLS-equivalent):
  - `GET /api/public/page/{slug}` returns **only** `sections` where `status=published` and `is_visible=true`, ordered.
  - `GET /api/public/testimonials` returns **only** `verified=true` and published.
- Implement Object Storage media endpoints (admin): upload, list, delete; store metadata in `media_items`.

**Frontend (minimal POC UI)**
- Minimal public page renderer:
  - Dynamic mapping for **3 section types only**: `hero`, `resume`, `testimonials`.
  - Unknown `section_type` → graceful “not supported” empty-state (non-breaking).
  - Uses design tokens CSS variables + reduced-motion fallback.
- Minimal admin UI:
  - Login page.
  - Section list (draft/published), edit JSON fields for those 3 section types, publish toggle.
  - Media upload/select (single picker) and attach media to hero bg.

**POC test script (must pass before Phase 2)**
- Write `scripts/poc_core_flow_test.py` to:
  1) login as admin, obtain JWT
  2) upload an image to object storage → confirm retrievable URL
  3) create page `home`
  4) create `hero` section (draft) referencing uploaded media → publish
  5) create resume data (`career_entries`) + `resume` section → publish
  6) create testimonial placeholders with `verified=false` → publish (ensure they **do not** appear publicly)
  7) call public endpoint and assert returned sections are published+visible and ordered
  8) publish again and verify `content_versions` created; rollback and verify public output changes

**Exit criteria (hard gate)**
- POC script passes reliably; public API never leaks drafts/unverified testimonials; media upload works.

**Phase 1 user stories**
1. As an admin, I can log in and receive a JWT to manage site content.
2. As an admin, I can upload an image and reuse it in a hero section.
3. As an admin, I can draft then publish a hero/resume section and see it appear publicly.
4. As a visitor, I only ever see published+visible sections in the intended order.
5. As an admin, I can roll back a published section to a prior version.

### Phase 2 — V1 App development (full build around proven core)

**Design + content system setup**
- Implement global CSS variables exactly as provided; set typography (Fraunces/Urbanist/Lexend).
- Run design_agent pass for cinematic layout, section rhythm, nav behavior, and motion patterns.
- Use stock imagery (placeholders) via media library; ensure everything remains CMS-replaceable.

**Backend (complete CMS APIs)**
- Expand collections + endpoints to full set:
  - `projects`, `services`, `thoughts`, `navigation_items`, `global_settings`, `inquiries`.
- Implement full section-type schemas in backend validation layer (light validation; allow flexible JSON but validate required keys per type).
- Implement admin features:
  - Reorder sections (`display_order`) and visibility toggles.
  - Live preview token/endpoint to render drafts for admin only.
  - Inquiries inbox endpoints + status (new/handled).
  - Navigation sync: default nav derived from visible published sections; optional manual override via `navigation_items`.

**Frontend public site (all “rooms”)**
- Full section renderer for types: `hero,introduction,values,thoughts,resume,services,projects,founder_story,testimonials,media,impact,personal,gallery,contact,custom`.
- Motion system:
  - Per-section `transition_style` mapped to GSAP/Framer presets.
  - Lenis smooth scroll; deep links; back/forward; scroll restoration; “skip intro”.
  - Reduced-motion mode: replace transitions with minimal fades.
- Contact flow: real form → `POST /api/public/inquiries` → confirmation.
- Testimonials gate: only `verified=true` render.

**Frontend admin CMS (MVP but complete)**
- Admin dashboard with:
  - Pages + sections editor (dynamic forms per section type), publish workflow, reorder controls.
  - Media library (upload/select/delete, metadata, reuse).
  - CRUD screens for projects/services/career entries/thoughts/testimonials.
  - Version history viewer + rollback.
  - Inquiries inbox.
  - Global settings editor.

**Seed real content into CMS (published unless noted)**
- From resume: professional summary, full career entries, education, certifications, skills, clearance.
- From old site: intro/personal/values/founder_story/source-of-purpose, ventures list.
- Projects: Date Jar (live links), KeyTech Solutions (consulting), “Creating Apps” (draft).
- Thoughts: author 2–3 real PM/leadership articles (publish).
- Testimonials: create placeholders but keep `verified=false` and/or `status=draft`.
- Contact: real email/phone/location (city-level only), Calendly link.

**Phase 2 user stories**
1. As a visitor, I can move through cinematic “rooms” with smooth, non-jarring transitions and a skip-intro option.
2. As a visitor, I can deep-link to a section and use browser back/forward without losing my place.
3. As a visitor, I can view Bretton’s résumé timeline and achievements in an interactive, readable format.
4. As a visitor, I can submit the contact form and receive a confirmation while the inquiry is saved.
5. As an admin, I can build/reorder/publish sections and preview drafts before publishing.

- Conclude Phase 2 with 1 full testing_agent_v3 end-to-end pass; fix P0/P1 issues.

### Phase 3 — Comprehensive testing + hardening
- Expand automated/manual coverage:
  - Draft vs published visibility, testimonial verified-gate, media upload/delete, version rollback.
  - Reduced-motion, responsive breakpoints, accessibility focus/keyboard, performance (lazy-load, pause off-screen anim).
  - Unknown/empty content graceful degradation.

**Phase 3 user stories**
1. As a visitor with reduced-motion enabled, I get a stable experience with minimal transitions.
2. As an admin, I can delete media and the layout degrades without breaking sections.
3. As an admin, I can unpublish a section and it disappears from nav and public output.
4. As a visitor, I never see draft content or unverified testimonials.
5. As an admin, I can restore a prior published version after an editing mistake.

- Conclude Phase 3 with testing_agent_v3 pass; fix all found issues.

### Phase 4 — Polish pass
- Visual refinement per design_agent (cinematic rhythm, typography balance, spacing, imagery masking).
- SEO defaults (global settings), metadata, OG images (from media library), final performance cleanup.

**Phase 4 user stories**
1. As a visitor, the site feels premium/editorial and consistent across all sections.
2. As a visitor, images/videos load quickly without blocking reading.
3. As a visitor, navigation labels match section content and never show hidden rooms.
4. As an admin, I can update any copy/media without code changes.
5. As an admin, I can manage site-wide links (social/footer/SEO defaults) in one place.

## 3. Next Actions
1. Run Phase 0: object storage playbook + quick best-practice research.
2. Implement Phase 1 backend minimal endpoints + object storage upload.
3. Implement Phase 1 minimal public renderer + admin UI.
4. Write and run `scripts/poc_core_flow_test.py`; iterate until green.

## 4. Success Criteria
- POC script passes and proves: JWT auth, media upload round-trip, draft→publish→public render, testimonial verified gate, version snapshot + rollback.
- V1 site renders **only** CMS-published content; no primary content hardcoded in React.
- Admin can manage all collections, reorder rooms, preview drafts, publish, and roll back.
- Public experience meets motion/visual constraints, supports reduced motion, deep links, and working contact form.