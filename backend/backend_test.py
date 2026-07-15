import requests
import sys
from datetime import datetime

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
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"   Response: {response.text[:200]}")
                except:
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
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "admin/login",
            200,
            data={"email": "brettonjkey@icloud.com", "password": "#Test1234"}
        )
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Token obtained: {self.token[:20]}...")
            return True
        return False

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
                "message": "This is a test inquiry from automated testing",
                "subscribe_newsletter": False
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
    
    # Print summary
    return tester.print_summary()

if __name__ == "__main__":
    sys.exit(main())
