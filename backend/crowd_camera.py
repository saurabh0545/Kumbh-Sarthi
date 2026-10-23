import cv2
import requests
import time

try:
    from backend.crowd_service import detect_people
except ModuleNotFoundError:
    from crowd_service import detect_people


import json
import urllib.request
import threading

# FastAPI endpoint
API_URL = "http://127.0.0.1:8001/api/crowd/update"

# Zone where this camera is located
ZONE = "Gate-A"

FIREBASE_PROJECT_ID = "kumbh-sarthi-440b4"
FIRESTORE_URL = f"https://firestore.googleapis.com/v1/projects/{FIREBASE_PROJECT_ID}/databases/(default)/documents/crowd_zones/{ZONE}"

def sync_to_firestore(people: int, density: str):
    try:
        payload = {
            "fields": {
                "zone": {"stringValue": ZONE},
                "name": {"stringValue": "Gate 1 (Ramkund)"},
                "people": {"integerValue": str(people)},
                "density": {"stringValue": density},
                "status": {"stringValue": "LIVE"},
                "updated_at": {"stringValue": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
            }
        }
        req = urllib.request.Request(
            FIRESTORE_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="PATCH"
        )
        with urllib.request.urlopen(req, timeout=2.0):
            pass
    except Exception:
        pass


# Open webcam
cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
if not cap.isOpened():
    cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("❌ Camera could not be opened")
    exit()

print("✅ Crowd camera started (Firebase enabled)")
print("Press Q to stop")

last_update = 0


while True:

    # Read camera frame
    ret, frame = cap.read()

    if not ret:
        print("❌ Could not read frame")
        break

    # Run YOLO person detection
    people, density = detect_people(frame)

    # Debug output
    print(f"YOLO → People: {people}, Density: {density}")

    # Send result to FastAPI & Firebase every 0.8 seconds
    current_time = time.time()

    if current_time - last_update >= 0.8:

        # 1. Background Firebase sync
        threading.Thread(target=sync_to_firestore, args=(people, density), daemon=True).start()

        # 2. Local FastAPI sync
        data = {
            "zone": ZONE,
            "people": people,
            "density": density
        }

        try:

            response = requests.post(
                API_URL,
                json=data,
                timeout=2
            )

            if response.status_code == 200:
                print(
                    f"✅ API updated → "
                    f"{ZONE}: {people} people, {density} (Synced to Firebase)"
                )
            else:
                print(
                    f"❌ API returned status code: "
                    f"{response.status_code}"
                )

        except requests.exceptions.RequestException as e:

            print("❌ Could not connect to FastAPI (Firebase direct cloud sync active)")

        last_update = current_time


    # Display information on camera
    cv2.putText(
        frame,
        f"Zone: {ZONE}",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0, 255, 0),
        2
    )

    cv2.putText(
        frame,
        f"People: {people}",
        (20, 80),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0, 255, 0),
        2
    )

    cv2.putText(
        frame,
        f"Density: {density}",
        (20, 120),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0, 255, 0),
        2
    )


    # Show camera
    cv2.imshow(
        "Kumbh Smart Assist - Crowd Camera",
        frame
    )


    # Press Q to quit
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break


# Cleanup
cap.release()
cv2.destroyAllWindows()

print("🛑 Crowd camera stopped")