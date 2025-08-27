import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  FaTooth,
  FaUsers,
  FaChartBar,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaEdit,
  FaSave,
  FaTimesCircle,
  FaUserMd,
  FaVoicemail,
  FaEnvelope,
  FaClipboardCheck,
  FaFilePdf,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Konsultasi from "../../pages/Konsultasi";
import Sidebar from "./Sidebar";

type Konsultasi = {
  id: number;
  user?: { name?: string } | null;
  age?: number;
  gender?: string;
  description?: string;
  address?: string;
  diagnosis?: string | null;
  diagnosis_pdf?: string | null; // path relatif dari backend
  diagnosis_pdf_url?: string | null; // url absolut jika backend sudah sediakan
  doctor_notes?: string | null;
  treatment_recommendation?: string | null;
  appointment_date?: string | null; // "YYYY-MM-DD"
  created_at?: string;
};

export default function HasilPemeriksaan() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [konsultasiData, setKonsultasiData] = useState<Konsultasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  // Filter date range
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] =
    useState<Konsultasi | null>(null);

  const [doctorNoteDraft, setDoctorNoteDraft] = useState("");
  const [treatmentRecommendationDraft, setTreatmentRecommendationDraft] =
    useState("");
  const [appointmentDateDraft, setAppointmentDateDraft] = useState(""); // YYYY-MM-DD

  const [savingNote, setSavingNote] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Set the number of items per page

  const navigate = useNavigate();

  // Helper buat bikin URL PDF kalau backend hanya kirim path relatif
  const toPdfUrl = (c: Konsultasi) => {
    if (c.diagnosis_pdf_url) return c.diagnosis_pdf_url;
    if (c.diagnosis_pdf) {
      // Sesuaikan base URL API kamu
      return `http://localhost:8000/${c.diagnosis_pdf}`;
    }
    return null;
  };

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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data: Konsultasi[] = res.data;

        // Normalisasi data: tambahkan field diagnosis_pdf_url jika perlu
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

  const sendEmail = async (consultation: Konsultasi) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("User tidak terautentikasi");

    try {
      Swal.fire({
        title: "Mengirim email...",
        didOpen: () => Swal.showLoading(),
      });

      const res = await axios.post(
        `http://localhost:8000/api/consultations/${consultation.id}/send-email`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Swal.close();
      Swal.fire("Berhasil", res.data.message, "success");
    } catch (err: any) {
      Swal.close();
      console.error(err);
      Swal.fire(
        "Gagal",
        err?.response?.data?.message || "Gagal mengirim email",
        "error"
      );
    }
  };

  // Open modal untuk tambah/edit catatan dokter
  const openDoctorNoteModal = (consultation: Konsultasi) => {
    setSelectedConsultation(consultation);
    setDoctorNoteDraft(consultation?.doctor_notes || "");
    setTreatmentRecommendationDraft(
      consultation?.treatment_recommendation || ""
    );
    // pastikan formatnya YYYY-MM-DD agar cocok dengan input type="date"
    setAppointmentDateDraft(
      (consultation?.appointment_date || "").slice(0, 10)
    );
    setModalOpen(true);
  };

  // Close modal dan reset
  const closeDoctorNoteModal = () => {
    setModalOpen(false);
    setSelectedConsultation(null);
    setDoctorNoteDraft("");
    setTreatmentRecommendationDraft("");
    setAppointmentDateDraft("");
    setSavingNote(false);
  };

  // Save doctor note + treatment + appointment date ke backend
  const saveDoctorNote = async () => {
    if (!selectedConsultation) return;
    const id = selectedConsultation.id;
    const token = localStorage.getItem("token");

    if (!token) {
      alert("User   tidak terautentikasi");
      return;
    }

    try {
      setSavingNote(true);

      const payload = {
        doctor_notes: doctorNoteDraft,
        treatment_recommendation: treatmentRecommendationDraft,
        appointment_date: appointmentDateDraft || null,
      };

      const res = await axios.post(
        `http://localhost:8000/api/consultations/${id}/doctor-note`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data?.consultation) {
        const updated: Konsultasi = res.data.consultation;
        setKonsultasiData((prev) =>
          prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
        );
      }

      Swal.fire("Berhasil", "Data berhasil disimpan", "success");
      closeDoctorNoteModal();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Gagal menyimpan data");
    } finally {
      setSavingNote(false);
    }
  };

  // Hapus doctor note + rekomendasi + tanggal (set null)
  const deleteDoctorNote = async () => {
    if (!selectedConsultation) return;
    const id = selectedConsultation.id;
    const token = localStorage.getItem("token");

    const confirm = await Swal.fire({
      title: "Hapus catatan?",
      text: "Catatan dokter, rekomendasi, dan tanggal kunjungan akan dikosongkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });
    if (!confirm.isConfirmed) return;

    try {
      setSavingNote(true);

      // Pastikan route backend kamu menggunakan DELETE
      const res = await axios.post(
        `http://localhost:8000/api/consultations/${id}/doctor-note`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.consultation) {
        const updated: Konsultasi = res.data.consultation;
        setKonsultasiData((prev) =>
          prev.map((c) =>
            c.id === id
              ? {
                  ...c,
                  doctor_notes: null,
                  treatment_recommendation: null,
                  appointment_date: null,
                }
              : c
          )
        );
      }

      Swal.fire("Berhasil", "Data berhasil dihapus", "success");
      closeDoctorNoteModal();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Gagal menghapus data");
    } finally {
      setSavingNote(false);
    }
  };

  // Calculate the current consultations to display
  const indexOfLastConsultation = currentPage * itemsPerPage;
  const indexOfFirstConsultation = indexOfLastConsultation - itemsPerPage;
  const currentConsultations = konsultasiData
    .filter((consultation) => {
      const nameMatch =
        consultation.user?.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) || false;
      const descriptionMatch =
        consultation.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) || false;
      const diagnosisMatch =
        consultation.diagnosis
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) || false;

      // Filter berdasarkan tanggal created_at
      const consultationDate = consultation.created_at
        ? new Date(consultation.created_at)
        : null;

      let isWithinDateRange = true;
      if (startDate && consultationDate) {
        isWithinDateRange = consultationDate >= new Date(startDate);
      }
      if (endDate && consultationDate) {
        // Tambahkan 1 hari ke endDate agar inklusif
        const adjustedEndDate = new Date(endDate);
        adjustedEndDate.setHours(23, 59, 59, 999);
        isWithinDateRange =
          isWithinDateRange && consultationDate <= adjustedEndDate;
      }

      return (
        (nameMatch || descriptionMatch || diagnosisMatch) && isWithinDateRange
      );
    })
    .slice(indexOfFirstConsultation, indexOfLastConsultation);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Total pages
  const totalPages = Math.ceil(konsultasiData.length / itemsPerPage);

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

        <h2 className="hidden md:flex items-center text-2xl font-bold text-gray-700 mb-6 gap-2">
          <FaClipboardCheck className="text-blue-600" />
          Halaman Hasil Pemeriksaan
        </h2>

        {/* Filter */}
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
          {/* Search Input */}
          <div className="flex flex-col w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700">
              Pencarian
            </label>
            <input
              type="text"
              placeholder="Cari pasien..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered w-full md:w-[250px]"
            />
          </div>

          {/* Dari Tanggal */}
          <div className="flex flex-col w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>

          {/* Sampai Tanggal */}
          <div className="flex flex-col w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
        </div>

        {/* Table untuk desktop */}
        <div className="hidden md:block bg-white rounded-xl shadow-lg overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            {/* Header */}
            <thead className="bg-gradient-to-r from-blue-600 to-blue-500 text-white sticky top-0 z-10 drop-shadow">
              <tr>
                <th className="p-3  text-center">No</th>
                <th className="p-3 border-b text-left">Nama Pasien</th>
                <th className="p-3 border-b text-center">Umur</th>
                <th className="p-3 border-b text-center">Gender</th>
                <th className="p-3 border-b text-left">Alamat</th>
                <th className="p-3 border-b text-left">Keterangan</th>
                <th className="p-3 border-b text-left">Hasil Diagnosa</th>
                <th className="p-3 border-b text-center">File PDF</th>
                <th className="p-3 border-b text-left">Catatan Dokter</th>
                <th className="p-3 border-b text-left">Rekomendasi</th>
                <th className="p-3 border-b text-center">Jadwal</th>
                <th className="p-3 border-b text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={12} className="text-center p-6 text-gray-500">
                    Loading data...
                  </td>
                </tr>
              ) : currentConsultations.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center p-6 text-gray-500">
                    Tidak ada data konsultasi
                  </td>
                </tr>
              ) : (
                currentConsultations.map((konsultasi, idx) => (
                  <tr
                    key={konsultasi.id}
                    className={`transition duration-200 ${
                      idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-blue-50 hover:shadow-sm`}
                  >
                    {/* No */}
                    <td className="p-3  text-center font-medium text-gray-600">
                      {indexOfFirstConsultation + idx + 1}
                    </td>

                    {/* Nama */}
                    <td className="p-3  font-semibold">
                      {konsultasi.user?.name}
                    </td>

                    {/* Umur */}
                    <td className="p-3  text-center">
                      {konsultasi.age}
                    </td>

                    {/* Gender */}
                    <td className="p-3  text-center">
                      {konsultasi.gender === "Laki-laki" ? (
                        <span className="inline-flex items-center gap-1 text-blue-600 font-medium">
                          ♂ {konsultasi.gender}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-pink-600 font-medium">
                          ♀ {konsultasi.gender}
                        </span>
                      )}
                    </td>

                    {/* Alamat */}
                    <td className="p-3 ">{konsultasi.address}</td>

                    {/* Keterangan */}
                    <td className="p-3  text-gray-600">
                      {konsultasi.description || (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    {/* Diagnosa */}
                    <td className="p-3 ">
                      {konsultasi.diagnosis ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          {konsultasi.diagnosis}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    {/* PDF */}
                    <td className="p-3  text-center">
                      {toPdfUrl(konsultasi) ? (
                        <a
                          href={toPdfUrl(konsultasi)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 justify-center text-blue-600 hover:underline"
                        >
                          <FaFilePdf className="h-4 w-4 text-red-500" /> Lihat
                        </a>
                      ) : (
                        <span className="text-gray-400">Tidak ada</span>
                      )}
                    </td>

                    {/* Catatan Dokter */}
                    <td className="p-3  text-gray-700">
                      {konsultasi.doctor_notes || (
                        <span className="text-gray-400">Belum ada</span>
                      )}
                    </td>

                    {/* Rekomendasi */}
                    <td className="p-3  text-gray-700">
                      {konsultasi.treatment_recommendation || (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    {/* Jadwal */}
                    <td className="p-3  text-center">
                      {konsultasi.appointment_date ? (
                        <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                          {new Date(
                            konsultasi.appointment_date + "T00:00:00"
                          ).toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="p-3 ">
                      <div className="flex  gap-2 justify-center">
                        {/* Edit Catatan */}
                        <button
                          onClick={() => openDoctorNoteModal(konsultasi)}
                          className="flex items-center gap-1 px-3 py-1 text-sm rounded-md bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                        >
                          <FaEdit className="h-4 w-4" />{" "}
                          {konsultasi.doctor_notes ? "Edit" : "Tambah"}
                        </button>

                        {/* Kirim Email */}
                        <button
                          onClick={() => sendEmail(konsultasi)}
                          className="flex items-center gap-1 px-3 py-1 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600"
                        >
                          <FaEnvelope className="h-4 w-4" /> Kirim
                        </button>

                        {/* Hapus */}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className=" hidden md:block justify-center mt-4 ">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => paginate(index + 1)}
              className={`mx-1 px-3 py-1 rounded ${
                currentPage === index + 1
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {/* Card list untuk mobile */}
        <div className="md:hidden grid gap-4">
          <div className="md:hidden space-y-4">
            {loading ? (
              <p className="text-center">Loading data...</p>
            ) : currentConsultations.length === 0 ? (
              <p className="text-center">Tidak ada data konsultasi</p>
            ) : (
              currentConsultations.map((konsultasi) => (
                <div
                  key={konsultasi.id}
                  className="bg-white p-4 rounded-lg shadow"
                >
                  <p className="font-bold text-gray-800">
                    {konsultasi.user?.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Umur: {konsultasi.age}
                  </p>
                  <p className="text-sm text-gray-500">
                    Diagnosis: {konsultasi.diagnosis || "-"}
                  </p>
                  {toPdfUrl(konsultasi) ? (
                    <p className="text-sm">
                      <a
                        href={toPdfUrl(konsultasi)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Lihat Laporan Hasil Pemeriksaan
                      </a>
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">Tidak ada file PDF</p>
                  )}
                  <p className="text-sm mt-2">
                    <strong>Catatan Dokter:</strong>
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    {konsultasi.doctor_notes || (
                      <span className="text-gray-400">Belum ada</span>
                    )}
                  </p>
                  <p className="text-sm mt-2">
                    <strong>Rekomendasi:</strong>
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    {konsultasi.treatment_recommendation || (
                      <span className="text-gray-400">-</span>
                    )}
                  </p>
                  <p className="text-sm mt-2">
                    <strong>Jadwal Kunjungan:</strong>{" "}
                    {konsultasi.appointment_date ? (
                      new Date(
                        konsultasi.appointment_date + "T00:00:00"
                      ).toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </p>

                  <button
                    onClick={() => openDoctorNoteModal(konsultasi)}
                    className="text-sm text-yellow-600 underline"
                  >
                    Tambah/Edit
                  </button>
                  <button
                    onClick={() => sendEmail(konsultasi)}
                    className="mt-2 text-sm text-blue-600 underline"
                  >
                    Kirim Email Hasil Konsultasi
                  </button>

                  <p className="text-sm text-gray-500 mt-3">
                    Tanggal:{" "}
                    {konsultasi.created_at
                      ? new Date(konsultasi.created_at).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Modal responsif */}
      {modalOpen && selectedConsultation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-40">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6 shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Catatan Dokter — {selectedConsultation.user?.name}
              </h3>
              <button
                onClick={closeDoctorNoteModal}
                className="text-red-500 hover:text-red-700"
                aria-label="Tutup"
              >
                <FaTimesCircle size={20} />
              </button>
            </div>

            {/* Input Catatan Dokter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Isi Keterangan / Saran
              </label>
              <textarea
                value={doctorNoteDraft}
                onChange={(e) => setDoctorNoteDraft(e.target.value)}
                className="w-full textarea textarea-bordered h-36"
                placeholder="Tulis keterangan, saran, rekomendasi atau tindakan..."
              />
            </div>

            {/* Input Rekomendasi Perawatan */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rekomendasi Perawatan
              </label>
              <textarea
                value={treatmentRecommendationDraft}
                onChange={(e) =>
                  setTreatmentRecommendationDraft(e.target.value)
                }
                className="w-full textarea textarea-bordered h-28"
                placeholder="Contoh: Scaling gigi dalam 2 minggu, sikat gigi 2x/hari, obat kumur antiseptik 2x/hari..."
              />
            </div>

            {/* Input Tanggal Kunjungan */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Kunjungan Puskesmas
              </label>
              <input
                type="date"
                value={appointmentDateDraft}
                onChange={(e) => setAppointmentDateDraft(e.target.value)}
                className="input input-bordered w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Opsional. Biarkan kosong jika belum dijadwalkan.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <button onClick={closeDoctorNoteModal} className="btn btn-ghost">
                Batal
              </button>

              <div className="flex gap-3">
                {(selectedConsultation.doctor_notes ||
                  selectedConsultation.treatment_recommendation ||
                  selectedConsultation.appointment_date) && (
                  <button
                    onClick={deleteDoctorNote}
                    disabled={savingNote}
                    className="btn bg-red-500 hover:bg-red-600 text-white"
                  >
                    {savingNote ? "Menghapus..." : "Hapus Data"}
                  </button>
                )}

                <button
                  onClick={saveDoctorNote}
                  disabled={savingNote}
                  className="btn bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  {savingNote ? (
                    "Menyimpan..."
                  ) : (
                    <>
                      <FaSave className="mr-2" /> Simpan
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
