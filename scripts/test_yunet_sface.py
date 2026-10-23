import pickle
import cv2
import numpy as np
import base64
import os

with open('face_registry.pkl', 'rb') as f:
    reg = pickle.load(f)

yunet = cv2.FaceDetectorYN.create('yunet.onnx', '', (320, 320), 0.5, 0.3, 500)
sface = cv2.FaceRecognizerSF.create('sface.onnx', '')

print("Testing YuNet + SFace on registered identities:")
for pid, d in reg.items():
    if pid.startswith('_'):
        continue
    name = d.get('name')
    photo_b64 = d.get('photo', '')
    if not photo_b64:
        print(f"[{pid}] {name}: No photo in registry (has {len(d.get('vectors', []))} legacy vectors)")
        continue
    raw = photo_b64.split(',', 1)[1] if ',' in photo_b64 else photo_b64
    img_bytes = base64.b64decode(raw)
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    h, w = img.shape[:2]
    yunet.setInputSize((w, h))
    _, faces = yunet.detect(img)
    face_count = 0 if faces is None else len(faces)
    print(f"[{pid}] {name}: img size {w}x{h}, YuNet detected {face_count} face(s)")
    if face_count > 0:
        face = faces[0]
        aligned = sface.alignCrop(img, face)
        feat = sface.feature(aligned)
        print(f"   -> Aligned shape: {aligned.shape}, SFace feature dim: {feat.shape}, norm: {np.linalg.norm(feat):.3f}")
