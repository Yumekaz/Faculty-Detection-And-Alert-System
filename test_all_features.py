#!/usr/bin/env python3
"""Comprehensive test of all backend features"""

import requests
import base64
import json

BASE = 'http://localhost:8000'

def test_all_features():
    passed = 0
    failed = 0
    
    def check(name, result):
        nonlocal passed, failed
        if result:
            print(f"  [OK] {name}")
            passed += 1
        else:
            print(f"  [FAIL] {name}")
            failed += 1
    
    print('='*70)
    print('COMPREHENSIVE BACKEND FEATURE TEST')
    print('='*70)
    
    # 1. Health & Status
    print('\n1. Health & Status')
    print('-'*50)
    try:
        r = requests.get(f'{BASE}/')
        check('Root endpoint', r.status_code == 200 and 'services' in r.json())
        
        r = requests.get(f'{BASE}/health')
        check('Health check', r.status_code == 200 and r.json().get('status') == 'healthy')
    except Exception as e:
        print(f'  [ERROR] {e}')
        failed += 2
    
    # 2. Faculty Management
    print('\n2. Faculty Management')
    print('-'*50)
    try:
        r = requests.get(f'{BASE}/recognition/faculty/list')
        check('List faculty', r.status_code == 200 and 'faculty' in r.json())
        
        # Add faculty with image
        mock_png = b'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        image_base64 = base64.b64encode(mock_png).decode()
        r = requests.post(f'{BASE}/recognition/faculty/add', json={
            'name': 'Test Professor',
            'image_base64': image_base64,
            'department': 'CS'
        })
        check('Add faculty with image', r.status_code == 200 and r.json().get('status') == 'success')
        
        r = requests.post(f'{BASE}/recognition/faculty/delete', json={'name': 'Test Professor'})
        check('Delete faculty', r.status_code == 200)
    except Exception as e:
        print(f'  [ERROR] {e}')
        failed += 3
    
    # 3. Face Detection & Recognition
    print('\n3. Face Detection & Recognition')
    print('-'*50)
    try:
        r = requests.post(f'{BASE}/inference/init-models')
        check('Initialize models', r.status_code == 200)
        
        r = requests.post(f'{BASE}/inference/detect-faces', json={'image_base64': 'test'})
        data = r.json()
        check('Detect faces', r.status_code == 200 and 'faces' in data and 'count' in data)
        
        r = requests.post(f'{BASE}/inference/extract-embedding', json={
            'image_base64': 'test',
            'bbox': [100, 100, 200, 200]
        })
        data = r.json()
        check('Extract embedding', r.status_code == 200 and data.get('dimensions') == 512)
        
        embedding = data.get('embedding', [])
        r = requests.post(f'{BASE}/recognition/faculty/search', json={'embedding': embedding})
        check('Search faculty by embedding', r.status_code == 200 and 'matched' in r.json())
    except Exception as e:
        print(f'  [ERROR] {e}')
        failed += 4
    
    # 4. Attendance
    print('\n4. Attendance')
    print('-'*50)
    try:
        r = requests.get(f'{BASE}/attendance/logs')
        check('Get attendance logs', r.status_code == 200 and 'logs' in r.json())
        
        r = requests.post(f'{BASE}/attendance/manual', json={'target_faculty': 'Dr. Smith'})
        check('Manual attendance check', r.status_code == 200 and 'matched' in r.json())
        
        r = requests.post(f'{BASE}/attendance/auto/start')
        check('Start auto attendance', r.status_code == 200)
        
        r = requests.post(f'{BASE}/attendance/auto/stop')
        check('Stop auto attendance', r.status_code == 200)
    except Exception as e:
        print(f'  [ERROR] {e}')
        failed += 4
    
    # 5. Schedule
    print('\n5. Schedule')
    print('-'*50)
    try:
        r = requests.get(f'{BASE}/attendance/schedule/current')
        check('Get current period', r.status_code == 200)
        
        r = requests.get(f'{BASE}/attendance/schedule/all')
        check('Get full schedule', r.status_code == 200 and 'schedule' in r.json())
        
        r = requests.post(f'{BASE}/attendance/schedule/update', json={
            'schedule': [{'period': 1, 'start': '09:00', 'end': '10:00', 'faculty': 'Test', 'subject': 'Math'}]
        })
        check('Update schedule', r.status_code == 200)
    except Exception as e:
        print(f'  [ERROR] {e}')
        failed += 3
    
    # 6. Configuration
    print('\n6. Configuration')
    print('-'*50)
    try:
        r = requests.get(f'{BASE}/config/config')
        check('Get config', r.status_code == 200 and 'detection_time' in r.json())
        
        r = requests.post(f'{BASE}/config/config/update', json={'detection_time': 45})
        check('Update config', r.status_code == 200)
        
        r = requests.post(f'{BASE}/config/config/reset')
        check('Reset config', r.status_code == 200)
    except Exception as e:
        print(f'  [ERROR] {e}')
        failed += 3
    
    # 7. DVR/Cameras
    print('\n7. DVR/Cameras')
    print('-'*50)
    try:
        r = requests.get(f'{BASE}/dvr/status')
        check('Get camera status', r.status_code == 200 and 'cameras' in r.json())
        
        r = requests.get(f'{BASE}/dvr/config')
        check('Get DVR config', r.status_code == 200)
        
        r = requests.post(f'{BASE}/dvr/connect')
        check('Connect to DVR', r.status_code == 200)
        
        r = requests.get(f'{BASE}/dvr/stream/1')
        check('Get camera stream', r.status_code == 200)
        
        r = requests.get(f'{BASE}/mock/snapshot/1')
        check('Get camera snapshot', r.status_code == 200 and r.headers.get('content-type') == 'image/jpeg')
        
        r = requests.post(f'{BASE}/dvr/disconnect')
        check('Disconnect from DVR', r.status_code == 200)
    except Exception as e:
        print(f'  [ERROR] {e}')
        failed += 6
    
    # 8. Audit & Notifications
    print('\n8. Audit & Notifications')
    print('-'*50)
    try:
        r = requests.get(f'{BASE}/audit/logs')
        check('Get audit logs', r.status_code == 200 and 'logs' in r.json())
        
        r = requests.get(f'{BASE}/notify/alerts')
        check('Get alerts', r.status_code == 200 and 'alerts' in r.json())
        
        r = requests.post(f'{BASE}/notify/test-email')
        check('Send test email', r.status_code == 200)
    except Exception as e:
        print(f'  [ERROR] {e}')
        failed += 3
    
    # 9. Corrections
    print('\n9. Corrections')
    print('-'*50)
    try:
        r = requests.get(f'{BASE}/corrections/list')
        check('List corrections', r.status_code == 200)
        
        r = requests.post(f'{BASE}/corrections/request', json={
            'faculty': 'Dr. Smith',
            'date': '2024-01-01',
            'reason': 'Test correction'
        })
        check('Request correction', r.status_code == 200)
    except Exception as e:
        print(f'  [ERROR] {e}')
        failed += 2
    
    # 10. Export
    print('\n10. Export')
    print('-'*50)
    try:
        r = requests.post(f'{BASE}/export/attendance')
        check('Export attendance', r.status_code == 200)
    except Exception as e:
        print(f'  [ERROR] {e}')
        failed += 1
    
    # Summary
    print('\n' + '='*70)
    print(f'RESULTS: {passed}/{passed+failed} tests passed')
    print('='*70)
    
    if failed == 0:
        print('ALL FEATURES WORKING CORRECTLY!')
        return 0
    else:
        print(f'{failed} test(s) failed')
        return 1

if __name__ == '__main__':
    exit(test_all_features())
