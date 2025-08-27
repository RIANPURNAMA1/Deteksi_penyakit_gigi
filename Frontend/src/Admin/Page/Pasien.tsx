import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUsers, FaBars, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

type Pasien = {
  id: number;
  name: string;
  age: number;
  gender: string;
  address: string;
  created_at?: string; // tambahkan jika data backend punya field tanggal
};

export default function DataPasien() {
  const [pasienData, setPasienData] = useState<Pasien[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState({
    day: "",
    month: "",
    year: "",
  });
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus pasien ini?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/consultations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPasienData((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Gagal hapus pasien:", err);
      alert("Gagal menghapus pasien");
    }
  };

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:8000/api/consultations", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const pasienList = res.data.map((c: any) => ({
          id: c.id,
          name: c.user?.name || "-",
          age: c.age || 0,
          gender: c.gender || "-",
          address: c.address || "-",
          created_at: c.created_at, // pastikan backend mengirimkan
        }));

        setPasienData(pasienList);
      } catch (err) {
        console.error("Gagal fetch pasien:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Filter pasien berdasarkan searchQuery + tanggal
  const filteredPasien = pasienData.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase());

    if (!p.created_at) return matchesSearch; // jika tanggal tidak ada, skip filter tanggal

    const patientDate = new Date(p.created_at);
    const matchesDay = filterDate.day ? patientDate.getDate() === Number(filterDate.day) : true;
    const matchesMonth = filterDate.month ? patientDate.getMonth() + 1 === Number(filterDate.month) : true;
    const matchesYear = filterDate.year ? patientDate.getFullYear() === Number(filterDate.year) : true;

    return matchesSearch && matchesDay && matchesMonth && matchesYear;
  });

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} handleLogout={handleLogout} />

      <main className="flex-1 p-4 md:p-6 w-full ">
        <div className="flex items-center justify-between mb-6 md:hidden sticky top-0 bg-gray-100 py-2 z-30">
          <h2 className="text-lg font-bold text-gray-700">Data Pasien</h2>
          <button onClick={() => setSidebarOpen(true)} className="text-yellow-500">
            <FaBars size={22} />
          </button>
        </div>

        <h2 className="text-2xl font-bold text-gray-700 mb-4 flex items-center gap-2">
          <FaUsers className="text-blue-500" /> Data Pasien
        </h2>

        {/* Filter Tanggal */}
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
          <div className="flex flex-col w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700">Hari</label>
            <input
              type="number"
              placeholder="DD"
              value={filterDate.day}
              onChange={(e) => setFilterDate({ ...filterDate, day: e.target.value })}
              className="input input-bordered w-full md:w-[80px]"
              min={1}
              max={31}
            />
          </div>
          <div className="flex flex-col w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700">Bulan</label>
            <input
              type="number"
              placeholder="MM"
              value={filterDate.month}
              onChange={(e) => setFilterDate({ ...filterDate, month: e.target.value })}
              className="input input-bordered w-full md:w-[80px]"
              min={1}
              max={12}
            />
          </div>
          <div className="flex flex-col w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700">Tahun</label>
            <input
              type="number"
              placeholder="YYYY"
              value={filterDate.year}
              onChange={(e) => setFilterDate({ ...filterDate, year: e.target.value })}
              className="input input-bordered w-full md:w-[100px]"
            />
          </div>
        </div>

        {/* Input Pencarian */}
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
          <div className="flex flex-col w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700">Pencarian</label>
            <input
              type="text"
              placeholder="Cari pasien..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered w-full md:w-[250px]"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-center">Loading data pasien...</p>
        ) : (
          <>
            {/* Table Desktop */}
            <div className="hidden md:block bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs uppercase sticky top-0 z-10 drop-shadow">
                  <tr>
                    <th className="px-6 py-3 text-center">No</th>
                    <th className="px-6 py-3 text-left">Nama</th>
                    <th className="px-6 py-3 text-center">Usia</th>
                    <th className="px-6 py-3 text-center">Jenis Kelamin</th>
                    <th className="px-6 py-3 text-left">Alamat</th>
                    <th className="px-6 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {filteredPasien.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-gray-500">
                        Tidak ada data pasien
                      </td>
                    </tr>
                  ) : (
                    filteredPasien.map((p, index) => (
                      <tr
                        key={p.id}
                        className={`transition duration-200 ${
                          index % 2 === 0 ? "bg-gray-50" : "bg-white"
                        } hover:bg-blue-50 hover:shadow-sm`}
                      >
                        <td className="px-6 py-3 text-center font-medium text-gray-600">
                          {index + 1}
                        </td>
                        <td className="px-6 py-3 font-semibold text-gray-800">{p.name}</td>
                        <td className="px-6 py-3 text-center">{p.age}</td>
                        <td className="px-6 py-3 text-center">
                          {p.gender === "Laki-laki" ? (
                            <span className="text-blue-600 font-medium">♂ {p.gender}</span>
                          ) : (
                            <span className="text-pink-600 font-medium">♀ {p.gender}</span>
                          )}
                        </td>
                        <td className="px-6 py-3">{p.address}</td>
                        <td className="px-6 py-3 text-center">
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 flex items-center gap-1 mx-auto shadow-sm"
                          >
                            <FaTrash className="h-4 w-4" /> Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Card Mobile */}
            <div className="md:hidden grid gap-4">
              {filteredPasien.length === 0 ? (
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200 text-center text-gray-500">
                  Tidak ada data pasien
                </div>
              ) : (
                filteredPasien.map((p, index) => (
                  <div
                    key={p.id}
                    className="bg-white p-4 rounded-lg shadow border border-gray-200"
                  >
                    <p className="font-bold text-gray-800 mb-2">
                      {index + 1}. {p.name}
                    </p>
                    <p className="text-sm text-gray-600">Umur: {p.age}</p>
                    <p className="text-sm text-gray-600">
                      Jenis Kelamin:{" "}
                      {p.gender === "Laki-laki" ? (
                        <span className="text-blue-600 font-medium">♂ {p.gender}</span>
                      ) : (
                        <span className="text-pink-600 font-medium">♀ {p.gender}</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">Alamat: {p.address}</p>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="mt-3 bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 flex items-center gap-1 shadow-sm"
                    >
                      <FaTrash /> Hapus
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
