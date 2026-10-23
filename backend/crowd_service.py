from ultralytics import YOLO

model = YOLO("yolo11n.pt")


def detect_people(frame, return_boxes: bool = False):
    if frame is None or frame.size == 0:
        if return_boxes:
            return 0, "LOW", []
        return 0, "LOW"

    results = model(
        frame,
        conf=0.35,
        classes=[0],
        verbose=False
    )

    boxes = []
    person_count = 0
    if len(results) > 0 and results[0].boxes is not None:
        person_count = len(results[0].boxes)
        if return_boxes:
            for b in results[0].boxes:
                xyxy = b.xyxy[0].cpu().numpy().astype(int).tolist()
                conf = float(b.conf[0].cpu().numpy())
                boxes.append({"bbox": xyxy, "conf": round(conf, 2)})

    if person_count < 20:
        density = "LOW"
    elif person_count < 50:
        density = "MEDIUM"
    else:
        density = "HIGH"

    if return_boxes:
        return person_count, density, boxes
    return person_count, density