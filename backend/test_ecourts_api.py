"""
Test E-Courts API to see actual responses
"""
import requests
import json

# Test configuration
API_KEY = "ECIAPI-ziaB8ExvjMEHTIK9twWxOCOIMnnhk7Z4"
BASE_URL = "https://apis.akshit.net/eciapi/17"

def test_district_court_cnr():
    """Test District Court CNR lookup"""
    print("\n" + "="*60)
    print("TEST 1: District Court - CNR Lookup")
    print("="*60)
    
    url = f"{BASE_URL}/district-court/case"
    headers = {
        'Authorization': API_KEY,
        'Content-Type': 'application/json'
    }
    payload = {"cnr": "DLST020314162024"}
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"\nResponse Body:")
        print(json.dumps(response.json(), indent=2))
        return response.json()
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return None

def test_district_court_party_search():
    """Test District Court Party Name Search"""
    print("\n" + "="*60)
    print("TEST 2: District Court - Party Name Search")
    print("="*60)
    
    url = f"{BASE_URL}/district-court/search/party"
    headers = {
        'Authorization': API_KEY,
        'Content-Type': 'application/json'
    }
    payload = {
        "name": "Gaurav",
        "stage": "BOTH"
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        print(f"Status Code: {response.status_code}")
        print(f"\nResponse Body:")
        print(json.dumps(response.json(), indent=2))
        return response.json()
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return None

def test_high_court_cnr():
    """Test High Court CNR lookup"""
    print("\n" + "="*60)
    print("TEST 3: High Court - CNR Lookup")
    print("="*60)
    
    url = f"{BASE_URL}/high-court/case"
    headers = {
        'Authorization': API_KEY,
        'Content-Type': 'application/json'
    }
    payload = {"cnr": "DLHC010003082023"}
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        print(f"Status Code: {response.status_code}")
        print(f"\nResponse Body:")
        print(json.dumps(response.json(), indent=2))
        return response.json()
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return None

def test_api_without_auth():
    """Test if API works without authentication"""
    print("\n" + "="*60)
    print("TEST 4: Without Authentication")
    print("="*60)
    
    url = f"{BASE_URL}/district-court/case"
    headers = {
        'Content-Type': 'application/json'
    }
    payload = {"cnr": "DLST020314162024"}
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        print(f"Status Code: {response.status_code}")
        print(f"\nResponse Body:")
        print(json.dumps(response.json(), indent=2))
        return response.json()
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return None

if __name__ == "__main__":
    print("\n🔍 TESTING E-COURTS API")
    print("="*60)
    
    # Run all tests
    result1 = test_district_court_cnr()
    result2 = test_district_court_party_search()
    result3 = test_high_court_cnr()
    result4 = test_api_without_auth()
    
    print("\n" + "="*60)
    print("✅ TESTING COMPLETE")
    print("="*60)
