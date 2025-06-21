import sys
import torch
import json
from pathlib import Path
from ultralytics import YOLO
import cv2
import base64

# Baca argumen path image dari Laravel
image_path = sys.argv[1]

# Load model
model = YOLO("detection_model/penyakit_gigi.pt")

# Inference
results = model(image_path)

# Simpan hasil gambar
output_dir = Path("storage/app/public/results")
output_dir.mkdir(parents=True, exist_ok=True)
result_image_path = output_dir / f"result_{Path(image_path).name}"
annotated_frame = results[0].plot()
cv2.imwrite(str(result_image_path), annotated_frame)

# Ambil data deteksi
details = []
for box in results[0].boxes:
    cls_id = int(box.cls[0])
    conf = float(box.conf[0])
    label = model.names[cls_id]
    details.append({
        "label": label,
        "confidence": round(conf, 2)
    })

# Output ke Laravel dalam format JSON
output = {
    "result_image": f"storage/results/{result_image_path.name}",
    "details": details
}
print(json.dumps(output))
