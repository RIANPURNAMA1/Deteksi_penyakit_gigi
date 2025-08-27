// src/pages/DeteksiPremium.tsx
import React, { useRef, useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import {
  FaUpload,
  FaCamera,
  FaVideo,
  FaRedo,
  FaTooth,
  FaCrown,
  FaWhatsapp,
  FaPaperPlane,
  FaBell,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { sendImageToApi, type DetectionDetail } from "../utils/detectionApi";
import { startCamera, stopCamera } from "../utils/cameraUtils";
import { speakDiagnosis } from "../utils/textToSpeech";
import { downloadDiagnosisAsPDF } from "../utils/downloadPdf";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import Swal from "sweetalert2";
import axios from "axios";
import { ChevronRight, Home } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const THRESHOLD = 0.1;

const DeteksiPremium: React.FC = () => {
  const navigate = useNavigate();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [resultImageSrc, setResultImageSrc] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [detectionDetails, setDetectionDetails] = useState<DetectionDetail[]>(
    []
  );

  const [hasNewDoctorNotes, setHasNewDoctorNotes] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // User state lengkap dengan name, age, gender
  const [user, setUser] = useState({
    name: "",
    age: "",
    gender: "",
    address: "",
  });
  const [description, setDescription] = useState("");
  const [sending, setSending] = useState(false);

  // Fetch konsultasi untuk cek notifikasi
  const fetchConsultationNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(
        "http://127.0.0.1:8000/api/consultations/user",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Cek apakah ada catatan dokter (doctor_notes tidak null)
      const hasNewNotes = res.data.some((c: any) => c.doctor_notes !== null);
      setHasNewDoctorNotes(hasNewNotes);
    } catch (err) {
      console.error("Gagal fetch notifikasi konsultasi:", err);
    }
  };

  useEffect(() => {
    fetchConsultationNotifications();

    // Bisa polling setiap 1 menit untuk update notifikasi
    const interval = setInterval(fetchConsultationNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Utility: Convert URL/Base64 ke Blob
  const urlToBlob = async (url: string) => {
    const res = await fetch(url);
    const blob = await res.blob();
    return blob;
  };

  //  Ambil data user yang login dari backend (mengisi name default dll)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:8000/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Gagal mengambil data user");
          return res.json();
        })
        .then((data) => {
          setUser({
            name: data.name || "",
            age: data.age ? String(data.age) : "",
            gender: data.gender || "",
            address: data.address || "",
          });
        })
        .catch((err) => {
          console.error("Error fetching user:", err);
        });
    }
  }, []);

  // Handler upload file gambar (input)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setImageSrc(file ? URL.createObjectURL(file) : null);
    setResultImageSrc(null);
    setDetectionDetails([]);
    setIsModalOpen(false);
  };

  // Capture photo dari kamera
  const capturePhoto = () => {
    if (!streaming || !videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx || !videoRef.current) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "capture.png", { type: "image/png" });
      setImageSrc(URL.createObjectURL(file));
      // panggil util untuk mengirim gambar ke API deteksi (server deteksi)
      await sendImageToApi(
        file,
        setResultImageSrc,
        setDetectionDetails,
        setIsModalOpen,
        setLoading
      );
      stopCamera(videoRef.current);
      setSelectedFile(null);
    }, "image/png");
  };

  // Reset semua state dan stop kamera
  const resetAll = () => {
    setSelectedFile(null);
    setImageSrc(null);
    setResultImageSrc(null);
    setDetectionDetails([]);
    setIsModalOpen(false);
    stopCamera(videoRef.current);
  };

  // Mulai kamera
  const onStartCamera = () => {
    startCamera(videoRef.current, setStreaming, () => {
      setDetectionDetails([]);
      setImageSrc(null);
      setResultImageSrc(null);
      setSelectedFile(null);
    });
  };

  // Filter hasil deteksi sesuai threshold
  const filteredDetections = detectionDetails.filter(
    (item) => item.value >= THRESHOLD
  );

  const mainDiagnosis = filteredDetections.length
    ? filteredDetections.reduce((prev, curr) =>
        prev.value > curr.value ? prev : curr
      )
    : null;

  // speak diagnosis tiap modal terbuka
  useEffect(() => {
    if (isModalOpen) speakDiagnosis(mainDiagnosis);
  }, [isModalOpen, mainDiagnosis]);

  // Chart data
  const chartData = {
    labels: detectionDetails.map((item) => item.label),
    datasets: [
      {
        label: "Detection Confidence",
        data: detectionDetails.map((item) => item.value),
        backgroundColor: detectionDetails.map((item) =>
          item.value >= 0.8
            ? "#16a34a"
            : item.value >= 0.5
            ? "#facc15"
            : "#f87171"
        ),
        borderRadius: 8,
        barThickness: 40,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Detection Confidence Chart",
        color: "#1e3a8a",
        font: { size: 20 },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) =>
            `${ctx.label}: ${(ctx.parsed.y * 100).toFixed(2)}%`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        ticks: {
          callback: (val: any) => `${(val * 100).toFixed(0)}%`,
          color: "#334155",
        },
        grid: { color: "#e2e8f0" },
      },
      x: {
        ticks: { color: "#334155" },
        grid: { color: "#f1f5f9" },
      },
    },
  };

  // ---------- KIRIM KONSULTASI KE BACKEND ----------
  const handleSendConsultation = async () => {
    setSending(true);

    if (!user.age || !user.gender || !description) {
      Swal.fire("Gagal", "Semua data harus diisi.", "error");
      setSending(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Gagal", "User tidak terautentikasi. Silakan login.", "error");
      setSending(false);
      return;
    }

    try {
      const formData = new FormData();
      // jika backend mengandalkan auth()->id(), tidak perlu kirim name; namun tidak papa mengirim
      formData.append("age", user.age);
      formData.append("gender", user.gender);
      formData.append("address", user.address);
      formData.append("description", description);
      formData.append("diagnosis", mainDiagnosis?.label || "");
      formData.append("confidence", String(mainDiagnosis?.value || 0));

      // jika ada PDF upload dari user
      if (pdfFile) {
        formData.append("diagnosis_pdf", pdfFile);
      }

      // Jika server ingin menerima gambar hasil deteksi juga, konversi resultImageSrc menjadi Blob
      if (resultImageSrc) {
        // resultImageSrc bisa berupa data URL atau hosted URL
        try {
          const blob = await urlToBlob(resultImageSrc);
          const imageFile = new File([blob], "result.png", {
            type: blob.type || "image/png",
          });
          formData.append("image", imageFile);
        } catch (err) {
          console.warn(
            "Gagal mengonversi resultImageSrc ke Blob, melewati pengiriman image.",
            err
          );
        }
      } else if (imageSrc && selectedFile) {
        // jika user upload image tapi belum di-detect, kita bisa lampirkan selectedFile
        formData.append("image", selectedFile);
      }

      const res = await fetch("http://localhost:8000/api/consultations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Content-Type jangan di-set karena body adalah FormData
        },
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Gagal mengirim konsultasi");
      }

      Swal.fire("Berhasil", "Konsultasi berhasil dikirim.", "success");
      // reset sebagian state
      setDescription("");
      setPdfFile(null);
      setResultImageSrc(null);
      setImageSrc(null);
      setDetectionDetails([]);
      setIsModalOpen(false);
    } catch (error) {
      console.error("handleSendConsultation error:", error);
      Swal.fire(
        "Gagal",
        "Terjadi kesalahan saat mengirim konsultasi.",
        "error"
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-10 space-y-12">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-600 mb-6">
          <Link to="/" className="flex items-center hover:text-blue-600">
            <Home size={16} className="mr-1" /> Home
          </Link>
          <ChevronRight size={14} className="mx-2 text-gray-400" />
          <span className="font-medium text-blue-600">Detections</span>
        </nav>
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-3 text-yellow-600 flex items-center justify-center gap-3">
            <FaCrown className="text-yellow-400 animate-pulse" /> Premium
            Detection
          </h1>
          <p className="text-gray-600 text-lg">
            Upload a dental image or use the camera for automatic detection.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row justify-center items-start gap-10 lg:px-[10rem]">
          {/* Upload & Camera Section */}
          <div className="flex-1 space-y-6">
            {/* Upload Box */}
            <div className="relative border-2 border-dashed border-yellow-400 rounded-2xl bg-white/30 backdrop-blur-lg shadow-xl hover:shadow-2xl transition duration-500 w-full h-72 flex items-center justify-center hover:scale-105">
              <label
                htmlFor="dropzone-file"
                className="cursor-pointer flex flex-col items-center"
              >
                <FaUpload className="text-5xl text-yellow-500 mb-3 animate-bounce" />
                <p className="text-yellow-700 font-semibold text-lg">
                  Upload Dental Image
                </p>
                <p className="text-xs text-gray-400">
                  Supported: PNG, JPG | Max: 5MB
                </p>
                <input
                  id="dropzone-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {imageSrc && (
                <img
                  src={imageSrc}
                  alt="Preview"
                  className="absolute inset-0 w-full h-full object-contain rounded-2xl opacity-95 shadow-inner"
                />
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() =>
                  selectedFile &&
                  sendImageToApi(
                    selectedFile,
                    setResultImageSrc,
                    setDetectionDetails,
                    setIsModalOpen,
                    setLoading
                  )
                }
                className="btn bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-semibold shadow-lg px-6 py-2 rounded-xl transform transition hover:-translate-y-1 hover:scale-105"
                disabled={loading || !selectedFile}
              >
                {loading ? (
                  "Detecting..."
                ) : (
                  <>
                    <FaUpload /> Detect
                  </>
                )}
              </button>

              <button
                onClick={onStartCamera}
                className="btn border border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white font-semibold shadow-lg px-6 py-2 rounded-xl transform transition hover:-translate-y-1 hover:scale-105"
                disabled={streaming}
              >
                <FaVideo /> Camera
              </button>

              <button
                onClick={capturePhoto}
                className="btn bg-green-500 hover:bg-green-600 text-white font-semibold shadow-lg px-6 py-2 rounded-xl transform transition hover:-translate-y-1 hover:scale-105"
                disabled={!streaming}
              >
                <FaCamera /> Capture
              </button>

              <button
                onClick={resetAll}
                className="btn bg-red-500 hover:bg-red-600 text-white font-semibold shadow-lg px-6 py-2 rounded-xl transform transition hover:-translate-y-1 hover:scale-105"
              >
                <FaRedo /> Reset
              </button>
            </div>

            {/* Video Preview */}
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`rounded-2xl border-4 border-yellow-400 shadow-lg ${
                streaming ? "block" : "hidden"
              }`}
              style={{
                maxWidth: "100%",
                maxHeight: "400px",
                boxShadow: "0 0 15px rgba(255, 205, 0, 0.6)",
              }}
            />
          </div>

          {/* Sidebar Right */}
          <div className="w-full lg:w-80 space-y-6 mt-[3rem]">
            <div className="bg-white rounded-2xl shadow-lg p-5 space-y-3 hover:shadow-2xl transition duration-500">
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="btn bg-green-500 hover:bg-green-600 text-white font-semibold shadow-md w-full rounded-xl transform transition hover:-translate-y-1 hover:scale-105"
              >
                <FaWhatsapp className="mr-2" /> Konsultasi via WhatsApp
              </a>

              <button
                type="button"
                className="relative btn bg-blue-500 hover:bg-blue-600 text-white w-full flex items-center justify-center gap-2 rounded-xl transform transition hover:-translate-y-1 hover:scale-105"
                onClick={() => navigate("/konsultasi")}
              >
                <FaTooth /> Lihat Riwayat Konsultasi
                {hasNewDoctorNotes && (
                  <FaBell
                    size={26}
                    className="absolute top-1 left-2 text-red-500 animate-bounce"
                  />
                )}
              </button>
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} />

        {isModalOpen && (
          <dialog className="modal modal-open p-0 bg-transparent">
            <div className="modal-box max-w-5xl p-6 bg-white rounded-3xl shadow-2xl overflow-hidden">
              <h3 className="font-bold text-2xl mb-6 text-yellow-600 flex items-center gap-2 justify-center">
                🦷 Premium Detection Results
              </h3>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Left Column: Form Konsultasi */}
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  <h4 className="text-lg font-semibold mb-2">
                    Kirim Konsultasi ke Dokter Gigi
                  </h4>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendConsultation();
                    }}
                    className="space-y-3"
                  >
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      value={user.name}
                      readOnly
                    />
                    <input
                      type="number"
                      placeholder="Usia"
                      className="input input-bordered w-full"
                      value={user.age}
                      onChange={(e) =>
                        setUser({ ...user, age: e.target.value })
                      }
                      required
                    />
                    <select
                      className="select select-bordered w-full"
                      value={user.gender}
                      onChange={(e) =>
                        setUser({ ...user, gender: e.target.value })
                      }
                      required
                    >
                      <option value="">Pilih Jenis Kelamin</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                    <textarea
                      placeholder="Alamat"
                      className="textarea textarea-bordered w-full"
                      value={user.address}
                      onChange={(e) =>
                        setUser({ ...user, address: e.target.value })
                      }
                      required
                    />
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      value={mainDiagnosis?.label || ""}
                      readOnly
                      placeholder="Hasil Diagnosa"
                    />
                    <textarea
                      className="textarea textarea-bordered w-full"
                      placeholder="Deskripsi keluhan"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-blue-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M8 2a2 2 0 00-2 2v12a2 2 0 002 2h4a2 2 0 002-2V7.414A2 2 0 0013.414 6L10 2.586A2 2 0 008 2z" />
                        </svg>
                        <span>Upload Hasil Diagnosa (PDF)</span>
                      </div>
                      <span className="block text-xs text-gray-500 mt-1">
                        <strong className="text-red-500">
                          * Pastikan file sudah diunduh terlebih dahulu
                        </strong>{" "}
                        sebelum mengunggah PDF hasil diagnosa.
                      </span>
                    </label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                      className="input input-bordered w-full"
                    />
                    <button
                      type="submit"
                      className="btn bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white w-full flex items-center justify-center gap-2 mt-2"
                      disabled={sending}
                    >
                      {sending ? (
                        "Mengirim..."
                      ) : (
                        <>
                          <FaPaperPlane /> Kirim Konsultasi
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Right Column: Hasil Deteksi */}
                <div className="space-y-4 max-h-[600px] overflow-y-auto flex flex-col items-center">
                  {resultImageSrc && (
                    <img
                      src={resultImageSrc}
                      alt="Result"
                      className="rounded-xl shadow-lg w-full max-h-64 object-contain"
                    />
                  )}
                  <Bar
                    data={chartData}
                    options={chartOptions}
                    className="w-full"
                  />
                  <div className="mt-2 w-full">
                    {mainDiagnosis ? (
                      <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 rounded-md shadow-md">
                        <p className="font-semibold">
                          Primary Diagnosis: {mainDiagnosis.label}
                        </p>
                        <p>
                          Confidence: {(mainDiagnosis.value * 100).toFixed(2)}%
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center">
                        Tidak ada diagnosis dengan confidence di atas threshold.
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3 mt-4 w-full">
                    <button
                      onClick={() =>
                        downloadDiagnosisAsPDF(mainDiagnosis, resultImageSrc)
                      }
                      className="btn border border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white flex-1"
                    >
                      📥 Download PDF
                    </button>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="btn btn-primary flex-1"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </dialog>
        )}
      </div>
    </div>
  );
};

export default DeteksiPremium;
