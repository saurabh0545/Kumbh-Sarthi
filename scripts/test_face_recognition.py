import os
import sys
import cv2
import json

# Ensure parent directory is on sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.face_engine import face_engine

def run_tests():
    print("=" * 65)
    print("  KUMBH SARTHI — FACE RECOGNITION VALIDATION SUITE")
    print("=" * 65)
    
    # 1. Engine & Model Status
    print("\n[1] Checking Subsystem Status:")
    print(f"    - YuNet Detector Available: {face_engine.yunet.detector is not None}")
    print(f"    - SFace Recognizer Available: {face_engine.sface.recognizer is not None}")
    print(f"    - Cascade Fallback Available: {face_engine.cascade_fallback.frontal_alt2 is not None}")
    print(f"    - Registered Identities Count: {len(face_engine.registry)}")
    print(f"    - Registered Classes: {face_engine.get_registered_classes()}")
    
    # 2. Inspect Registry Details
    print("\n[2] Registered Identity Profiles:")
    for pid, profile in face_engine.registry.items():
        if pid.startswith("_"):
            continue
        vecs = profile.get("vectors", [])
        v_shape = vecs[0].shape if len(vecs) > 0 else "None"
        print(f"    - ID: {pid} | Name: '{profile.get('name')}' | Type: {profile.get('type')} | Status: {profile.get('case_status')} | Vectors: {len(vecs)} (dim: {v_shape})")

    # 3. Test on Sample Images
    test_images = ["saurabh_0.jpg", "saurabh_5.jpg", "saurabh_20.jpg", "LF-2026-247.jpg", "LF-2026-495.jpg"]
    print("\n[3] Testing Inference on Dataset Images:")
    for img_name in test_images:
        img_path = os.path.join(BASE_DIR, img_name)
        if not os.path.exists(img_path):
            print(f"    [-] Missing file: {img_name}")
            continue
        
        img = cv2.imread(img_path)
        if img is None:
            print(f"    [-] Failed to decode: {img_name}")
            continue
            
        h, w = img.shape[:2]
        res_all = face_engine.detect_and_recognize(img, zone="Sangam Ghat", only_cases=False)
        res_cases = face_engine.detect_and_recognize(img, zone="Sangam Ghat", only_cases=True)
        
        print(f"\n    [+] Image: {img_name} ({w}x{h})")
        print(f"        • Detect All Mode (only_cases=False): {res_all['faces_count']} face(s) found")
        for f in res_all['faces']:
            rec_str = "RECOGNIZED" if f['is_recognized'] else "UNREGISTERED"
            print(f"          - Face: {f['name']} [{rec_str}] | Conf: {f['confidence']*100:.1f}% | Type: {f['person_type']} | Status: {f['case_status']} | Unsolved: {f['is_unsolved_case']}")
            
        print(f"        • Cases Only Mode (only_cases=True): {res_cases['faces_count']} unsolved case match(es)")
        for f in res_cases['faces']:
            print(f"          - Alert Target: {f['name']} | Conf: {f['confidence']*100:.1f}% | Status: {f['case_status']}")

    print("\n" + "=" * 65)
    print("  VALIDATION SUITE COMPLETED")
    print("=" * 65)

if __name__ == "__main__":
    run_tests()
