#!/usr/bin/env python3
"""Test script for backend endpoints"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_endpoint(method, path, data=None, description=""):
    """Test a single endpoint"""
    url = f"{BASE_URL}{path}"
    try:
        if method == "GET":
            r = requests.get(url, timeout=5)
        elif method == "POST":
            r = requests.post(url, json=data, timeout=5)
        elif method == "PATCH":
            r = requests.patch(url, json=data, timeout=5)
        else:
            print(f"  [SKIP] Unknown method: {method}")
            return
        
        if r.status_code in [200, 201]:
            print(f"  [OK] {method} {path} - {r.status_code}")
            return True
        else:
            print(f"  [FAIL] {method} {path} - {r.status_code}")
            return False
    except Exception as e:
        print(f"  [ERROR] {method} {path} - {e}")
        return False

def main():
    print("="*70)
    print("BACKEND API TEST SUITE")
    print("="*70)
    
    results = []
    
    # Test 1: Root endpoint
    print("\n1. Testing Root & Health Endpoints")
    print("-"*40)
    results.append(test_endpoint("GET", "/", description="Root"))
    results.append(test_endpoint("GET", "/health", description="Health"))
    results.append(test_endpoint("GET", "/health/detailed", description="Health Detailed"))
    
    # Test 2: Faculty endpoints
    print("\n2. Testing Faculty Endpoints")
    print("-"*40)
    results.append(test_endpoint("GET", "/recognition/faculty/list", description="List Faculty"))
    results.append(test_endpoint("POST", "/recognition/faculty/add", 
                                {"name": "Test Faculty", "image_base64": "test"}, 
                                description="Add Faculty"))
    results.append(test_endpoint("POST", "/recognition/faculty/search", 
                                {"embedding": [0.1, 0.2, 0.3]}, 
                                description="Search Faculty"))
    
    # Test 3: Attendance endpoints
    print("\n3. Testing Attendance Endpoints")
    print("-"*40)
    results.append(test_endpoint("GET", "/attendance/logs", description="Get Logs"))
    results.append(test_endpoint("POST", "/attendance/manual", 
                                {"target_faculty": "Dr. Smith"}, 
                                description="Manual Check"))
    results.append(test_endpoint("POST", "/attendance/auto/start", description="Start Auto"))
    results.append(test_endpoint("POST", "/attendance/auto/stop", description="Stop Auto"))
    
    # Test 4: Schedule endpoints
    print("\n4. Testing Schedule Endpoints")
    print("-"*40)
    results.append(test_endpoint("GET", "/attendance/schedule/current", description="Current Period"))
    results.append(test_endpoint("GET", "/attendance/schedule/next", description="Next Period"))
    results.append(test_endpoint("GET", "/attendance/schedule/all", description="Full Schedule"))
    
    # Test 5: Config endpoints
    print("\n5. Testing Config Endpoints")
    print("-"*40)
    results.append(test_endpoint("GET", "/config/config", description="Get Config"))
    results.append(test_endpoint("POST", "/config/config/update", 
                                {"detection_time": 45}, 
                                description="Update Config"))
    
    # Test 6: Audit endpoints
    print("\n6. Testing Audit Endpoints")
    print("-"*40)
    results.append(test_endpoint("GET", "/audit/logs", description="Audit Logs"))
    
    # Test 7: Notification endpoints
    print("\n7. Testing Notification Endpoints")
    print("-"*40)
    results.append(test_endpoint("GET", "/notify/alerts", description="Get Alerts"))
    results.append(test_endpoint("POST", "/notify/test-email", description="Test Email"))
    
    # Test 8: Corrections endpoints
    print("\n8. Testing Corrections Endpoints")
    print("-"*40)
    results.append(test_endpoint("GET", "/corrections/list", description="List Corrections"))
    results.append(test_endpoint("POST", "/corrections/request", 
                                {"faculty": "Dr. Smith", "date": "2024-01-01", "reason": "Test"}, 
                                description="Request Correction"))
    
    # Test 9: DVR endpoints
    print("\n9. Testing DVR Endpoints")
    print("-"*40)
    results.append(test_endpoint("GET", "/dvr/status", description="Camera Status"))
    
    # Test 10: Export endpoints
    print("\n10. Testing Export Endpoints")
    print("-"*40)
    results.append(test_endpoint("POST", "/export/attendance", description="Export Attendance"))
    
    # Summary
    print("\n" + "="*70)
    passed = sum(1 for r in results if r)
    total = len(results)
    print(f"RESULTS: {passed}/{total} tests passed")
    print("="*70)
    
    if passed == total:
        print("✅ ALL TESTS PASSED - Backend is fully functional!")
    else:
        print(f"⚠️  {total - passed} test(s) failed")

if __name__ == "__main__":
    main()
