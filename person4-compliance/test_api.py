import requests
import json
import time

BASE_URL = "http://localhost:5004"

def print_section(title):
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)

def test_health():
    """Test 1: Health Check"""
    print_section("TEST 1: Health Check")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response:")
        print(json.dumps(response.json(), indent=2))
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_valid_messages():
    """Test 2: Valid Marketing Messages"""
    print_section("TEST 2: Valid Marketing Messages")
    try:
        payload = {
            "messages": [
                "Get 20% off your next purchase!",
                "Limited time offer - shop now!",
                "Free shipping on orders over $50"
            ]
        }
        response = requests.post(f"{BASE_URL}/validate", json=payload)
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"All Approved: {data.get('all_approved')}")
        print(f"Total Checked: {data.get('total_checked')}")
        print(f"Mode: {data.get('mode')}")
        
        # Show first result
        if data.get('results'):
            print(f"\nFirst result:")
            print(json.dumps(data['results'][0], indent=2))
        
        return response.status_code == 200 and data.get('all_approved')
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_single_message():
    """Test 3: Single Message"""
    print_section("TEST 3: Single Message")
    try:
        payload = {"messages": ["Join our rewards program today!"]}
        response = requests.post(f"{BASE_URL}/validate", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response:")
        print(json.dumps(response.json(), indent=2))
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_error_cases():
    """Test 4: Error Handling"""
    print_section("TEST 4: Error Handling")
    
    # Test 4a: Empty messages
    print("\n4a. Empty messages array:")
    try:
        response = requests.post(f"{BASE_URL}/validate", json={"messages": []})
        print(f"Status Code: {response.status_code} (should be 400)")
        print(f"Error: {response.json().get('error')}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 4b: Missing messages field
    print("\n4b. Missing messages field:")
    try:
        response = requests.post(f"{BASE_URL}/validate", json={})
        print(f"Status Code: {response.status_code} (should be 400)")
        print(f"Error: {response.json().get('error')}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 4c: Invalid type
    print("\n4c. Invalid type (string instead of array):")
    try:
        response = requests.post(f"{BASE_URL}/validate", json={"messages": "not an array"})
        print(f"Status Code: {response.status_code} (should be 400)")
        print(f"Error: {response.json().get('error')}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    return True

def test_stats():
    """Test 5: Stats Endpoint"""
    print_section("TEST 5: Stats")
    try:
        response = requests.get(f"{BASE_URL}/stats")
        print(f"Status Code: {response.status_code}")
        print(f"Response:")
        print(json.dumps(response.json(), indent=2))
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def run_all_tests():
    """Run all tests"""
    print("\n" + "🧪" * 30)
    print("  PERSON 4: COMPLIANCE CHECKER - TEST SUITE")
    print("🧪" * 30)
    
    results = []
    
    # Run tests
    results.append(("Health Check", test_health()))
    time.sleep(0.5)
    
    results.append(("Valid Messages", test_valid_messages()))
    time.sleep(0.5)
    
    results.append(("Single Message", test_single_message()))
    time.sleep(0.5)
    
    results.append(("Error Handling", test_error_cases()))
    time.sleep(0.5)
    
    results.append(("Stats Endpoint", test_stats()))
    
    # Summary
    print_section("TEST SUMMARY")
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    print("=" * 60 + "\n")
    
    return passed == total

if __name__ == "__main__":
    # Check if server is running
    print("\n⏳ Checking if server is running...")
    try:
        requests.get(f"{BASE_URL}/health", timeout=2)
        print("✅ Server is running!\n")
    except:
        print("❌ Server is NOT running!")
        print(f"Please start the server first: python app.py\n")
        exit(1)
    
    # Run tests
    success = run_all_tests()
    exit(0 if success else 1)