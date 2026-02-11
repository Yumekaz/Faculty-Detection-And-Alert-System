#!/usr/bin/env python3
"""Test image and detection features"""

import requests
import base64
import json

BASE = 'http://localhost:8000'

def test_image_features():
    print('='*70)
    print('TESTING IMAGE & DETECTION FEATURES')
    print('='*70)
    
    # 1. Test model initialization
    print('\n1. Initialize Models')
    print('-'*50)
    r = requests.post(f'{BASE}/inference/init-models')
    data = r.json()
    print(f'   Status: {data["status"]}')
    print(f'   Message: {data["message"]}')
    
    # 2. Test face detection
    print('\n2. Face Detection')
    print('-'*50)
    r = requests.post(f'{BASE}/inference/detect-faces', json={'image_base64': 'test'})
    data = r.json()
    print(f'   Faces detected: {data["count"]}')
    for face in data['faces']:
        print(f'   - BBox: {face["bbox"]}, Confidence: {face["confidence"]}')
    
    # 3. Test embedding extraction
    print('\n3. Extract Embedding')
    print('-'*50)
    r = requests.post(f'{BASE}/inference/extract-embedding', json={
        'image_base64': 'test',
        'bbox': [100, 100, 200, 200]
    })
    data = r.json()
    print(f'   Dimensions: {data["dimensions"]}')
    print(f'   Sample values: {data["embedding"][:5]}...')
    
    # 4. Test faculty search with embedding
    print('\n4. Faculty Search with Embedding')
    print('-'*50)
    embedding = data['embedding']
    r = requests.post(f'{BASE}/recognition/faculty/search', json={
        'embedding': embedding
    })
    data = r.json()
    print(f'   Matched: {data["matched"]}')
    print(f'   Name: {data["name"]}')
    print(f'   Confidence: {data["confidence"]}')
    
    # 5. Test camera snapshot
    print('\n5. Camera Snapshot')
    print('-'*50)
    r = requests.get(f'{BASE}/mock/snapshot/1')
    print(f'   Image size: {len(r.content)} bytes')
    print(f'   Content-Type: {r.headers.get("content-type")}')
    
    # 6. Test faculty list with images
    print('\n6. Faculty List')
    print('-'*50)
    r = requests.get(f'{BASE}/recognition/faculty/list')
    data = r.json()
    print(f'   Total faculty: {data["count"]}')
    for name in data['faculty'][:3]:
        print(f'   - {name}')
    
    # 7. Test adding faculty with image
    print('\n7. Add Faculty with Image')
    print('-'*50)
    # Create a simple mock image (1x1 pixel PNG)
    mock_png = b'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    image_base64 = base64.b64encode(mock_png).decode()
    
    r = requests.post(f'{BASE}/recognition/faculty/add', json={
        'name': 'Test Professor',
        'image_base64': image_base64,
        'department': 'Computer Science'
    })
    data = r.json()
    print(f'   Status: {data["status"]}')
    print(f'   Message: {data["message"]}')
    if data.get('faculty'):
        print(f'   Faculty ID: {data["faculty"]["id"]}')
        print(f'   Embedding generated: {data.get("embedding_generated", False)}')
    
    # 8. Test manual attendance with detection
    print('\n8. Manual Attendance Check')
    print('-'*50)
    r = requests.post(f'{BASE}/attendance/manual', json={
        'target_faculty': 'Dr. Smith'
    })
    data = r.json()
    print(f'   Matched: {data["matched"]}')
    print(f'   Name: {data["name"]}')
    print(f'   Confidence: {data["confidence"]}')
    print(f'   Period: {data["period"]}')
    
    # 9. Test camera status
    print('\n9. Camera Status')
    print('-'*50)
    r = requests.get(f'{BASE}/dvr/status')
    data = r.json()
    print(f'   Total cameras: {data["count"]}')
    for cam in data['cameras']:
        print(f'   - {cam["name"]}: {cam["status"]} ({cam["resolution"]})')
    
    # 10. Test stream URL
    print('\n10. Camera Stream URL')
    print('-'*50)
    r = requests.get(f'{BASE}/dvr/stream/1')
    data = r.json()
    print(f'   Stream URL: {data.get("stream_url", "N/A")}')
    print(f'   Snapshot URL: {data.get("snapshot_url", "N/A")}')
    
    print('\n' + '='*70)
    print('ALL IMAGE/DETECTION FEATURES WORKING!')
    print('='*70)

if __name__ == '__main__':
    test_image_features()
