from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from ultralytics import YOLO
import cv2
from collections import Counter

app = Flask(__name__)
CORS(app)  # Enable CORS agar React frontend bisa akses API

UPLOAD_FOLDER = 'static/uploads'
RESULT_FOLDER = 'static/results'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)

# Load model YOLO untuk deteksi penyakit gigi
model_gigi = YOLO('penyakit_gigi.pt')

# Load model YOLO pre-trained untuk deteksi manusia
model_person = YOLO('yolov8n.pt')

@app.route('/detect', methods=['POST'])
def detect():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    filename = file.filename
    image_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(image_path)

    results = model_gigi.predict(source=image_path, conf=0.25, save=False)

    hasil_klasifikasi = []

    for r in results:
        class_ids = r.boxes.cls.cpu().numpy().astype(int)
        total_detections = len(class_ids)
        counter = Counter(class_ids)

        all_classes = model_gigi.names  # dict {class_id: class_name}

        if total_detections > 0:
            for class_id, class_name in all_classes.items():
                count = counter[class_id] if class_id in counter else 0
                percent = (count / total_detections) * 100
                hasil_klasifikasi.append(f"{class_name}: {percent:.2f}%")
        else:
            for class_id, class_name in all_classes.items():
                hasil_klasifikasi.append(f"{class_name}: 0.00%")

        # Simpan gambar hasil deteksi
        result_img = r.plot()
        result_filename = f"result_{filename}"
        result_path = os.path.join(RESULT_FOLDER, result_filename)
        cv2.imwrite(result_path, result_img)

    return jsonify({
        "result_image": f"/static/results/{result_filename}",
        "details": hasil_klasifikasi
    })


@app.route('/detect-human', methods=['POST'])
def detect_human():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files['image']
    filename = file.filename
    image_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(image_path)

    results = model_person.predict(source=image_path, conf=0.3, save=False)

    person_detected = False
    num_people = 0

    for r in results:
        class_ids = r.boxes.cls.cpu().numpy().astype(int)
        names = model_person.names
        person_detected = any(names[cls_id] == 'person' for cls_id in class_ids)
        num_people = sum(1 for cls_id in class_ids if names[cls_id] == 'person')

        # Simpan hasil deteksi ke gambar
        result_img = r.plot()
        result_filename = f"human_{filename}"
        result_path = os.path.join(RESULT_FOLDER, result_filename)
        cv2.imwrite(result_path, result_img)

    return jsonify({
        "person_detected": person_detected,
        "num_people": num_people,
        "result_image": f"/static/results/{result_filename}"
    })


@app.route('/static/results/<path:filename>')
def result_file(filename):
    return send_from_directory(RESULT_FOLDER, filename)

if __name__ == '__main__':
    app.run(debug=True)
