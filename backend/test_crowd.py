import cv2
import time
import json
import urllib.request
import urllib.error
import threading
import os

try:
    from backend.crowd_service import detect_people
except ModuleNotFoundError:
    from crowd_service import detect_people

ZONE_NAME = "Gate-A"
FIREBASE_PROJECT_ID = os.getenv("EXPO_PUBLIC_FIREBASE_PROJECT_ID", "kumbh-sarthi-440b4")
FIRESTORE_URL = f"https://firestore.googleapis.com/v1/projects/{FIREBASE_PROJECT_ID}/databases/(default)/documents/crowd_zones/{ZONE_NAME}"
LOCAL_API_URL = os.getenv("CROWD_API_URL", "http://localhost:8001/api/crowd/update")

last_firebase_sync = 0
last_synced_people = -1
firebase_sync_status = "Syncing..."

def push_to_cloud(people: int, density: str):
    global firebase_sync_status
    # 1. Direct Firebase Cloud Firestore REST Update
    try:
        firestore_payload = {
            "fields": {
                "zone": {"stringValue": ZONE_NAME},
                "name": {"stringValue": "Gate 1 (Ramkund)"},
                "people": {"integerValue": str(people)},
                "density": {"stringValue": density},
                "status": {"stringValue": "LIVE"},
                "updated_at": {"stringValue": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
            }
        }
        f_data = json.dumps(firestore_payload).encode("utf-8")
        f_req = urllib.request.Request(
            FIRESTORE_URL,
            data=f_data,
            headers={"Content-Type": "application/json"},
            method="PATCH"
        )
        with urllib.request.urlopen(f_req, timeout=2.0) as resp:
            if resp.status == 200:
                firebase_sync_status = "Firebase: Live & Synced"
                print(f"🔥 [Firebase Sync] -> Gate 1: {people} People ({density}) | App updated in real time!")
    except Exception as e:
        firebase_sync_status = f"Firebase error: {e}"

    # 2. Local FastAPI sync (if running)
    try:
        payload = json.dumps({"zone": ZONE_NAME, "people": people, "density": density}).encode("utf-8")
        l_req = urllib.request.Request(LOCAL_API_URL, data=payload, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(l_req, timeout=1.0):
            pass
    except Exception:
        pass

def main():
    global last_firebase_sync, last_synced_people, firebase_sync_status

    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    if not cap.isOpened():
        cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("❌ Camera could not be opened. Please check webcam connection.")
        return

    print("=" * 65)
    print("🚀 KUMBH SARTHI — LIVE CROWD DETECTOR (FIREBASE ENABLED)")
    print(f"🎯 Target Zone: {ZONE_NAME} (Gate 1 - Ramkund)")
    print(f"☁️ Cloud Target: {FIRESTORE_URL}")
    print("📱 All mobile apps will update live automatically via Firebase!")
    print("Press 'q' in camera window to stop.")
    print("=" * 65)

    while True:
        ret, frame = cap.read()
        if not ret:
            print("❌ Could not read frame from camera")
            break

        # Run YOLO person detection
        people, density = detect_people(frame)

        now = time.time()
        # Sync to Firebase every 1.0 second OR immediately if person count changed
        if now - last_firebase_sync >= 1.0 or (people != last_synced_people and now - last_firebase_sync >= 0.5):
            last_firebase_sync = now
            last_synced_people = people
            threading.Thread(target=push_to_cloud, args=(people, density), daemon=True).start()

        # UI Overlay on camera stream
        density_color = (0, 220, 0) if density == "LOW" else ((0, 165, 255) if density == "MEDIUM" or density == "MODERATE" else (0, 0, 230))

        # Semi-transparent HUD card
        overlay = frame.copy()
        cv2.rectangle(overlay, (15, 15), (460, 140), (20, 20, 20), -1)
        cv2.addWeighted(overlay, 0.75, frame, 0.25, 0, frame)

        # Labels
        cv2.putText(frame, "Kumbh Sarthi - Gate 1 Live Monitor", (25, 42), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255, 255, 255), 2)
        cv2.putText(frame, f"People Detected: {people}", (25, 75), cv2.FONT_HERSHEY_SIMPLEX, 0.85, (0, 255, 255), 2)
        cv2.putText(frame, f"Density: {density}", (25, 105), cv2.FONT_HERSHEY_SIMPLEX, 0.65, density_color, 2)
        cv2.putText(frame, f"Cloud Sync: {firebase_sync_status}", (25, 130), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 220, 0), 1)

        cv2.imshow("Kumbh Sarthi - Live Crowd Test", frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()
    print("🛑 Crowd test stopped.")

if __name__ == "__main__":
    main()