"""
KUMBH SARTHI — COMBINED FACE DETECTION + PEOPLE COUNTING
=========================================================
Runs both AI subsystems on a single shared webcam feed so they
work simultaneously without the Windows camera-lock conflict.

Face Detection  : YuNet ONNX + SFace biometric recognition
People Counting : YOLO (ultralytics) person detector
"""

import cv2
import numpy as np
import os
import sys
import time
import json
import urllib.request
import urllib.error
import threading

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

# ─── Configuration ────────────────────────────────────────────────────────────
ZONE_LIST = ["Gate-A", "Gate-B", "Sangam Ghat", "Sector 3"]
current_zone_idx = 0
API_URL = os.getenv("CROWD_API_URL", "http://localhost:8001/api/crowd/update")
FIREBASE_PROJECT_ID = os.getenv("EXPO_PUBLIC_FIREBASE_PROJECT_ID", "kumbh-sarthi-440b4")

# ─── Import Face Engine ───────────────────────────────────────────────────────
try:
    from backend.face_engine import face_engine
except ImportError:
    from face_engine import face_engine

# ─── Import / Load YOLO ──────────────────────────────────────────────────────
use_yolo = False
yolo_model = None
hog = None
try:
    from ultralytics import YOLO
    # Prefer yolo11n, fallback to yolov8n
    for yolo_weights in ["yolo11n.pt", "yolov8n.pt"]:
        yolo_path = os.path.join(BASE_DIR, yolo_weights)
        if os.path.exists(yolo_path):
            yolo_model = YOLO(yolo_path)
            use_yolo = True
            print(f"[OK] YOLO model loaded: {yolo_weights}")
            break
    if not use_yolo:
        yolo_model = YOLO("yolov8n.pt")
        use_yolo = True
        print("[OK] YOLO model loaded (downloaded)")
except Exception as e:
    print(f"[WARN] YOLO unavailable ({e}), using OpenCV HOG fallback for people counting.")
    hog = cv2.HOGDescriptor()
    hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())


# ─── Crowd update helpers (async, non-blocking) ──────────────────────────────
def _do_push_crowd(zone: str, people_count: int, density: str):
    """Push crowd data to Firebase + local backend in background."""
    # 1. Firebase Cloud Firestore
    try:
        firestore_url = (
            f"https://firestore.googleapis.com/v1/projects/{FIREBASE_PROJECT_ID}"
            f"/databases/(default)/documents/crowd_zones/{zone}"
        )
        payload = {
            "fields": {
                "zone": {"stringValue": zone},
                "name": {"stringValue": "Gate 1 (Ramkund)"},
                "people": {"integerValue": str(people_count)},
                "density": {"stringValue": density},
                "status": {"stringValue": "LIVE"},
                "updated_at": {"stringValue": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())},
            }
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(firestore_url, data=data,
                                     headers={"Content-Type": "application/json"}, method="PATCH")
        with urllib.request.urlopen(req, timeout=2.0) as resp:
            if resp.status == 200:
                print(f"🔥 [Firebase] {zone}: {people_count} people ({density})")
    except Exception as e:
        print(f"⚠️  Firebase sync: {e}")

    # 2. Local backend
    try:
        local_payload = json.dumps({"zone": zone, "people": people_count, "density": density}).encode("utf-8")
        req = urllib.request.Request(API_URL, data=local_payload,
                                     headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=0.8):
            pass
    except Exception:
        pass


def send_crowd_update(zone: str, people_count: int, density: str):
    threading.Thread(target=_do_push_crowd, args=(zone, people_count, density), daemon=True).start()


def get_density(count: int) -> str:
    if count <= 4:
        return "LOW"
    elif count <= 12:
        return "MODERATE"
    else:
        return "HIGH"


# ─── HUD drawing helpers ─────────────────────────────────────────────────────
def draw_corner_rect(img, pt1, pt2, color, thickness=2, corner_len=15):
    """Draws a modern high-tech bounding box with corner accents."""
    x1, y1 = pt1
    x2, y2 = pt2
    w = x2 - x1
    h = y2 - y1
    cl = min(corner_len, w // 4, h // 4)
    cv2.rectangle(img, (x1, y1), (x2, y2), color, 1)
    # Corners
    cv2.line(img, (x1, y1), (x1 + cl, y1), color, thickness)
    cv2.line(img, (x1, y1), (x1, y1 + cl), color, thickness)
    cv2.line(img, (x2, y1), (x2 - cl, y1), color, thickness)
    cv2.line(img, (x2, y1), (x2, y1 + cl), color, thickness)
    cv2.line(img, (x1, y2), (x1 + cl, y2), color, thickness)
    cv2.line(img, (x1, y2), (x1, y2 - cl), color, thickness)
    cv2.line(img, (x2, y2), (x2 - cl, y2), color, thickness)
    cv2.line(img, (x2, y2), (x2, y2 - cl), color, thickness)


# ─── Main combined loop ──────────────────────────────────────────────────────
def main():
    global current_zone_idx

    print("=" * 70)
    print("   KUMBH SARTHI — COMBINED AI: FACE DETECTION + PEOPLE COUNTING")
    print("=" * 70)
    print("  Face Engine : YuNet ONNX + SFace Deep Biometric Recognition")
    print("  Crowd Engine: YOLO Person Detector" if use_yolo else "  Crowd Engine: OpenCV HOG Fallback")
    print("  Hotkeys     : [Q] Quit | [S] Snapshot | [Z] Zone | [C] Cases-Only")
    print("=" * 70)

    # ── Open webcam (single shared capture) ──
    cap = None
    for cam_idx in [0, 1, 2]:
        if sys.platform.startswith("win"):
            test_cap = cv2.VideoCapture(cam_idx, cv2.CAP_DSHOW)
        else:
            test_cap = cv2.VideoCapture(cam_idx)
        if test_cap.isOpened():
            ret, _ = test_cap.read()
            if ret:
                cap = test_cap
                print(f"[OK] Webcam connected on camera index {cam_idx}")
                break
            else:
                test_cap.release()

    if cap is None:
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("[ERROR] Cannot access webcam. Ensure no other app is using it.")
            return

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    cap.set(cv2.CAP_PROP_FPS, 30)
    try:
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    except Exception:
        pass

    window_name = "Kumbh Sarthi — Combined AI (Face + Crowd)"
    cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
    cv2.resizeWindow(window_name, 1280, 720)

    snapshots_dir = os.path.join(BASE_DIR, "captures")
    os.makedirs(snapshots_dir, exist_ok=True)

    only_available_cases = False
    fps = 0.0
    frame_times = []
    last_crowd_send_time = 0
    last_sent_count = -1
    crowd_send_interval = 1.0

    print("\n[READY] Combined AI stream started. Press 'Q' to stop.\n")

    while True:
        t_start = time.time()
        ret, frame = cap.read()
        if not ret:
            print("[WARN] Failed to grab frame.")
            break

        frame = cv2.flip(frame, 1)
        h, w = frame.shape[:2]
        current_zone = ZONE_LIST[current_zone_idx]

        # ══════════════════════════════════════════════════════════════════════
        # 1) FACE DETECTION & RECOGNITION
        # ══════════════════════════════════════════════════════════════════════
        face_result = face_engine.detect_and_recognize(frame, zone=current_zone, only_cases=only_available_cases)
        faces = face_result.get("faces", [])
        detected_faces = len(faces)
        recognized_names = []

        for f in faces:
            x, y, fw, fh = f["x"], f["y"], f["width"], f["height"]
            name = f["name"]
            is_recognized = f["is_recognized"]
            confidence = f["confidence"] * 100.0
            is_missing = f.get("is_unsolved_case", False)
            is_officer = f.get("is_officer", False)

            if is_recognized:
                recognized_names.append(name)

            if is_missing:
                color = (0, 140, 255)   # Orange
            elif is_officer or is_recognized:
                color = (50, 230, 80)   # Emerald green
            else:
                color = (0, 215, 255)   # Gold

            draw_corner_rect(frame, (x, y), (x + fw, y + fh), color, thickness=2, corner_len=18)

            badge_text = f"{name} ({confidence:.0f}%)" if is_recognized else name
            (text_w, text_h), _ = cv2.getTextSize(badge_text, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            tag_y = max(24, y - 8)
            cv2.rectangle(frame, (x, tag_y - text_h - 6), (x + text_w + 12, tag_y + 2), (20, 25, 30), -1)
            cv2.rectangle(frame, (x, tag_y - text_h - 6), (x + text_w + 12, tag_y + 2), color, 1)
            cv2.putText(frame, badge_text, (x + 6, tag_y - 2), cv2.FONT_HERSHEY_SIMPLEX, 0.5,
                        (255, 255, 255) if is_recognized else (220, 220, 220), 1, cv2.LINE_AA)

        # ══════════════════════════════════════════════════════════════════════
        # 2) PEOPLE COUNTING (YOLO / HOG)
        # ══════════════════════════════════════════════════════════════════════
        people_count = 0
        if use_yolo and yolo_model is not None:
            results = yolo_model(frame, classes=[0], verbose=False, conf=0.4)
            for r in results:
                boxes = r.boxes
                people_count = len(boxes)
                for box in boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 180, 0), 2)  # Cyan-ish to distinguish from face boxes
                    cv2.putText(frame, "Person", (x1, max(20, y1 - 8)),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 180, 0), 1, cv2.LINE_AA)
        elif hog is not None:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            boxes_hog, _ = hog.detectMultiScale(gray, winStride=(8, 8), padding=(4, 4), scale=1.05)
            people_count = len(boxes_hog)
            for (bx, by, bw, bh) in boxes_hog:
                cv2.rectangle(frame, (bx, by), (bx + bw, by + bh), (255, 180, 0), 2)
                cv2.putText(frame, "Person", (bx, max(20, by - 8)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 180, 0), 1, cv2.LINE_AA)

        density = get_density(people_count)

        # ── Send crowd update periodically ──
        current_time = time.time()
        if (current_time - last_crowd_send_time >= crowd_send_interval) or \
           (people_count != last_sent_count and current_time - last_crowd_send_time >= 0.5):
            send_crowd_update(current_zone, people_count, density)
            last_sent_count = people_count
            last_crowd_send_time = current_time

        # ══════════════════════════════════════════════════════════════════════
        # 3) HUD OVERLAY
        # ══════════════════════════════════════════════════════════════════════

        # ── Top header bar ──
        header_h = 85
        overlay = frame.copy()
        cv2.rectangle(overlay, (0, 0), (w, header_h), (18, 22, 28), -1)
        cv2.addWeighted(overlay, 0.85, frame, 0.15, 0, frame)
        cv2.line(frame, (0, header_h), (w, header_h), (0, 180, 216), 2)

        # Brand
        cv2.putText(frame, "KUMBH SARTHI | COMBINED AI SURVEILLANCE",
                    (20, 26), cv2.FONT_HERSHEY_DUPLEX, 0.6, (0, 220, 255), 1, cv2.LINE_AA)

        # Zone + filter
        filter_label = "Cases Only" if only_available_cases else "All Faces"
        cv2.putText(frame, f"Zone: [{current_zone}]  |  Filter: {filter_label}",
                    (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.45,
                    (0, 230, 160) if only_available_cases else (200, 220, 240), 1, cv2.LINE_AA)

        # Density color coding
        density_color = (0, 200, 0) if density == "LOW" else ((0, 165, 255) if density == "MODERATE" else (0, 0, 220))

        # Right-side metrics
        cv2.putText(frame, f"Faces: {detected_faces}", (w - 380, 26),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55,
                    (0, 230, 100) if detected_faces > 0 else (180, 180, 180), 2, cv2.LINE_AA)
        cv2.putText(frame, f"People: {people_count}  |  Density: {density}", (w - 380, 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.50, density_color, 2, cv2.LINE_AA)

        # Recognition match line
        if recognized_names:
            alert_str = f"MATCH: {', '.join(set(recognized_names))}"
            cv2.putText(frame, alert_str, (w - 380, 74),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.50, (50, 255, 120), 2, cv2.LINE_AA)
        else:
            cv2.putText(frame, f"FPS: {fps:.1f} | YuNet + SFace + YOLO", (w - 380, 74),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.42, (140, 160, 180), 1, cv2.LINE_AA)

        # ── Bottom controls bar ──
        cv2.rectangle(frame, (0, h - 28), (w, h), (14, 18, 22), -1)
        cv2.putText(frame,
                    "Controls:  [Q] Exit  |  [C] Toggle Cases-Only  |  [S] Save Snapshot  |  [Z] Switch Zone",
                    (20, h - 9), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (170, 185, 200), 1, cv2.LINE_AA)

        cv2.imshow(window_name, frame)

        # ── Key handling ──
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q') or key == 27:
            print("\n[INFO] Exiting Combined Detection...")
            break
        elif key == ord('c'):
            only_available_cases = not only_available_cases
            print(f"[FILTER] Cases-Only: {'ENABLED' if only_available_cases else 'DISABLED'}")
        elif key == ord('s'):
            snap_path = os.path.join(snapshots_dir, f"combined_{int(time.time())}.jpg")
            cv2.imwrite(snap_path, frame)
            print(f"[SNAPSHOT] Saved: {snap_path}")
        elif key == ord('z'):
            current_zone_idx = (current_zone_idx + 1) % len(ZONE_LIST)
            print(f"[ZONE] Switched to: {ZONE_LIST[current_zone_idx]}")

        # FPS
        t_end = time.time()
        frame_times.append(t_end - t_start)
        if len(frame_times) > 15:
            frame_times.pop(0)
        if frame_times:
            fps = len(frame_times) / sum(frame_times)

    cap.release()
    cv2.destroyAllWindows()
    print("[STOPPED] Combined AI Detection closed.")


if __name__ == "__main__":
    main()
