"""
POC Core Flow Test for Bretton J Key CMS site.
Proves: JWT auth, object storage upload/retrieve, page/section CRUD,
draft->publish workflow, public RLS-equivalent gating, testimonial
verified-gate, content versioning + rollback.
"""
import requests
import sys
import time

BASE_URL = "http://localhost:8001/api"
ADMIN_EMAIL = "brettonjkey@icloud.com"
ADMIN_PASSWORD = "#Test1234"

results = []


def check(name, condition, extra=""):
    status = "PASS" if condition else "FAIL"
    results.append((name, status, extra))
    print(f"[{status}] {name} {extra}")
    if not condition:
        raise AssertionError(f"FAILED: {name} {extra}")


def run():
    # 1. Login
    r = requests.post(f"{BASE_URL}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    check("Admin login", r.status_code == 200, r.text)
    token = r.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1b. Wrong password should fail
    r = requests.post(f"{BASE_URL}/admin/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
    check("Admin login rejects wrong password", r.status_code == 401)

    # 1c. /me works
    r = requests.get(f"{BASE_URL}/admin/me", headers=headers)
    check("Admin /me with token", r.status_code == 200 and r.json()["email"] == ADMIN_EMAIL)

    # 1d. No token rejected
    r = requests.get(f"{BASE_URL}/admin/me")
    check("Admin /me without token rejected", r.status_code == 401)

    # 2. Upload media (small png bytes)
    png_bytes = bytes.fromhex(
        "89504e470d0a1a0a0000000d494844520000000100000001080600000"
        "01f15c4890000000a49444154789c6360000002000100ffff03000006"
        "00057768321a0000000049454e44ae426082"
    )
    files = {"file": ("test.png", png_bytes, "image/png")}
    r = requests.post(f"{BASE_URL}/admin/media/upload", headers=headers, files=files)
    check("Media upload", r.status_code == 200, r.text)
    media = r.json()
    media_id = media["id"]
    check("Media has url", "url" in media)

    # 2b. Retrieve uploaded media publicly (no auth)
    r = requests.get(f"{BASE_URL}/media/{media_id}")
    check("Public media retrieval works", r.status_code == 200 and r.headers.get("content-type") == "image/png")

    # 2c. List media (admin)
    r = requests.get(f"{BASE_URL}/admin/media", headers=headers)
    check("List media (admin)", r.status_code == 200 and any(m["id"] == media_id for m in r.json()))

    # 3. Create page 'home'
    r = requests.post(f"{BASE_URL}/admin/pages", headers=headers, json={"slug": "home", "title": "Home", "is_published": True})
    check("Create page 'home'", r.status_code == 200, r.text)
    page_id = r.json()["id"]

    # 4. Create hero section as DRAFT, referencing uploaded media
    hero_content = {
        "eyebrow": "Twenty Years in Motion",
        "heading": "Bretton J. Key",
        "rotating_words": ["Delivery Leader", "Product Owner", "Builder"],
        "subheading": "PMP-certified delivery leader turning complex missions into shipped outcomes.",
        "bg_image_url": media["url"],
        "primary_cta": {"label": "See the Work", "href": "#projects"},
        "alignment": "left",
    }
    r = requests.post(f"{BASE_URL}/admin/sections", headers=headers, json={
        "page_id": page_id,
        "section_type": "hero",
        "internal_name": "Home Hero",
        "navigation_label": "Home",
        "display_order": 1,
        "is_visible": True,
        "status": "draft",
        "theme": "deep_royal_blue",
        "transition_style": "mask-reveal",
        "content": hero_content,
    })
    check("Create hero section (draft)", r.status_code == 200, r.text)
    hero_section = r.json()
    hero_id = hero_section["id"]
    check("Hero draft published_at is null", hero_section["published_at"] is None)

    # 4b. Public page should NOT show draft section yet
    r = requests.get(f"{BASE_URL}/public/page/home")
    check("Public page fetch (before publish)", r.status_code == 200)
    check("Draft hero NOT visible publicly before publish", all(s["id"] != hero_id for s in r.json()["sections"]))

    # 4c. Publish hero section
    r = requests.put(f"{BASE_URL}/admin/sections/{hero_id}", headers=headers, json={"status": "published"})
    check("Publish hero section", r.status_code == 200 and r.json()["status"] == "published")
    check("published_at set after publish", r.json()["published_at"] is not None)

    # 4d. Public page SHOULD show hero now
    r = requests.get(f"{BASE_URL}/public/page/home")
    sections = r.json()["sections"]
    check("Published hero IS visible publicly", any(s["id"] == hero_id for s in sections))
    check("Sections ordered by display_order", sections == sorted(sections, key=lambda s: s["display_order"]))

    # 4e. Version snapshot created on publish
    r = requests.get(f"{BASE_URL}/admin/sections/{hero_id}/versions", headers=headers)
    check("Version snapshot exists after publish", r.status_code == 200 and len(r.json()) >= 1)
    first_version_id = r.json()[0]["id"]

    # 5. Career entries + resume section
    r = requests.post(f"{BASE_URL}/admin/career-entries", headers=headers, json={
        "title": "Test Lead Manager / Product Owner",
        "org": "Engineering Services Network",
        "location": "Chesapeake, VA",
        "start_date": "2026-03",
        "end_date": None,
        "is_current": True,
        "description": "Lead test delivery for Naval Maintenance Software.",
        "achievements": ["Drive Agile execution in Jira/Confluence"],
        "skills": ["Agile", "Scrum"],
        "display_order": 1,
        "is_visible": True,
    })
    check("Create career entry", r.status_code == 200, r.text)

    r = requests.post(f"{BASE_URL}/admin/sections", headers=headers, json={
        "page_id": page_id,
        "section_type": "resume",
        "internal_name": "Resume Section",
        "navigation_label": "Resume",
        "display_order": 2,
        "status": "published",
        "theme": "true_white",
        "transition_style": "fade",
        "content": {"heading": "Career Timeline"},
    })
    check("Create + publish resume section", r.status_code == 200 and r.json()["status"] == "published")

    r = requests.get(f"{BASE_URL}/public/career-entries")
    check("Public career entries visible", r.status_code == 200 and len(r.json()) >= 1)

    # 6. Testimonials verified gate
    r = requests.post(f"{BASE_URL}/admin/testimonials", headers=headers, json={
        "name": "Jane Doe",
        "title": "VP Engineering",
        "org": "Example Corp",
        "full_quote": "Bretton delivered beyond expectations.",
        "verified": False,
        "status": "published",
        "display_order": 1,
    })
    check("Create unverified testimonial", r.status_code == 200)
    unverified_id = r.json()["id"]

    r = requests.get(f"{BASE_URL}/public/testimonials")
    check("Unverified testimonial NOT public", all(t["id"] != unverified_id for t in r.json()))

    r = requests.post(f"{BASE_URL}/admin/testimonials", headers=headers, json={
        "name": "John Smith",
        "title": "Director",
        "org": "Acme Inc",
        "full_quote": "Outstanding delivery leadership.",
        "verified": True,
        "status": "published",
        "display_order": 2,
    })
    verified_id = r.json()["id"]
    r = requests.get(f"{BASE_URL}/public/testimonials")
    check("Verified testimonial IS public", any(t["id"] == verified_id for t in r.json()))

    # 7. Unknown section_type graceful handling
    r = requests.post(f"{BASE_URL}/admin/sections", headers=headers, json={
        "page_id": page_id,
        "section_type": "not_a_real_type",
        "internal_name": "Weird Section",
        "display_order": 99,
        "status": "published",
        "content": {"foo": "bar"},
    })
    check("Create section with unknown type (backend accepts, renderer will coerce)", r.status_code == 200)

    r = requests.get(f"{BASE_URL}/public/page/home")
    check("Public page fetch still succeeds with unknown section type present", r.status_code == 200)

    # 8. Rollback test - update hero content then rollback
    r = requests.put(f"{BASE_URL}/admin/sections/{hero_id}", headers=headers, json={
        "content": {**hero_content, "heading": "CHANGED HEADING"},
        "status": "published",
    })
    check("Update hero content", r.status_code == 200 and r.json()["content"]["heading"] == "CHANGED HEADING")

    r = requests.post(f"{BASE_URL}/admin/sections/{hero_id}/rollback/{first_version_id}", headers=headers)
    check("Rollback to first version", r.status_code == 200)
    check("Heading restored after rollback", r.json()["content"]["heading"] == "Bretton J. Key")

    r = requests.get(f"{BASE_URL}/public/page/home")
    restored = [s for s in r.json()["sections"] if s["id"] == hero_id][0]
    check("Public output reflects rollback", restored["content"]["heading"] == "Bretton J. Key")

    # 9. Unpublish and verify disappears from public
    r = requests.put(f"{BASE_URL}/admin/sections/{hero_id}", headers=headers, json={"status": "draft"})
    check("Unpublish hero", r.status_code == 200 and r.json()["status"] == "draft")
    r = requests.get(f"{BASE_URL}/public/page/home")
    check("Unpublished hero no longer public", all(s["id"] != hero_id for s in r.json()["sections"]))


if __name__ == "__main__":
    try:
        run()
        print("\n=== ALL POC CORE TESTS PASSED ===")
        sys.exit(0)
    except AssertionError as e:
        print(f"\n=== POC TEST FAILED: {e} ===")
        sys.exit(1)
    except Exception as e:
        print(f"\n=== UNEXPECTED ERROR: {e} ===")
        sys.exit(1)
