#!/usr/bin/env python
"""
Health check script to verify all critical APIs are working
Run this before and after deployment
"""

import requests
import sys

BASE_URL = "https://antlegal.anthemgt.com/api"

def test_endpoint(name, method, url, headers=None, data=None, expected_status=None):
    """Test a single endpoint"""
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=10)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=data, timeout=10)
        
        status = response.status_code
        
        if expected_status:
            if status == expected_status:
                print(f"✓ {name}: PASS (HTTP {status})")
                return True
            else:
                print(f"✗ {name}: FAIL (Expected {expected_status}, got {status})")
                return False
        else:
            if status < 500:
                print(f"✓ {name}: PASS (HTTP {status})")
                return True
            else:
                print(f"✗ {name}: FAIL (HTTP {status})")
                return False
    except Exception as e:
        print(f"✗ {name}: ERROR - {str(e)}")
        return False

def main():
    print("=== AntLegal API Health Check ===\n")
    
    results = []
    
    # Test 1: Login endpoint
    results.append(test_endpoint(
        "Login API",
        "POST",
        f"{BASE_URL}/auth/login_username_password/",
        data={"username": "test", "password": "test"},
        expected_status=400  # Invalid credentials is OK
    ))
    
    # Test 2: Dashboard (without auth - should return 401)
    results.append(test_endpoint(
        "Dashboard API",
        "GET",
        f"{BASE_URL}/dashboard/",
        expected_status=401
    ))
    
    # Test 3: Users API (without auth - should return 401)
    results.append(test_endpoint(
        "Users API",
        "GET",
        f"{BASE_URL}/users/",
        expected_status=401
    ))
    
    # Test 4: Firms API (without auth - should return 401)
    results.append(test_endpoint(
        "Firms API",
        "GET",
        f"{BASE_URL}/firms/firms/",
        expected_status=401
    ))
    
    # Test 5: Cases API (without auth - should return 401)
    results.append(test_endpoint(
        "Cases API",
        "GET",
        f"{BASE_URL}/cases/cases/",
        expected_status=401
    ))
    
    print(f"\n=== Results: {sum(results)}/{len(results)} tests passed ===")
    
    if all(results):
        print("✓ All critical APIs are working!")
        sys.exit(0)
    else:
        print("✗ Some APIs are failing!")
        sys.exit(1)

if __name__ == "__main__":
    main()
