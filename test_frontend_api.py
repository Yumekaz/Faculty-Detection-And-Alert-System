#!/usr/bin/env python3
"""Test all frontend API endpoints"""

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
            return None
        
        success = r.status_code in [200, 201]
        status = "OK" if success else "FAIL"
        print(f"  [{status}] {method} {path} - {r.status_code}")
        return success
    except Exception as e:
        print(f"  [ERROR] {method} {path} - {e}")
        return False

def main():
    print("="*70)
    print("FRONTEND-BACKEND INTEGRATION TEST")
    print("="*70)
    
    results = []
    
    # Recognition API
    print("\n1. Recognition API (/recognition)")
    print("-"*50)
    results.append(test_endpoint("GET", "/recognition/faculty/list", description="listFaculty"))
    results.append(test_endpoint("POST", "/recognition/faculty/add", {"name": "Test", "image_base64": "test"}, description="addFaculty"))
    results.append(test_endpoint("POST", "/recognition/faculty/delete", {"name": "Test"}, description="deleteFaculty"))
    results.append(test_endpoint("POST", "/recognition/faculty/search", {"embedding": [0.1]*512}, description="searchFaculty"))
    results.append(test_endpoint("POST", "/recognition/faculty/clear-db", description="clearFacultyDatabase"))
    
    # Attendance API
    print("\n2. Attendance API (/attendance)")
    print("-"*50)
    results.append(test_endpoint("GET", "/attendance/logs", description="getAttendanceLogs"))
    results.append(test_endpoint("POST", "/attendance/manual", {"target_faculty": "Dr. Smith"}, description="manualAttendanceCheck"))
    results.append(test_endpoint("POST", "/attendance/auto/start", description="startAutoAttendance"))
    results.append(test_endpoint("POST", "/attendance/auto/stop", description="stopAutoAttendance"))
    results.append(test_endpoint("POST", "/attendance/logs/clear", description="clearAttendanceLogs"))
    
    # Schedule API
    print("\n3. Schedule API (/attendance/schedule)")
    print("-"*50)
    results.append(test_endpoint("GET", "/attendance/schedule/current", description="getCurrentPeriod"))
    results.append(test_endpoint("GET", "/attendance/schedule/next", description="getNextPeriod"))
    results.append(test_endpoint("GET", "/attendance/schedule/all", description="getFullSchedule"))
    results.append(test_endpoint("POST", "/attendance/schedule/update", {"schedule": []}, description="updateSchedule"))
    
    # Config API
    print("\n4. Config API (/config)")
    print("-"*50)
    results.append(test_endpoint("GET", "/config/config", description="getConfig"))
    results.append(test_endpoint("POST", "/config/config/update", {"detection_time": 45}, description="updateConfig"))
    results.append(test_endpoint("POST", "/config/config/reset", description="resetConfig"))
    results.append(test_endpoint("PATCH", "/config/config/update", {"threshold": 0.7}, description="patchConfig"))
    
    # Inference API
    print("\n5. Inference API (/inference)")
    print("-"*50)
    results.append(test_endpoint("POST", "/inference/init-models", description="initModels"))
    results.append(test_endpoint("POST", "/inference/detect-faces", {"image_base64": "test"}, description="detectFaces"))
    results.append(test_endpoint("POST", "/inference/extract-embedding", {"image_base64": "test", "bbox": [0,0,100,100]}, description="extractEmbedding"))
    
    # Audit API
    print("\n6. Audit API (/audit)")
    print("-"*50)
    results.append(test_endpoint("GET", "/audit/logs", description="getAuditLogs"))
    
    # Notification API
    print("\n7. Notification API (/notify)")
    print("-"*50)
    results.append(test_endpoint("GET", "/notify/alerts", description="getAlerts"))
    results.append(test_endpoint("POST", "/notify/test-email", description="testEmail"))
    results.append(test_endpoint("POST", "/notify/alerts/read", {"alert_id": 1}, description="markAlertRead"))
    
    # Corrections API
    print("\n8. Corrections API (/corrections)")
    print("-"*50)
    results.append(test_endpoint("GET", "/corrections/list", description="listCorrections"))
    results.append(test_endpoint("POST", "/corrections/request", {"faculty": "Test", "date": "2024-01-01", "reason": "Test"}, description="createCorrection"))
    results.append(test_endpoint("POST", "/corrections/approve", {"correction_id": 1}, description="approveCorrection"))
    results.append(test_endpoint("POST", "/corrections/reject", {"correction_id": 1}, description="rejectCorrection"))
    
    # DVR API
    print("\n9. DVR API (/dvr)")
    print("-"*50)
    results.append(test_endpoint("GET", "/dvr/status", description="getCameraStatus"))
    
    # Export API
    print("\n10. Export API (/export)")
    print("-"*50)
    results.append(test_endpoint("POST", "/export/attendance", description="exportAttendance"))
    
    # Health API
    print("\n11. Health API (/health)")
    print("-"*50)
    results.append(test_endpoint("GET", "/health", description="healthCheck"))
    results.append(test_endpoint("GET", "/health/detailed", description="detailedHealth"))
    
    # Summary
    print("\n" + "="*70)
    passed = sum(1 for r in results if r)
    total = len(results)
    print(f"RESULTS: {passed}/{total} tests passed")
    print("="*70)
    
    if passed == total:
        print("ALL TESTS PASSED - Frontend-Backend integration is working!")
        return 0
    else:
        print(f"{total - passed} test(s) failed")
        return 1

if __name__ == "__main__":
    exit(main())
