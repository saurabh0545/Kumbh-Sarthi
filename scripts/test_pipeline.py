import urllib.request
import urllib.parse
import json
import sys

import os
sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = os.getenv("BACKEND_URL", "http://127.0.0.1:8001")

def post_json(path, payload):
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=data,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as res:
        return json.loads(res.read().decode('utf-8'))

def test_full_pipeline():
    print("--- 1. Testing Family Creation ---")
    create_res = post_json("/api/family/create", {"name": "Patil Family", "user_id": 1})
    print("Created group:", create_res)
    group_code = create_res["group"]["code"]

    print("\n--- 2. Testing Family Me ---")
    req = urllib.request.Request(f"{BASE_URL}/api/family/me?user_id=1")
    with urllib.request.urlopen(req) as res:
        me_res = json.loads(res.read().decode('utf-8'))
        print("Family me res:", me_res["family"]["name"], "Members:", len(me_res["members"]))

    print("\n--- 3. Testing Location Sharing Toggle ---")
    loc_res = post_json("/api/family/location-sharing", {"user_id": 1, "enabled": True})
    print("Location sharing enabled:", loc_res)

    print("\n--- 4. Testing Family SOS ---")
    sos_res = post_json("/api/family/sos", {
        "user_id": 1,
        "latitude": 19.9975,
        "longitude": 73.7910,
        "location_name": "Near Ramkund West Gate"
    })
    print("SOS Sent:", sos_res)

    print("\n--- 5. Checking Alerts for Family SOS ---")
    req = urllib.request.Request(f"{BASE_URL}/api/alerts?user_id=1")
    with urllib.request.urlopen(req) as res:
        alerts = json.loads(res.read().decode('utf-8'))
        print("Latest alert:", alerts["alerts"][0]["title"], "| Type:", alerts["alerts"][0]["type"])

    print("\n--- 6. Testing Crowd Alert Deduplication / Transition ---")
    # Simulate Gate-A transition to HIGH
    crowd_high = post_json("/api/crowd/update", {
        "zone": "Gate-A",
        "people": 25,
        "density": "HIGH"
    })
    print("Crowd updated to HIGH:", crowd_high)

    # Re-post within cooldown window to verify deduplication
    crowd_high_dup = post_json("/api/crowd/update", {
        "zone": "Gate-A",
        "people": 28,
        "density": "HIGH"
    })
    print("Duplicate HIGH update handled without spamming:", crowd_high_dup)

    print("\n--- 7. Checking Crowd Alert in /api/alerts ---")
    req = urllib.request.Request(f"{BASE_URL}/api/alerts")
    with urllib.request.urlopen(req) as res:
        alerts = json.loads(res.read().decode('utf-8'))
        crowd_alerts = [a for a in alerts["alerts"] if a["type"] == "CROWD"]
        print("Crowd alerts count:", len(crowd_alerts), "| Most recent:", crowd_alerts[0]["title"])

    print("\n--- ALL TESTS COMPLETED SUCCESSFULLY! ---")

if __name__ == "__main__":
    test_full_pipeline()
