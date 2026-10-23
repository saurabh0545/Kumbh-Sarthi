import os
import sys
import base64
import json
from fastapi.testclient import TestClient

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.main import app

def run_api_tests():
    print("=" * 65)
    print("  KUMBH SARTHI — FASTAPI FACE AI ENDPOINT VALIDATION")
    print("=" * 65)
    
    client = TestClient(app)
    
    # 1. Test /api/face/status
    print("\n[1] GET /api/face/status:")
    res = client.get("/api/face/status")
    print(f"    Status Code: {res.status_code}")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    status_data = res.json()
    print("    Response:", json.dumps(status_data, indent=2))
    assert status_data["status"] == "operational"
    assert status_data["has_detector"] is True

    # 2. Test /api/face/registry
    print("\n[2] GET /api/face/registry:")
    res = client.get("/api/face/registry")
    print(f"    Status Code: {res.status_code}")
    assert res.status_code == 200
    reg_data = res.json()
    print(f"    Enrolled Count: {reg_data['count']}")
    for person in reg_data["identities"]:
        print(f"    • [{person['id']}] {person['name']} | Type: {person['type']} | Case: {person['case_status']}")

    # 3. Test /api/face/detect with base64 images
    print("\n[3] POST /api/face/detect with Saurabh image:")
    with open(os.path.join(BASE_DIR, "saurabh_0.jpg"), "rb") as f:
        saurabh_b64 = "data:image/jpeg;base64," + base64.b64encode(f.read()).decode()

    # Detect all mode
    res_all = client.post("/api/face/detect", json={
        "image": saurabh_b64,
        "zone": "Gate-A",
        "only_cases": False
    })
    print(f"    only_cases=False -> Status: {res_all.status_code}, Detected: {res_all.json()['faces_count']}")
    faces = res_all.json()["faces"]
    if faces:
        print(f"    Recognized as: {faces[0]['name']} (Conf: {faces[0]['confidence']*100:.1f}%, Type: {faces[0]['person_type']})")
        assert faces[0]["name"] == "Saurabh"
        assert faces[0]["is_recognized"] is True

    # Cases only mode (Saurabh is officer, so should NOT be returned when cases_only=True)
    res_cases = client.post("/api/face/detect", json={
        "image": saurabh_b64,
        "zone": "Gate-A",
        "only_cases": True
    })
    print(f"    only_cases=True  -> Status: {res_cases.status_code}, Detected: {res_cases.json()['faces_count']} (expected 0 because Saurabh is Officer)")
    assert res_cases.json()["faces_count"] == 0

    # Test /api/face/detect with Missing Person image (om Thorat)
    print("\n[4] POST /api/face/detect with Missing Person (LF-2026-247):")
    with open(os.path.join(BASE_DIR, "LF-2026-247.jpg"), "rb") as f:
        om_b64 = "data:image/jpeg;base64," + base64.b64encode(f.read()).decode()

    res_om_cases = client.post("/api/face/detect", json={
        "image": om_b64,
        "zone": "Sangam Ghat",
        "only_cases": True
    })
    print(f"    only_cases=True -> Status: {res_om_cases.status_code}, Detected: {res_om_cases.json()['faces_count']}")
    om_faces = res_om_cases.json()["faces"]
    assert len(om_faces) >= 1
    print(f"    Alert Triggered for: {om_faces[0]['name']} (Conf: {om_faces[0]['confidence']*100:.1f}%, CaseStatus: {om_faces[0]['case_status']})")
    assert om_faces[0]["is_unsolved_case"] is True

    # 5. Test Registering a Temporary Person, updating case status, then deleting
    print("\n[5] POST /api/face/register (Test Dynamic Enrollment):")
    test_person_id = "TEST-TEMP-999"
    reg_res = client.post("/api/face/register", json={
        "name": "Test Pilgrim Subject",
        "person_id": test_person_id,
        "image": saurabh_b64, # Use valid face image
        "details": "Temporary test profile for validation",
        "location": "Sector 4",
        "contact": "9999999999",
        "type": "MISSING_PERSON",
        "case_status": "SEARCHING"
    })
    print(f"    Enroll Response: {reg_res.status_code} -> {reg_res.json()['message']}")
    assert reg_res.status_code == 200

    # 6. Test Updating Status to RESOLVED
    print("\n[6] PATCH /api/face/registry/{person_id}/status:")
    patch_res = client.patch(f"/api/face/registry/{test_person_id}/status", json={"status": "RESOLVED"})
    print(f"    Update Response: {patch_res.status_code} -> {patch_res.json()}")
    assert patch_res.status_code == 200
    assert patch_res.json()["case_status"] == "RESOLVED"

    # 7. Test Deleting Test Profile
    print("\n[7] DELETE /api/face/registry/{person_id}:")
    del_res = client.delete(f"/api/face/registry/{test_person_id}")
    print(f"    Delete Response: {del_res.status_code} -> {del_res.json()}")
    assert del_res.status_code == 200

    print("\n" + "=" * 65)
    print("  ALL API ENDPOINTS TESTED AND FUNCTIONING 100% PERFECTLY!")
    print("=" * 65)

if __name__ == "__main__":
    run_api_tests()
