import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import Sidebar from "./Sidebar";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

type Konsultasi = {
  id: number;
  user?: { name?: string } | null;
  age?: number;
  gender?: string;
  description?: string;
  address?: string;
  diagnosis?: string | null;
  diagnosis_pdf?: string | null;
  diagnosis_pdf_url?: string | null;
  doctor_notes?: string | null;
  treatment_recommendation?: string | null;
  appointment_date?: string | null;
  created_at?: string;
};

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Admin() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [konsultasiData, setKonsultasiData] = useState<Konsultasi[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:8000/api/consultations", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data: Konsultasi[] = res.data;
        const normalized = data.map((c) => ({
          ...c,
          diagnosis_pdf_url:
            c.diagnosis_pdf_url ??
            (c.diagnosis_pdf
              ? `http://localhost:8000/${c.diagnosis_pdf}`
              : null),
        }));

        setKonsultasiData(normalized);
      } catch (err) {
        console.error(err);
        alert("Gagal memuat data konsultasi");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // daftar penyakit dan warna
  const diseases = [
    { name: "Caries", color: "#f87171" },
    { name: "Calculus", color: "#60a5fa" },
    { name: "Gingivitis", color: "#34d399" },
    { name: "Abses", color: "#a78bfa" },
    { name: "Plaque", color: "#fbbf24" },
  ];

  // helper count penyakit
  const countByDiagnosis = (name: string) =>
    konsultasiData.filter(
      (k) => k.diagnosis?.toLowerCase() === name.toLowerCase()
    ).length;

  // bikin dataset otomatis
  const chartData = {
    labels: ["Jenis Penyakit"],
    datasets: diseases.map((d) => ({
      label: d.name,
      data: [countByDiagnosis(d.name)],
      backgroundColor: d.color,
    })),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false as const, // supaya bisa atur height custom
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      title: {
        display: true,
        text: "Jumlah Penyakit Gigi Menurut Jenis",
        font: { size: 16 },
      },
    },
    scales: {
      y: {
        title: { display: true, text: "Jumlah Kasus" },
        ticks: { precision: 0 },
      },
      x: {
        title: { display: true, text: "Kategori Penyakit" },
      },
    },
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleLogout={handleLogout}
      />

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 w-full">
        {/* Header mobile */}
        <div className="flex items-center justify-between mb-6 md:hidden sticky top-0 bg-gray-100 py-2 z-30">
          <h2 className="text-lg font-bold text-gray-700">Dashboard</h2>
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-yellow-500"
          >
            <FaBars size={22} />
          </button>
        </div>

        {/* Judul */}
        <h2 className="hidden md:block text-2xl font-bold text-gray-700 mb-6">
          Selamat Datang, Dokter 👋
        </h2>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Total Pasien */}
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-gray-500 text-sm">Total Pasien</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {loading ? "..." : konsultasiData.length}
            </p>
          </div>

          {/* Pemeriksaan */}
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-gray-500 text-sm">Hasil Pemeriksaan</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {loading
                ? "..."
                : konsultasiData.filter((k) => k.diagnosis && k.diagnosis !== "")
                    .length}
            </p>
          </div>

          {/* Caries */}
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-gray-500 text-sm">Caries</h3>
            <p className="text-2xl font-bold text-red-600">
              {loading ? "..." : countByDiagnosis("caries")}
            </p>
          </div>

          {/* Calculus */}
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-gray-500 text-sm">Calculus</h3>
            <p className="text-2xl font-bold text-blue-600">
              {loading ? "..." : countByDiagnosis("calculus")}
            </p>
          </div>

          {/* Gingivitis */}
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-gray-500 text-sm">Gingivitis</h3>
            <p className="text-2xl font-bold text-green-600">
              {loading ? "..." : countByDiagnosis("gingivitis")}
            </p>
          </div>

          {/* Abses */}
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-gray-500 text-sm">Abses</h3>
            <p className="text-2xl font-bold text-purple-600">
              {loading ? "..." : countByDiagnosis("abses")}
            </p>
          </div>

          {/* Plaque */}
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-gray-500 text-sm">Plaque</h3>
            <p className="text-2xl font-bold text-orange-600">
              {loading ? "..." : countByDiagnosis("plaque")}
            </p>
          </div>
        </div>

        {/* Grafik (lebih kecil) */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div style={{ height: "300px" }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </main>
    </div>
  );
}
