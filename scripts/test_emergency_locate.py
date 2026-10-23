import urllib.request
import json
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

url = "http://localhost:8001/api/emergency/trigger"
payload = {
    "user_id": 1,
    "user_name": "Ramesh Gupta (Pilgrim)",
    "user_phone": "+91 98230 11223",
    "location_name": "Ramkund Main Steps, Sector 1",
    "latitude": 19.9984,
    "longitude": 73.7915,
    "zone": "Gate-A",
    "type": "SOS",
    "severity": "CRITICAL",
    "notes": "Pilgrim feeling sudden chest tightness and separated from group near main kund steps."
}

req = urllib.request.Request(
    url,
    data=json.dumps(payload).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
        print("EMERGENCY DISPATCH TEST SUCCESS:")
        print(json.dumps(result, indent=2))
except Exception as e:
    print(f"Error triggering emergency: {e}")
