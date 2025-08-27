// src/pages/Konsultasi.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";

interface Consultation {
  id: number;
  age: number;
  gender: string;
  email: string;
  address: string;
  description: string;
  diagnosis: string;
  diagnosis_pdf: string;
  doctor_notes: string | null;
  treatment_recommendation?: string | null;
  appointment_date?: string | null;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

const Konsultasi: React.FC = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get<Consultation[]>(
        "http://127.0.0.1:8000/api/consultations/user",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const normalized = res.data.map((c) => ({
        ...c,
        diagnosis_pdf: c.diagnosis_pdf
          ? `http://127.0.0.1:8000/${c.diagnosis_pdf}`
          : "",
      }));

      setConsultations(normalized);
    } catch (err) {
      console.error("Gagal fetch konsultasi:", err);
      alert("Gagal memuat data konsultasi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-600 mb-6">
          <Link to="/" className="flex items-center hover:text-blue-600">
            <Home size={16} className="mr-1" /> Home
          </Link>
          <ChevronRight size={14} className="mx-2 text-gray-400" />
          <span className="font-medium text-blue-600">Konsultasi</span>
        </nav>

        <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-800">
          📋 Riwayat Konsultasi
        </h1>

        {loading ? (
          <p className="text-center text-gray-500 animate-pulse">
            Sedang memuat data...
          </p>
        ) : consultations.length === 0 ? (
          <p className="text-center text-gray-500">
            Belum ada data konsultasi.
          </p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow-md">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm uppercase">
                  <th className="py-3 px-4 text-left">Nama Pasien</th>
                  <th className="py-3 px-4 text-left">Umur</th>
                  <th className="py-3 px-4 text-left">Gender</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Alamat</th>
                  <th className="py-3 px-4 text-left">Deskripsi</th>
                  <th className="py-3 px-4 text-left">Diagnosis</th>
                  <th className="py-3 px-4 text-left">PDF</th>
                  <th className="py-3 px-4 text-left">Catatan Dokter</th>
                  <th className="py-3 px-4 text-left">Rekomendasi</th>
                  <th className="py-3 px-4 text-left">Jadwal</th>
                </tr>
              </thead>
              <tbody>
                {consultations.map((c, idx) => (
                  <tr
                    key={c.id}
                    className={`text-sm ${
                      idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-blue-50 transition`}
                  >
                    <td className="py-3 px-4 font-medium text-gray-800">
                      {c.user.name}
                    </td>
                    <td className="py-3 px-4">{c.age}</td>
                    <td className="py-3 px-4">{c.gender}</td>
                    <td className="py-3 px-4">{c.user.email}</td>
                    <td className="py-3 px-4">{c.address}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {c.description}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        {c.diagnosis}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {c.diagnosis_pdf ? (
                        <a
                          href={c.diagnosis_pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Lihat PDF
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {c.doctor_notes ? (
                        <span className="text-gray-700">{c.doctor_notes}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {c.treatment_recommendation ? (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          {c.treatment_recommendation}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {c.appointment_date ? (
                        <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-medium">
                          {c.appointment_date}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Konsultasi;
