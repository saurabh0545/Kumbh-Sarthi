import cv2
import pickle
import numpy as np
import os
import sys
import time
import json
import urllib.request
import urllib.error

# Configuration
ZONE_LIST = ["Gate-A", "Gate-B", "Sangam Ghat", "Sector 3"]
current_zone_idx = 0
API_URL = os.getenv("FACE_API_URL", "http://127.0.0.1:8001/api/face/status")
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "face_model.pkl")

sys.path.insert(0, BASE_DIR)
try:
    from backend.face_engine import face_engine
except ImportError:
    from face_engine import face_engine

def load_face_cascade():
    return face_engine.face_cascade

def load_recognition_model():
    return face_engine

def draw_corner_rect(img, pt1, pt2, color, thickness=2, corner_len=15):
    """Draws a modern high-tech bounding box with corner accents."""
    x1, y1 = pt1
    x2, y2 = pt2
    w = x2 - x1
    h = y2 - y1
    cl = min(corner_len, w // 4, h // 4)

    # Base subtle bounding box
    cv2.rectangle(img, (x1, y1), (x2, y2), color, 1)

    # Top-Left corner
    cv2.line(img, (x1, y1), (x1 + cl, y1), color, thickness)
    cv2.line(img, (x1, y1), (x1, y1 + cl), color, thickness)

    # Top-Right corner
    cv2.line(img, (x2, y1), (x2 - cl, y1), color, thickness)
    cv2.line(img, (x2, y1), (x2, y1 + cl), color, thickness)

    # Bottom-Left corner
    cv2.line(img, (x1, y2), (x1 + cl, y2), color, thickness)
    cv2.line(img, (x1, y2), (x1, y2 - cl), color, thickness)

    # Bottom-Right corner
    cv2.line(img, (x2, y2), (x2 - cl, y2), color, thickness)
    cv2.line(img, (x2, y2), (x2, y2 - cl), color, thickness)

def main():
    global current_zone_idx
    print("=" * 70)
    print("      KUMBH SARTHI — REAL-TIME AI FACE DETECTION & RECOGNITION")
    print("=" * 70)
    print("  Engine    : OpenCV Haar Cascade + KNN Facial Classifier")
    print("  Hotkeys   : [q] Quit  |  [s] Save Snapshot  |  [z] Switch Zone")
    print("=" * 70)

    face_cascade = load_face_cascade()
    if face_cascade is None:
        print("[ERROR] Failed to load OpenCV Haar Cascade. Exiting.")
        return

    face_model = load_recognition_model()

    # Try opening webcam (testing index 0, then 1)
    cap = None
    for cam_idx in [0, 1, 2]:
        test_cap = cv2.VideoCapture(cam_idx, cv2.CAP_DSHOW) if sys.platform.startswith("win") else cv2.VideoCapture(cam_idx)
        if test_cap.isOpened():
            ret, _ = test_cap.read()
            if ret:
                cap = test_cap
                print(f"[OK] Webcam successfully connected on camera index {cam_idx}.")
                break
            else:
                test_cap.release()

    if cap is None:
        # Fallback standard VideoCapture
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("[ERROR] Cannot access webcam. Ensure no other application (like Zoom, Teams) is using it.")
            return

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    cap.set(cv2.CAP_PROP_FPS, 30)
    try:
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    except Exception:
        pass

    fps = 0.0
    frame_times = []
    window_name = "Kumbh Sarthi - Live AI Face Recognition Studio"
    cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
    cv2.resizeWindow(window_name, 1024, 600)

    snapshots_dir = os.path.join(BASE_DIR, "captures")
    os.makedirs(snapshots_dir, exist_ok=True)

    only_available_cases = False  # By default, detect and track all faces; highlight registered identities

    print("\n[READY] Camera stream started. Press 'q' inside the video window to stop.")
    print("[FILTER] Mode: 'Detect All Faces' is ACTIVE. [C] toggles Available Cases Only.")

    while True:
        t_start = time.time()
        ret, frame = cap.read()
        if not ret:
            print("[WARN] Failed to grab frame from camera stream.")
            break

        # Flip horizontally for natural mirror feel
        frame = cv2.flip(frame, 1)
        h, w = frame.shape[:2]
        current_zone = ZONE_LIST[current_zone_idx]
        result = face_engine.detect_and_recognize(frame, zone=current_zone, only_cases=only_available_cases)
        faces = result.get("faces", [])

        detected_count = len(faces)
        recognized_names = []

        for f in faces:
            x = f["x"]
            y = f["y"]
            fw = f["width"]
            fh = f["height"]
            name = f["name"]
            is_recognized = f["is_recognized"]
            confidence = f["confidence"] * 100.0
            is_missing = f.get("is_unsolved_case", False)
            is_officer = f.get("is_officer", False)

            if is_recognized:
                recognized_names.append(name)

            # Colors: Orange/Red for missing person found, Green for authorized identity, Gold for pilgrim
            if is_missing:
                color = (0, 140, 255)  # Orange BGR
            elif is_officer:
                color = (50, 230, 80)  # Emerald green BGR
            elif is_recognized:
                color = (50, 230, 80)  # Emerald green BGR
            else:
                color = (0, 215, 255)  # Gold BGR

            # Draw sleek HUD bounding box
            draw_corner_rect(frame, (x, y), (x + fw, y + fh), color, thickness=2, corner_len=18)

            # Draw tag banner above face
            badge_text = f"{name} ({confidence:.0f}%)" if is_recognized else f"{name}"
            (text_w, text_h), baseline = cv2.getTextSize(badge_text, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            tag_y = max(24, y - 8)
            cv2.rectangle(frame, (x, tag_y - text_h - 6), (x + text_w + 12, tag_y + 2), (20, 25, 30), -1)
            cv2.rectangle(frame, (x, tag_y - text_h - 6), (x + text_w + 12, tag_y + 2), color, 1)
            cv2.putText(
                frame,
                badge_text,
                (x + 6, tag_y - 2),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (255, 255, 255) if is_recognized else (220, 220, 220),
                1,
                cv2.LINE_AA
            )

        # ─── Top HUD Header ──────────────────────────────────────────────────
        current_zone = ZONE_LIST[current_zone_idx]
        header_h = 75
        cv2.rectangle(frame, (0, 0), (w, header_h), (18, 22, 28), -1)
        cv2.line(frame, (0, header_h), (w, header_h), (0, 180, 216), 2)

        # Brand Title
        cv2.putText(
            frame,
            "KUMBH SARTHI | AI FACE DETECTION & SURVEILLANCE",
            (20, 28),
            cv2.FONT_HERSHEY_DUPLEX,
            0.65,
            (0, 220, 255),
            1,
            cv2.LINE_AA
        )

        # Active Zone and Filter Badge
        filter_status = "🎯 Cases Only: ACTIVE" if only_available_cases else "👥 All Faces: ACTIVE"
        cv2.putText(
            frame,
            f"Sector: [{current_zone}]  |  {filter_status}",
            (20, 58),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.50,
            (0, 230, 160) if only_available_cases else (200, 220, 240),
            1,
            cv2.LINE_AA
        )

        # Faces Count Metric
        metric_str = f"Matches in Frame: {detected_count}" if only_available_cases else f"Faces in Frame: {detected_count}"
        count_color = (0, 230, 100) if detected_count > 0 else (180, 180, 180)
        cv2.putText(
            frame,
            metric_str,
            (w - 380, 28),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            count_color,
            2,
            cv2.LINE_AA
        )

        # Recognized alerts
        if recognized_names:
            alert_str = f"MATCH: {', '.join(set(recognized_names))}"
            cv2.putText(
                frame,
                alert_str,
                (w - 380, 58),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.55,
                (50, 255, 120),
                2,
                cv2.LINE_AA
            )
        else:
            cv2.putText(
                frame,
                f"FPS: {fps:.1f} | YuNet ONNX + SFace Deep AI",
                (w - 380, 58),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (140, 160, 180),
                1,
                cv2.LINE_AA
            )

        # Bottom Controls bar
        cv2.rectangle(frame, (0, h - 28), (w, h), (14, 18, 22), -1)
        cv2.putText(
            frame,
            "Controls:  [Q] Exit  |  [C] Toggle Cases-Only  |  [S] Save Snapshot  |  [Z] Switch Zone",
            (20, h - 9),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.45,
            (170, 185, 200),
            1,
            cv2.LINE_AA
        )

        cv2.imshow(window_name, frame)

        # Key handling
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q') or key == 27:  # 'q' or ESC
            print("\n[INFO] Exiting Face Detection...")
            break
        elif key == ord('c'):
            only_available_cases = not only_available_cases
            print(f"[FILTER] Cases-Only mode toggled: {'ENABLED' if only_available_cases else 'DISABLED'}")
        elif key == ord('s'):
            snap_path = os.path.join(snapshots_dir, f"face_scan_{int(time.time())}.jpg")
            cv2.imwrite(snap_path, frame)
            print(f"[SNAPSHOT] Saved snapshot to: {snap_path}")
        elif key == ord('z'):
            current_zone_idx = (current_zone_idx + 1) % len(ZONE_LIST)
            print(f"[ZONE] Switched surveillance zone to: {ZONE_LIST[current_zone_idx]}")

        # Compute FPS
        t_end = time.time()
        frame_times.append(t_end - t_start)
        if len(frame_times) > 15:
            frame_times.pop(0)
        if frame_times:
            fps = len(frame_times) / sum(frame_times)

    cap.release()
    cv2.destroyAllWindows()
    print("[STOPPED] Face Detection Camera closed successfully.")

if __name__ == "__main__":
    main()
