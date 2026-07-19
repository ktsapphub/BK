#!/usr/bin/env python3
"""
Cookie-based authentication test for Bretton J. Key CMS
Tests the httpOnly cookie auth migration (no localStorage)
"""
import os
from pathlib import Path
import requests
import sys
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / "backend" / ".env")

BASE_URL = "https://bretton-world.preview.emergentagent.com/api"
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")

if not ADMIN_EMAIL or not ADMIN_PASSWORD:
    raise SystemExit("ADMIN_EMAIL / ADMIN_PASSWORD not set in backend/.env")

class CookieAuthTester:
    def __init__(self):
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.tests_failed = 0
        self.failures = []

    def log(self, msg):
        print(f"  {msg}")

    def test(self, name, method, endpoint, expected_status, data=None, check_response=None, check_cookie=None):
        """Run a single API test with cookie support"""
        url = f"{BASE_URL}{endpoint}"
        
        self.tests_run += 1
        print(f"\n🔍 Test {self.tests_run}: {name}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, timeout=10)
            elif method == 'POST':
                response = self.session.post(url, json=data, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            
            if success:
                self.log(f"✅ Status: {response.status_code}")
                
                # Check cookie if requested
                if check_cookie:
                    cookie_name = check_cookie.get("name")
                    should_exist = check_cookie.get("should_exist", True)
                    cookie_value = self.session.cookies.get(cookie_name)
                    
                    if should_exist and not cookie_value:
                        self.log(f"❌ Cookie '{cookie_name}' not found in session")
                        self.failures.append(f"{name}: Cookie '{cookie_name}' not found")
                        self.tests_failed += 1
                        return False, {}
                    elif not should_exist and cookie_value:
                        self.log(f"❌ Cookie '{cookie_name}' still exists (should be deleted)")
                        self.failures.append(f"{name}: Cookie '{cookie_name}' not deleted")
                        self.tests_failed += 1
                        return False, {}
                    elif should_exist and cookie_value:
                        self.log(f"✅ Cookie '{cookie_name}' found: {cookie_value[:20]}...")
                    else:
                        self.log(f"✅ Cookie '{cookie_name}' correctly not present")
                
                # Check response if requested
                try:
                    resp_json = response.json()
                    if check_response and not check_response(resp_json):
                        self.log(f"❌ Response validation failed")
                        self.failures.append(f"{name}: Response validation failed")
                        self.tests_failed += 1
                        return False, {}
                    else:
                        self.tests_passed += 1
                        return True, resp_json
                except Exception:
                    self.tests_passed += 1
                    return True, {}
            else:
                self.log(f"❌ Expected {expected_status}, got {response.status_code}")
                try:
                    self.log(f"   Response: {response.text[:200]}")
                except Exception:
                    pass
                self.tests_failed += 1
                self.failures.append(f"{name}: Expected {expected_status}, got {response.status_code}")
                return False, {}

        except Exception as e:
            self.log(f"❌ Error: {str(e)}")
            self.tests_failed += 1
            self.failures.append(f"{name}: {str(e)}")
            return False, {}

    def run_cookie_auth_tests(self):
        print("=" * 70)
        print("COOKIE-BASED AUTHENTICATION TEST SUITE")
        print("=" * 70)
        print(f"Testing with: {ADMIN_EMAIL}")
        print(f"Backend URL: {BASE_URL}")
        
        # Test 1: Login should set httpOnly cookie
        print("\n" + "=" * 70)
        print("1. LOGIN - Should set httpOnly cookie 'bk_admin_token'")
        print("=" * 70)
        
        success, resp = self.test(
            "Admin login (should set cookie)",
            "POST", "/admin/login", 200,
            data={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            check_response=lambda r: "token" in r and "email" in r,
            check_cookie={"name": "bk_admin_token", "should_exist": True}
        )
        
        if not success:
            print("\n❌ CRITICAL: Login failed or cookie not set. Cannot proceed.")
            return False
        
        self.log(f"   Email: {resp.get('email')}")
        self.log(f"   Role: {resp.get('role')}")
        
        # Test 2: /admin/me should work with cookie (no Authorization header)
        print("\n" + "=" * 70)
        print("2. SESSION PERSISTENCE - /admin/me with cookie only")
        print("=" * 70)
        
        success, me_resp = self.test(
            "Get current admin (cookie auth)",
            "GET", "/admin/me", 200,
            check_response=lambda r: r.get("email") == ADMIN_EMAIL
        )
        
        if not success:
            print("\n❌ CRITICAL: Session persistence failed. Cookie auth not working.")
            return False
        
        self.log(f"   Authenticated as: {me_resp.get('email')}")
        
        # Test 3: Logout should delete cookie
        print("\n" + "=" * 70)
        print("3. LOGOUT - Should delete cookie")
        print("=" * 70)
        
        success, logout_resp = self.test(
            "Admin logout (should delete cookie)",
            "POST", "/admin/logout", 200,
            check_response=lambda r: r.get("ok") == True,
            check_cookie={"name": "bk_admin_token", "should_exist": False}
        )
        
        if not success:
            print("\n❌ CRITICAL: Logout failed or cookie not deleted.")
            return False
        
        # Test 4: After logout, /admin/me should fail with 401
        print("\n" + "=" * 70)
        print("4. POST-LOGOUT - /admin/me should fail (401)")
        print("=" * 70)
        
        success, _ = self.test(
            "Get current admin after logout (should fail)",
            "GET", "/admin/me", 401
        )
        
        if not success:
            print("\n❌ CRITICAL: Session not properly cleared after logout.")
            return False
        
        self.log("✅ Session properly cleared after logout")
        
        # Test 5: Login again to verify cookie auth still works
        print("\n" + "=" * 70)
        print("5. RE-LOGIN - Verify cookie auth works again")
        print("=" * 70)
        
        success, resp = self.test(
            "Admin re-login (should set cookie again)",
            "POST", "/admin/login", 200,
            data={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            check_cookie={"name": "bk_admin_token", "should_exist": True}
        )
        
        if not success:
            print("\n❌ CRITICAL: Re-login failed.")
            return False
        
        # Test 6: Verify session persists across requests
        success, _ = self.test(
            "Verify session persists (second /admin/me call)",
            "GET", "/admin/me", 200,
            check_response=lambda r: r.get("email") == ADMIN_EMAIL
        )
        
        if not success:
            print("\n❌ CRITICAL: Session not persisting across requests.")
            return False
        
        return True

    def print_summary(self):
        print("\n" + "=" * 70)
        print("COOKIE AUTH TEST SUMMARY")
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
            print("\n🎉 ALL COOKIE AUTH TESTS PASSED!")
            print("\n✅ Cookie-based authentication is working correctly:")
            print("   • Login sets httpOnly cookie 'bk_admin_token'")
            print("   • Session persists across requests via cookie")
            print("   • Logout properly deletes cookie")
            print("   • Post-logout requests are properly rejected")
            return 0
        else:
            print(f"\n⚠️  {self.tests_failed} cookie auth test(s) failed")
            return 1

def main():
    tester = CookieAuthTester()
    try:
        tester.run_cookie_auth_tests()
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
    except Exception as e:
        print(f"\n\n❌ CRITICAL ERROR: {e}")
        import traceback
        traceback.print_exc()
    
    return tester.print_summary()

if __name__ == "__main__":
    sys.exit(main())
