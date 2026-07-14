#!/usr/bin/env python3
"""
Comprehensive backend API test for Bretton J. Key CMS
Tests all CRUD operations, auth, public endpoints, and verified gates
"""
import requests
import sys
import io
from datetime import datetime

BASE_URL = "https://bretton-world.preview.emergentagent.com/api"
ADMIN_EMAIL = "brettonjkey@icloud.com"
ADMIN_PASSWORD = "#Test1234"

class BackendTester:
    def __init__(self):
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.tests_failed = 0
        self.failures = []

    def log(self, msg):
        print(f"  {msg}")

    def test(self, name, method, endpoint, expected_status, data=None, files=None, check_response=None):
        """Run a single API test"""
        url = f"{BASE_URL}{endpoint}"
        headers = {}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        self.tests_run += 1
        print(f"\n🔍 Test {self.tests_run}: {name}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files, headers=headers, timeout=10)
                else:
                    headers['Content-Type'] = 'application/json'
                    response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                headers['Content-Type'] = 'application/json'
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            
            if success:
                try:
                    resp_json = response.json()
                    if check_response and not check_response(resp_json):
                        success = False
                        self.log(f"❌ Response validation failed")
                        self.failures.append(f"{name}: Response validation failed")
                    else:
                        self.log(f"✅ PASS - Status: {response.status_code}")
                        self.tests_passed += 1
                        return True, resp_json
                except:
                    self.log(f"✅ PASS - Status: {response.status_code} (no JSON)")
                    self.tests_passed += 1
                    return True, {}
            else:
                self.log(f"❌ FAIL - Expected {expected_status}, got {response.status_code}")
                try:
                    self.log(f"   Response: {response.text[:200]}")
                except:
                    pass
                self.tests_failed += 1
                self.failures.append(f"{name}: Expected {expected_status}, got {response.status_code}")
                return False, {}

        except Exception as e:
            self.log(f"❌ FAIL - Error: {str(e)}")
            self.tests_failed += 1
            self.failures.append(f"{name}: {str(e)}")
            return False, {}

    def run_all_tests(self):
        print("=" * 70)
        print("BRETTON J. KEY CMS - BACKEND API TEST SUITE")
        print("=" * 70)
        
        # 1. AUTH TESTS
        print("\n" + "=" * 70)
        print("1. AUTHENTICATION TESTS")
        print("=" * 70)
        
        # Test login with wrong password
        self.test(
            "Login with wrong password (should fail)",
            "POST", "/admin/login", 401,
            data={"email": ADMIN_EMAIL, "password": "wrongpassword"}
        )
        
        # Test login with correct credentials
        success, resp = self.test(
            "Admin login with correct credentials",
            "POST", "/admin/login", 200,
            data={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            check_response=lambda r: "token" in r and "email" in r
        )
        
        if not success:
            print("\n❌ CRITICAL: Admin login failed. Cannot proceed with authenticated tests.")
            return False
        
        self.token = resp.get("token")
        self.log(f"   Token obtained: {self.token[:20]}...")
        
        # Test /admin/me
        self.test(
            "Get current admin user",
            "GET", "/admin/me", 200,
            check_response=lambda r: r.get("email") == ADMIN_EMAIL
        )
        
        # 2. MEDIA LIBRARY TESTS
        print("\n" + "=" * 70)
        print("2. MEDIA LIBRARY TESTS")
        print("=" * 70)
        
        # Upload a test image
        test_image = io.BytesIO(b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82')
        test_image.name = 'test.png'
        
        success, media_resp = self.test(
            "Upload test image",
            "POST", "/admin/media/upload", 200,
            files={'file': ('test.png', test_image, 'image/png')},
            check_response=lambda r: "id" in r and "url" in r
        )
        
        media_id = media_resp.get("id") if success else None
        
        # List media
        self.test(
            "List media library",
            "GET", "/admin/media", 200,
            check_response=lambda r: isinstance(r, list)
        )
        
        # Get media file
        if media_id:
            self.test(
                "Get uploaded media file",
                "GET", f"/media/{media_id}", 200
            )
        
        # 3. PAGES & SECTIONS TESTS
        print("\n" + "=" * 70)
        print("3. PAGES & SECTIONS TESTS")
        print("=" * 70)
        
        # List pages
        success, pages_resp = self.test(
            "List pages",
            "GET", "/admin/pages", 200,
            check_response=lambda r: isinstance(r, list)
        )
        
        home_page_id = None
        if success and pages_resp:
            for page in pages_resp:
                if page.get("slug") == "home":
                    home_page_id = page.get("id")
                    break
        
        # List sections
        success, sections_resp = self.test(
            "List all sections",
            "GET", "/admin/sections", 200,
            check_response=lambda r: isinstance(r, list)
        )
        
        # Create a test section
        test_section_data = {
            "page_id": home_page_id or "test-page",
            "section_type": "custom",
            "internal_name": "Test Section",
            "navigation_label": "Test",
            "display_order": 999,
            "is_visible": True,
            "status": "draft",
            "content": {"test": "data"}
        }
        
        success, section_resp = self.test(
            "Create draft section",
            "POST", "/admin/sections", 200,
            data=test_section_data,
            check_response=lambda r: "id" in r and r.get("status") == "draft"
        )
        
        test_section_id = section_resp.get("id") if success else None
        
        # Update section to published
        if test_section_id:
            self.test(
                "Publish section",
                "PUT", f"/admin/sections/{test_section_id}", 200,
                data={"status": "published"},
                check_response=lambda r: r.get("status") == "published" and r.get("published_at") is not None
            )
            
            # Get section versions
            self.test(
                "Get section version history",
                "GET", f"/admin/sections/{test_section_id}/versions", 200,
                check_response=lambda r: isinstance(r, list) and len(r) > 0
            )
            
            # Update section again
            self.test(
                "Update published section",
                "PUT", f"/admin/sections/{test_section_id}", 200,
                data={"content": {"test": "updated"}},
                check_response=lambda r: r.get("content", {}).get("test") == "updated"
            )
        
        # 4. CAREER ENTRIES TESTS
        print("\n" + "=" * 70)
        print("4. CAREER ENTRIES TESTS")
        print("=" * 70)
        
        test_career_data = {
            "title": "Test Position",
            "org": "Test Company",
            "start_date": "2020-01",
            "end_date": "2021-12",
            "is_current": False,
            "description": "Test description",
            "achievements": ["Achievement 1", "Achievement 2"],
            "skills": ["Skill 1", "Skill 2"],
            "display_order": 999,
            "is_visible": True
        }
        
        success, career_resp = self.test(
            "Create career entry",
            "POST", "/admin/career-entries", 200,
            data=test_career_data,
            check_response=lambda r: "id" in r
        )
        
        test_career_id = career_resp.get("id") if success else None
        
        self.test(
            "List career entries (admin)",
            "GET", "/admin/career-entries", 200,
            check_response=lambda r: isinstance(r, list)
        )
        
        self.test(
            "List career entries (public)",
            "GET", "/public/career-entries", 200,
            check_response=lambda r: isinstance(r, list)
        )
        
        # 5. TESTIMONIALS TESTS (with verified gate)
        print("\n" + "=" * 70)
        print("5. TESTIMONIALS TESTS (VERIFIED GATE)")
        print("=" * 70)
        
        # Create unverified testimonial
        test_testimonial_unverified = {
            "name": "Test Person Unverified",
            "title": "Test Title",
            "org": "Test Org",
            "full_quote": "This is a test unverified quote",
            "verified": False,
            "status": "published",
            "display_order": 999
        }
        
        success, testimonial_unverified_resp = self.test(
            "Create unverified testimonial",
            "POST", "/admin/testimonials", 200,
            data=test_testimonial_unverified,
            check_response=lambda r: "id" in r
        )
        
        # Create verified testimonial
        test_testimonial_verified = {
            "name": "Test Person Verified",
            "title": "Test Title",
            "org": "Test Org",
            "full_quote": "This is a test verified quote",
            "verified": True,
            "status": "published",
            "display_order": 998
        }
        
        success, testimonial_verified_resp = self.test(
            "Create verified testimonial",
            "POST", "/admin/testimonials", 200,
            data=test_testimonial_verified,
            check_response=lambda r: "id" in r
        )
        
        test_testimonial_verified_id = testimonial_verified_resp.get("id") if success else None
        
        # List all testimonials (admin should see both)
        self.test(
            "List all testimonials (admin)",
            "GET", "/admin/testimonials", 200,
            check_response=lambda r: isinstance(r, list) and len(r) >= 2
        )
        
        # List public testimonials (should only see verified)
        success, public_testimonials = self.test(
            "List public testimonials (should only show verified)",
            "GET", "/public/testimonials", 200,
            check_response=lambda r: isinstance(r, list)
        )
        
        if success:
            verified_count = sum(1 for t in public_testimonials if t.get("verified") == True)
            unverified_count = sum(1 for t in public_testimonials if t.get("verified") == False)
            if unverified_count > 0:
                self.log(f"❌ CRITICAL: Public testimonials endpoint returned {unverified_count} unverified testimonials!")
                self.failures.append("Public testimonials: Unverified testimonials leaked to public API")
            else:
                self.log(f"✅ Verified gate working: {verified_count} verified, 0 unverified in public API")
        
        # 6. PROJECTS TESTS
        print("\n" + "=" * 70)
        print("6. PROJECTS TESTS")
        print("=" * 70)
        
        test_project_data = {
            "title": "Test Project",
            "slug": "test-project",
            "summary": "Test summary",
            "problem": "Test problem",
            "solution": "Test solution",
            "status": "Live",
            "is_published": True,
            "display_order": 999
        }
        
        success, project_resp = self.test(
            "Create project",
            "POST", "/admin/projects", 200,
            data=test_project_data,
            check_response=lambda r: "id" in r
        )
        
        test_project_id = project_resp.get("id") if success else None
        
        self.test(
            "List projects (admin)",
            "GET", "/admin/projects", 200,
            check_response=lambda r: isinstance(r, list)
        )
        
        self.test(
            "List projects (public)",
            "GET", "/public/projects", 200,
            check_response=lambda r: isinstance(r, list)
        )
        
        if test_project_id:
            self.test(
                "Get project by slug (public)",
                "GET", "/public/projects/test-project", 200,
                check_response=lambda r: r.get("slug") == "test-project"
            )
        
        # 7. SERVICES TESTS
        print("\n" + "=" * 70)
        print("7. SERVICES TESTS")
        print("=" * 70)
        
        test_service_data = {
            "title": "Test Service",
            "description": "Test description",
            "capabilities": ["Cap 1", "Cap 2"],
            "is_published": True,
            "display_order": 999
        }
        
        success, service_resp = self.test(
            "Create service",
            "POST", "/admin/services", 200,
            data=test_service_data,
            check_response=lambda r: "id" in r
        )
        
        self.test(
            "List services (public)",
            "GET", "/public/services", 200,
            check_response=lambda r: isinstance(r, list)
        )
        
        # 8. THOUGHTS/ARTICLES TESTS
        print("\n" + "=" * 70)
        print("8. THOUGHTS/ARTICLES TESTS")
        print("=" * 70)
        
        test_thought_data = {
            "title": "Test Article",
            "slug": "test-article",
            "excerpt": "Test excerpt",
            "body": "Test body content",
            "is_published": True,
            "display_order": 999
        }
        
        success, thought_resp = self.test(
            "Create thought/article",
            "POST", "/admin/thoughts", 200,
            data=test_thought_data,
            check_response=lambda r: "id" in r
        )
        
        self.test(
            "List thoughts (public)",
            "GET", "/public/thoughts", 200,
            check_response=lambda r: isinstance(r, list)
        )
        
        self.test(
            "Get thought by slug (public)",
            "GET", "/public/thoughts/test-article", 200,
            check_response=lambda r: r.get("slug") == "test-article"
        )
        
        # 9. IMPACT ITEMS TESTS
        print("\n" + "=" * 70)
        print("9. IMPACT/MEDIA ITEMS TESTS")
        print("=" * 70)
        
        test_impact_data = {
            "title": "Test Impact Item",
            "org": "Test Org",
            "category": "podcast",
            "is_published": True,
            "display_order": 999
        }
        
        success, impact_resp = self.test(
            "Create impact item",
            "POST", "/admin/impact-items", 200,
            data=test_impact_data,
            check_response=lambda r: "id" in r
        )
        
        self.test(
            "List impact items (public)",
            "GET", "/public/impact-items", 200,
            check_response=lambda r: isinstance(r, list)
        )
        
        # 10. NAVIGATION TESTS
        print("\n" + "=" * 70)
        print("10. NAVIGATION TESTS")
        print("=" * 70)
        
        self.test(
            "Get public navigation",
            "GET", "/public/navigation", 200,
            check_response=lambda r: isinstance(r, list)
        )
        
        # 11. GLOBAL SETTINGS TESTS
        print("\n" + "=" * 70)
        print("11. GLOBAL SETTINGS TESTS")
        print("=" * 70)
        
        self.test(
            "Get global settings (admin)",
            "GET", "/admin/global-settings", 200,
            check_response=lambda r: isinstance(r, dict)
        )
        
        self.test(
            "Get global settings (public)",
            "GET", "/public/global-settings", 200,
            check_response=lambda r: isinstance(r, dict)
        )
        
        self.test(
            "Update global settings",
            "PUT", "/admin/global-settings", 200,
            data={"site_tagline": "Test Tagline Updated"},
            check_response=lambda r: r.get("site_tagline") == "Test Tagline Updated"
        )
        
        # 12. INQUIRIES TESTS
        print("\n" + "=" * 70)
        print("12. INQUIRIES/CONTACT FORM TESTS")
        print("=" * 70)
        
        test_inquiry_data = {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "555-1234",
            "subject": "Test Subject",
            "message": "This is a test inquiry message"
        }
        
        success, inquiry_resp = self.test(
            "Submit contact form inquiry (public)",
            "POST", "/public/inquiries", 200,
            data=test_inquiry_data,
            check_response=lambda r: r.get("success") == True
        )
        
        success, inquiries_list = self.test(
            "List inquiries (admin)",
            "GET", "/admin/inquiries", 200,
            check_response=lambda r: isinstance(r, list)
        )
        
        test_inquiry_id = None
        if success and inquiries_list:
            for inq in inquiries_list:
                if inq.get("email") == "test@example.com":
                    test_inquiry_id = inq.get("id")
                    break
        
        if test_inquiry_id:
            self.test(
                "Update inquiry status",
                "PUT", f"/admin/inquiries/{test_inquiry_id}", 200,
                data={"status": "handled"},
                check_response=lambda r: r.get("status") == "handled"
            )
        
        # 13. PUBLIC PAGE ENDPOINT TEST
        print("\n" + "=" * 70)
        print("13. PUBLIC PAGE ENDPOINT TEST")
        print("=" * 70)
        
        success, page_data = self.test(
            "Get public home page with sections",
            "GET", "/public/page/home", 200,
            check_response=lambda r: "page" in r and "sections" in r and isinstance(r["sections"], list)
        )
        
        if success:
            sections = page_data.get("sections", [])
            published_count = len(sections)
            visible_count = sum(1 for s in sections if s.get("is_visible") == True)
            self.log(f"   Home page has {published_count} published sections, {visible_count} visible")
            
            # Check that all sections are published and visible
            for s in sections:
                if s.get("status") != "published":
                    self.log(f"❌ WARNING: Section {s.get('id')} has status {s.get('status')} but appears in public API")
                if s.get("is_visible") != True:
                    self.log(f"❌ WARNING: Section {s.get('id')} has is_visible=False but appears in public API")
        
        # 14. CLEANUP TEST DATA
        print("\n" + "=" * 70)
        print("14. CLEANUP TEST DATA")
        print("=" * 70)
        
        if test_section_id:
            self.test("Delete test section", "DELETE", f"/admin/sections/{test_section_id}", 200)
        if test_career_id:
            self.test("Delete test career entry", "DELETE", f"/admin/career-entries/{test_career_id}", 200)
        if test_project_id:
            self.test("Delete test project", "DELETE", f"/admin/projects/{test_project_id}", 200)
        if test_testimonial_verified_id:
            self.test("Delete test testimonial", "DELETE", f"/admin/testimonials/{test_testimonial_verified_id}", 200)
        if media_id:
            self.test("Delete test media", "DELETE", f"/admin/media/{media_id}", 200)
        
        return True

    def print_summary(self):
        print("\n" + "=" * 70)
        print("TEST SUMMARY")
        print("=" * 70)
        print(f"Total tests run: {self.tests_run}")
        print(f"✅ Passed: {self.tests_passed}")
        print(f"❌ Failed: {self.tests_failed}")
        
        if self.tests_failed > 0:
            print("\n" + "=" * 70)
            print("FAILURES:")
            print("=" * 70)
            for failure in self.failures:
                print(f"  • {failure}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"\nSuccess rate: {success_rate:.1f}%")
        
        if self.tests_failed == 0:
            print("\n🎉 ALL TESTS PASSED!")
            return 0
        else:
            print(f"\n⚠️  {self.tests_failed} test(s) failed")
            return 1

def main():
    tester = BackendTester()
    try:
        tester.run_all_tests()
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
    except Exception as e:
        print(f"\n\n❌ CRITICAL ERROR: {e}")
        import traceback
        traceback.print_exc()
    
    return tester.print_summary()

if __name__ == "__main__":
    sys.exit(main())
