import urllib.request
import urllib.parse
import json
import sys

import os
BASE_URL = os.getenv("BACKEND_URL", "http://127.0.0.1:8001")

def test_api():
    print("Testing Kumbh Sarthi Backend...")
    
    # 1. Check crowd endpoint
    try:
        req = urllib.request.Request(f"{BASE_URL}/api/crowd/Gate-A")
        with urllib.request.urlopen(req, timeout=3) as res:
            data = json.loads(res.read().decode('utf-8'))
            print("1. Crowd API [Gate-A]: OK ->", data)
    except Exception as e:
        print("1. Crowd API [Gate-A]: Backend not running or unreachable ->", e)

    # 2. Check alerts endpoint
    try:
        req = urllib.request.Request(f"{BASE_URL}/api/alerts")
        with urllib.request.urlopen(req, timeout=3) as res:
            data = json.loads(res.read().decode('utf-8'))
            print("2. Alerts API: OK -> count =", data.get('count'))
    except Exception as e:
        print("2. Alerts API: Error ->", e)

    # 3. Check family me endpoint
    try:
        req = urllib.request.Request(f"{BASE_URL}/api/family/me?user_id=1")
        with urllib.request.urlopen(req, timeout=3) as res:
            data = json.loads(res.read().decode('utf-8'))
            print("3. Family API [/me]: OK -> family =", data.get('family'))
    except Exception as e:
        print("3. Family API [/me]: Error ->", e)

if __name__ == "__main__":
    test_api()
