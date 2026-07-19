import os
from pathlib import Path

import requests
import sys
from datetime import datetime
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")
ALT_ADMIN_EMAIL = os.environ.get("ALT_ADMIN_EMAIL", "")
ALT_ADMIN_PASSWORD = os.environ.get("ALT_ADMIN_PASSWORD", "")
if not ADMIN_EMAIL or not ADMIN_PASSWORD:
    raise SystemExit(
        "ADMIN_EMAIL / ADMIN_PASSWORD not set. Add them to backend/.env before running this script."
    )

class BrettonKeyCMSTester:
    def __init__(self, base_url="https://bretton-world.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        req_headers = {'Content-Type': 'application/json'}
        if self.token:
            req_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            req_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=req_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=req_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=req_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=req_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except Exception:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"   Response: {response.text[:200]}")
                except Exception:
                    pass
                self.failed_tests.append(f"{name} - Expected {expected_status}, got {response.status_code}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append(f"{name} - Error: {str(e)}")
            return False, {}

    def test_admin_login(self):
        """Test admin login and get token"""
        print("\n" + "="*60)
        print("TESTING ADMIN AUTH")
        print("="*60)
        
        # Test ORIGINAL admin credentials
        success, response = self.run_test(
            f"Admin Login (ORIGINAL: {ADMIN_EMAIL})",
            "POST",
            "admin/login",
            200,
            data={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Token obtained: {self.token[:20]}...")

        success_new = False
        if ALT_ADMIN_EMAIL and ALT_ADMIN_PASSWORD:
            # Test alternate/secondary admin credentials (if configured)
            success_new, response_new = self.run_test(
                f"Admin Login (ALT: {ALT_ADMIN_EMAIL})",
                "POST",
                "admin/login",
                200,
                data={"email": ALT_ADMIN_EMAIL, "password": ALT_ADMIN_PASSWORD}
            )
            if success_new and 'token' in response_new:
                print(f"   ALT admin token obtained: {response_new['token'][:20]}...")
                # Use the new token for subsequent tests
                self.token = response_new['token']
        else:
            print("   Skipping ALT admin credential test (ALT_ADMIN_EMAIL/ALT_ADMIN_PASSWORD not set)")

        return success or success_new

    def test_public_endpoints(self):
        """Test public endpoints"""
        print("\n" + "="*60)
        print("TESTING PUBLIC ENDPOINTS")
        print("="*60)
        
        # Test home page
        success, response = self.run_test(
            "GET /public/page/home",
            "GET",
            "public/page/home",
            200
        )
        if success:
            sections = response.get('sections', [])
            print(f"   Found {len(sections)} sections")
            section_types = [s.get('section_type') for s in sections]
            print(f"   Section types: {section_types}")
        
        # Test testimonials (should be empty)
        success, response = self.run_test(
            "GET /public/testimonials (should be empty)",
            "GET",
            "public/testimonials",
            200
        )
        if success:
            count = len(response) if isinstance(response, list) else 0
            print(f"   Testimonials count: {count} (expected 0 for unverified drafts)")
        
        # Test projects
        success, response = self.run_test(
            "GET /public/projects",
            "GET",
            "public/projects",
            200
        )
        if success:
            count = len(response) if isinstance(response, list) else 0
            print(f"   Projects count: {count}")
        
        # Test services
        success, response = self.run_test(
            "GET /public/services",
            "GET",
            "public/services",
            200
        )
        if success:
            count = len(response) if isinstance(response, list) else 0
            print(f"   Services count: {count}")
        
        # Test thoughts
        success, response = self.run_test(
            "GET /public/thoughts",
            "GET",
            "public/thoughts",
            200
        )
        if success:
            count = len(response) if isinstance(response, list) else 0
            print(f"   Thoughts count: {count}")
        
        # Test career entries
        success, response = self.run_test(
            "GET /public/career-entries",
            "GET",
            "public/career-entries",
            200
        )
        if success:
            count = len(response) if isinstance(response, list) else 0
            print(f"   Career entries count: {count}")
        
        # Test impact items
        success, response = self.run_test(
            "GET /public/impact-items",
            "GET",
            "public/impact-items",
            200
        )
        if success:
            count = len(response) if isinstance(response, list) else 0
            print(f"   Impact items count: {count}")
        
        # Test global settings
        success, response = self.run_test(
            "GET /public/global-settings",
            "GET",
            "public/global-settings",
            200
        )
        if success:
            print(f"   Site title: {response.get('site_title', 'N/A')}")

    def test_public_submissions(self):
        """Test public submission endpoints"""
        print("\n" + "="*60)
        print("TESTING PUBLIC SUBMISSIONS")
        print("="*60)
        
        # Test inquiry submission
        timestamp = datetime.now().strftime('%H%M%S')
        success, response = self.run_test(
            "POST /public/inquiries",
            "POST",
            "public/inquiries",
            200,
            data={
                "name": f"Test User {timestamp}",
                "email": f"test{timestamp}@example.com",
                "reason": "general_inquiry",
                "message": "This is a test inquiry from automated testing",
                "contact_consent": True,
                "contact_consent_text": "I consent to be contacted",
                "contact_consent_version": "v1"
            }
        )
        if success:
            print(f"   Message: {response.get('message', 'N/A')}")
        
        # Test newsletter signup
        success, response = self.run_test(
            "POST /public/newsletter",
            "POST",
            "public/newsletter",
            200,
            data={"email": f"newsletter{timestamp}@example.com"}
        )
        if success:
            print(f"   Message: {response.get('message', 'N/A')}")

    def test_admin_users(self):
        """Test admin users CRUD endpoints"""
        if not self.token:
            print("\n⚠️  Skipping admin users tests - no auth token")
            return
        
        print("\n" + "="*60)
        print("TESTING ADMIN USERS (NEW FEATURE)")
        print("="*60)
        
        # Test list users
        success, response = self.run_test(
            "GET /admin/users",
            "GET",
            "admin/users",
            200
        )
        if success:
            count = len(response) if isinstance(response, list) else 0
            print(f"   Users count: {count}")
            for user in response:
                print(f"   - {user.get('email')} (created: {user.get('created_at', 'N/A')[:10]})")
        
        # Test create user
        timestamp = datetime.now().strftime('%H%M%S')
        test_username = f"test_user_{timestamp}"
        success, response = self.run_test(
            "POST /admin/users (create test user)",
            "POST",
            "admin/users",
            200,
            data={"email": test_username, "password": "testpass123"}
        )
        test_user_id = None
        if success:
            test_user_id = response.get('id')
            print(f"   Created user ID: {test_user_id}")
        
        # Test delete user (cleanup)
        if test_user_id:
            self.run_test(
                "DELETE /admin/users/{id} (cleanup test user)",
                "DELETE",
                f"admin/users/{test_user_id}",
                200
            )
    
    def test_admin_analytics(self):
        """Test analytics endpoints"""
        if not self.token:
            print("\n⚠️  Skipping analytics tests - no auth token")
            return
        
        print("\n" + "="*60)
        print("TESTING ANALYTICS (NEW FEATURE)")
        print("="*60)
        
        # Test analytics summary
        success, response = self.run_test(
            "GET /admin/analytics/summary?days=30",
            "GET",
            "admin/analytics/summary?days=30",
            200
        )
        if success:
            print(f"   Total views: {response.get('total_views', 0)}")
            print(f"   Unique visitors: {response.get('unique_visitors', 0)}")
            print(f"   Views by day entries: {len(response.get('views_by_day', []))}")
            print(f"   Top paths: {len(response.get('top_paths', []))}")
            print(f"   Top referrers: {len(response.get('top_referrers', []))}")
            print(f"   Device breakdown: {len(response.get('device_breakdown', []))}")
    
    def test_admin_endpoints(self):
        """Test admin endpoints (requires auth)"""
        if not self.token:
            print("\n⚠️  Skipping admin tests - no auth token")
            return
        
        print("\n" + "="*60)
        print("TESTING ADMIN ENDPOINTS")
        print("="*60)
        
        # Test admin/me
        self.run_test(
            "GET /admin/me",
            "GET",
            "admin/me",
            200
        )
        
        # Test admin sections list
        success, response = self.run_test(
            "GET /admin/sections",
            "GET",
            "admin/sections",
            200
        )
        if success:
            count = len(response) if isinstance(response, list) else 0
            print(f"   Admin sections count: {count}")
        
        # Test admin pages list
        success, response = self.run_test(
            "GET /admin/pages",
            "GET",
            "admin/pages",
            200
        )
        if success:
            count = len(response) if isinstance(response, list) else 0
            print(f"   Admin pages count: {count}")
        
        # Test admin media list
        success, response = self.run_test(
            "GET /admin/media",
            "GET",
            "admin/media",
            200
        )
        if success:
            count = len(response) if isinstance(response, list) else 0
            print(f"   Media items count: {count}")
        
        # Test admin inquiries list
        success, response = self.run_test(
            "GET /admin/inquiries",
            "GET",
            "admin/inquiries",
            200
        )
        if success:
            count = len(response) if isinstance(response, list) else 0
            print(f"   Inquiries count: {count}")
        
        # Test admin global settings
        success, response = self.run_test(
            "GET /admin/global-settings",
            "GET",
            "admin/global-settings",
            200
        )
        if success:
            print(f"   Site title: {response.get('site_title', 'N/A')}")
            print(f"   GA Measurement ID: {response.get('ga_measurement_id', 'Not set')}")

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        print(f"📊 Tests passed: {self.tests_passed}/{self.tests_run}")
        if self.failed_tests:
            print(f"\n❌ Failed tests:")
            for test in self.failed_tests:
                print(f"   - {test}")
        else:
            print("\n✅ All tests passed!")
        return 0 if self.tests_passed == self.tests_run else 1

def main():
    tester = BrettonKeyCMSTester()
    
    # Run test suites
    tester.test_admin_login()
    tester.test_public_endpoints()
    tester.test_public_submissions()
    tester.test_admin_endpoints()
    tester.test_admin_users()
    tester.test_admin_analytics()
    
    # Print summary
    return tester.print_summary()

if __name__ == "__main__":
    sys.exit(main())
