import React, { useRef, useState, useEffect } from "react";
import jsPDF from "jspdf";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
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
import {
  FaUpload,
  FaCamera,
  FaVideo,
  FaRedo,
  FaArrowLeft,
  FaTooth,
  FaCrown,
  FaWhatsapp,
} from "react-icons/fa";
import { sendImageToApi, type DetectionDetail } from "../utils/detectionApi";
import { startCamera, stopCamera } from "../utils/cameraUtils";
import { speakDiagnosis } from "../utils/textToSpeech";
import { downloadDiagnosisAsPDF } from "../utils/downloadPdf";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const THRESHOLD = 0.1;
const DeteksiPremium = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [resultImageSrc, setResultImageSrc] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [detectionDetails, setDetectionDetails] = useState<DetectionDetail[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setImageSrc(file ? URL.createObjectURL(file) : null);
    setResultImageSrc(null);
    setDetectionDetails([]);
    setIsModalOpen(false);
  };

  const capturePhoto = () => {
    if (!streaming || !videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (ctx) {
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], "capture.png", { type: "image/png" });
          setImageSrc(URL.createObjectURL(file));
          await sendImageToApi(file, setResultImageSrc, setDetectionDetails, setIsModalOpen, setLoading);
          stopCamera(videoRef.current);
          setSelectedFile(null);
        }
      }, "image/png");
    }
  };

  const resetAll = () => {
    setSelectedFile(null);
    setImageSrc(null);
    setResultImageSrc(null);
    setDetectionDetails([]);
    setIsModalOpen(false);
    stopCamera(videoRef.current);
  };

  const onStartCamera = () => {
    startCamera(videoRef.current, setStreaming, () => {
      setDetectionDetails([]);
      setImageSrc(null);
      setResultImageSrc(null);
      setSelectedFile(null);
    });
  };

  const filteredDetections = detectionDetails.filter((item) => item.value >= THRESHOLD);
  const mainDiagnosis = filteredDetections.length
    ? filteredDetections.reduce((prev, curr) => (prev.value > curr.value ? prev : curr))
    : null;

  useEffect(() => {
    if (isModalOpen) speakDiagnosis(mainDiagnosis);
  }, [isModalOpen, mainDiagnosis]);

  const chartData = {
    labels: detectionDetails.map((item) => item.label),
    datasets: [
      {
        label: "Detection Confidence",
        data: detectionDetails.map((item) => item.value),
        backgroundColor: detectionDetails.map((item) =>
          item.value >= 0.8 ? "#16a34a" : item.value >= 0.5 ? "#facc15" : "#f87171"
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
      title: { display: true, text: "Detection Confidence Chart", color: "#1e3a8a", font: { size: 20 } },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${ctx.label}: ${(ctx.parsed.y * 100).toFixed(2)}%`,
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
        grid: {
          color: "#e2e8f0",
        },
      },
      x: {
        ticks: {
          color: "#334155",
        },
        grid: {
          color: "#f1f5f9",
        },
      },
    },
  };

  return (
  <div className="bg-gradient-to-br from-blue-50 to-white min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-10 space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-3 text-yellow-600 flex items-center justify-center gap-3">
            <FaCrown className="text-yellow-400 animate-pulse" /> Premium Detection <FaTooth className="text-blue-500 text-3xl" />
          </h1>
          <p className="text-gray-600 text-lg">Upload a dental image or use the camera for automatic detection.</p>
        </div>

        <div className="flex flex-col lg:flex-row justify-center items-start gap-10 lg:px-[10rem]">
          <div className="flex-1 space-y-6">
            <div className="relative border-2 border-dashed border-yellow-400 rounded-xl bg-white shadow-xl hover:shadow-2xl transition duration-300 w-full h-64 flex items-center justify-center">
              <label htmlFor="dropzone-file" className="cursor-pointer flex flex-col items-center">
                <FaUpload className="text-4xl text-yellow-500 mb-2 animate-bounce" />
                <p className="text-yellow-700 font-semibold">Upload Dental Image</p>
                <p className="text-xs text-gray-400">Supported: PNG, JPG | Max: 5MB</p>
                <input id="dropzone-file" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
              {imageSrc && <img src={imageSrc} alt="Preview" className="absolute inset-0 w-full h-full object-contain rounded-xl opacity-90" />}
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={() => selectedFile && sendImageToApi(selectedFile, setResultImageSrc, setDetectionDetails, setIsModalOpen, setLoading)} className="btn bg-yellow-400 hover:bg-yellow-500 text-white font-semibold shadow-md px-6 py-2" disabled={loading || !selectedFile}>
                {loading ? "Detecting..." : <><FaUpload /> Detect</>}
              </button>
              <button onClick={onStartCamera} className="btn border border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white font-semibold shadow-md px-6 py-2" disabled={streaming}>
                <FaVideo /> Camera
              </button>
              <button onClick={capturePhoto} className="btn bg-green-500 hover:bg-green-600 text-white font-semibold shadow-md px-6 py-2" disabled={!streaming}>
                <FaCamera /> Capture
              </button>
              <button onClick={resetAll} className="btn bg-red-500 hover:bg-red-600 text-white font-semibold shadow-md px-6 py-2">
                <FaRedo /> Reset
              </button>
            </div>

            <video ref={videoRef} autoPlay muted playsInline className={`rounded-lg border border-gray-300 shadow-lg ${streaming ? "block" : "hidden"}`} style={{ maxWidth: "100%", maxHeight: "400px" }} />
          </div>

          <div className="w-full lg:w-80 space-y-3">
            <Link to="/" className="btn btn-outline text-yellow-600 border-yellow-500 hover:bg-yellow-500 hover:text-white w-full">
              <FaArrowLeft className="mr-2" /> Back to Home
            </Link>
            <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="btn bg-green-500 hover:bg-green-600 text-white font-semibold shadow-md w-full">
              <FaWhatsapp className="mr-2" /> Konsultasi via WhatsApp
            </a>
          </div>
        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} />

        {isModalOpen && (
          <dialog className="modal modal-open">
            <div className="modal-box max-w-3xl">
              <h3 className="font-bold text-2xl mb-4 text-yellow-600">🦷 Premium Detection Results</h3>
              {resultImageSrc && <img src={resultImageSrc} alt="Result" className="mx-auto rounded-md shadow mb-6 max-h-80" />}
              <Bar data={chartData} options={chartOptions} />
              <div className="mt-4 text-center">
                {mainDiagnosis && (
                  <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 rounded-md">
                    <p className="font-semibold">Primary Diagnosis: {mainDiagnosis.label}</p>
                    <p>Confidence: {(mainDiagnosis.value * 100).toFixed(2)}%</p>
                  </div>
                )}
              </div>
              <div className="modal-action">
                <button onClick={() => downloadDiagnosisAsPDF(mainDiagnosis, resultImageSrc)} className="btn border border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white">
                  📥 Download PDF
                </button>
                <button onClick={() => setIsModalOpen(false)} className="btn btn-primary">Close</button>
              </div>
            </div>
          </dialog>
        )}
      </div>
    </div>
  );
};

export default DeteksiPremium;
