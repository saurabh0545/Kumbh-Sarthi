import cv2
import time
import json
import urllib.request
import urllib.error

import os
# Backend endpoint (defaults to 8001 to avoid Windows port 8000 socket lock)
API_URL = os.getenv("CROWD_API_URL", "http://localhost:8001/api/crowd/update")
ZONE_NAME = "Gate-A"  # Gate 1 corresponds to Gate-A in Kumbh Sarthi

FIREBASE_PROJECT_ID = os.getenv("EXPO_PUBLIC_FIREBASE_PROJECT_ID", "kumbh-sarthi-440b4")
FIRESTORE_URL = f"https://firestore.googleapis.com/v1/projects/{FIREBASE_PROJECT_ID}/databases/(default)/documents/crowd_zones/{ZONE_NAME}"

import threading

def _do_push_cloud(people_count: int, density: str):
    # 1. Direct Firebase Cloud Firestore REST Update (Zero Latency Global 4G/5G Sync)
    try:
        firestore_payload = {
            "fields": {
                "zone": {"stringValue": ZONE_NAME},
                "name": {"stringValue": "Gate 1 (Ramkund)"},
                "people": {"integerValue": str(people_count)},
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
        with urllib.request.urlopen(f_req, timeout=2.0) as f_resp:
            if f_resp.status == 200:
                print(f"🔥 [Firebase Live Sync] -> Gate 1: {people_count} People ({density}) | Mobile App Updated!")
    except Exception as e:
        print(f"⚠️ Firebase sync notice: {e}")

    # 2. Local backend update (if running)
    payload = {
        "zone": ZONE_NAME,
        "people": people_count,
        "density": density
    }
    data = json.dumps(payload).encode("utf-8")
    try:
        req = urllib.request.Request(
            API_URL,
            data=data,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=0.8) as resp:
            pass
    except Exception:
        pass

def send_crowd_update(people_count: int, density: str):
    """Sends detected crowd count asynchronously in background thread so video never lags."""
    threading.Thread(target=_do_push_cloud, args=(people_count, density), daemon=True).start()

def get_density(count: int) -> str:
    """Calculate crowd density based on people count."""
    if count <= 4:
        return "LOW"
    elif count <= 12:
        return "MODERATE"
    else:
        return "HIGH"

def main():
    print("=" * 60)
    print("KUMBH SARTHI — GATE 1 LIVE CROWD DETECTOR")
    print(f"Target API: {API_URL}")
    print(f"Target Zone: {ZONE_NAME}")
    print("Press 'q' in the camera window to stop.")
    print("=" * 60)

    # Try loading Ultralytics YOLOv8, fallback to OpenCV HOG person detector
    use_yolo = False
    model = None
    try:
        from ultralytics import YOLO
        print("Loading YOLOv8 nano model (yolov8n.pt)...")
        model = YOLO("yolov8n.pt")
        use_yolo = True
        print("YOLOv8 model loaded successfully.")
    except Exception as e:
        print("ultralytics not installed or model unavailable. Using OpenCV HOG person detector as fallback.")
        hog = cv2.HOGDescriptor()
        hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())

    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    if not cap.isOpened():
        cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("ERROR: Cannot open camera (index 0). Please ensure your webcam is connected.")
        return

    last_send_time = 0
    last_sent_count = -1
    send_interval = 1.0  # send update every 1 second

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame from camera.")
            break

        people_count = 0

        if use_yolo and model is not None:
            # Run YOLO detection for class 0 (person)
            results = model(frame, classes=[0], verbose=False, conf=0.4)
            for r in results:
                boxes = r.boxes
                people_count = len(boxes)
                for box in boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    # Draw green bounding box
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 220, 0), 2)
                    cv2.putText(
                        frame,
                        "Person",
                        (x1, max(20, y1 - 8)),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.55,
                        (0, 220, 0),
                        2
                    )
        else:
            # Fallback OpenCV HOG detection
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            boxes, _ = hog.detectMultiScale(gray, winStride=(8, 8), padding=(4, 4), scale=1.05)
            people_count = len(boxes)
            for (x, y, w, h) in boxes:
                cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 220, 0), 2)
                cv2.putText(
                    frame,
                    "Person",
                    (x, max(20, y - 8)),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.55,
                    (0, 220, 0),
                    2
                )

        density = get_density(people_count)

        # Color for density overlay
        density_color = (0, 200, 0) if density == "LOW" else ((0, 165, 255) if density == "MODERATE" else (0, 0, 220))

        # Overlay Info Banner on camera feed
        cv2.rectangle(frame, (10, 10), (440, 95), (20, 20, 20), -1)
        cv2.putText(
            frame,
            f"Gate 1 Live (Nashik Kumbh)",
            (20, 35),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.65,
            (255, 255, 255),
            2
        )
        cv2.putText(
            frame,
            f"People Detected: {people_count}",
            (20, 62),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 255, 255),
            2
        )
        cv2.putText(
            frame,
            f"Density: {density}",
            (20, 86),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            density_color,
            2
        )

        # Send update periodically OR immediately whenever people count changes
        current_time = time.time()
        if (current_time - last_send_time >= send_interval) or (people_count != last_sent_count and current_time - last_send_time >= 0.5):
            send_crowd_update(people_count, density)
            last_sent_count = people_count
            last_send_time = current_time

        cv2.imshow("Gate 1 - Live Crowd Detection (Kumbh Sarthi)", frame)

        # Press 'q' to exit
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    print("Crowd detection stopped.")

if __name__ == "__main__":
    main()
