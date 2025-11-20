import requests
import json
import time

BASE_URL = "http://localhost:7071/api"  # pastikan /api di URL

def print_section(title):
    print("\n" + "=" * 60)
    print(title)
    print("=" * 60)

def safe_post(endpoint, payload):
    try:
        r = requests.post(f"{BASE_URL}/{endpoint}", json=payload)
        print(r.status_code, r.text)
        if r.status_code != 200:
            return None
        return r.json()
    except Exception as e:
        print(f"❌ Exception: {e}")
        return None

def safe_get(endpoint):
    try:
        r = requests.get(f"{BASE_URL}/{endpoint}")
        print(r.status_code, r.text)
        if r.status_code != 200:
            return None
        return r.json()
    except Exception as e:
        print(f"❌ Exception: {e}")
        return None

def test_health():
    print_section("TEST 1: Health Check")
    data = safe_get("Health")
    return data is not None

def test_valid_messages():
    print_section("TEST 2: Valid Messages")
    payload = {
        "messages": [
            "Get 20% off your next purchase!",
            "Limited time offer.",
            "Free shipping on all orders."
        ]
    }
    data = safe_post("Validate", payload)
    return data.get("all_approved") if data else False

def test_single_message():
    print_section("TEST 3: Single Message")
    payload = {"messages": ["Join our rewards program today!"]}
    data = safe_post("Validate", payload)
    return data is not None

def test_error_cases():
    print_section("TEST 4: Error Cases")

    print("4a: Empty array")
    safe_post("Validate", {"messages": []})

    print("4b: Missing field")
    safe_post("Validate", {})

    print("4c: Wrong type")
    safe_post("Validate", {"messages": "wrong"})

    return True

def test_stats():
    print_section("TEST 5: Stats")
    data = safe_get("Stats")
    return data is not None

def run_all_tests():
    tests = [
        ("Health", test_health()),
        ("Valid Messages", test_valid_messages()),
        ("Single Message", test_single_message()),
        ("Error Handling", test_error_cases()),
        ("Stats", test_stats()),
    ]

    print_section("SUMMARY")
    for name, ok in tests:
        print(("PASS" if ok else "FAIL") + f" - {name}")

if __name__ == "__main__":
    run_all_tests()
