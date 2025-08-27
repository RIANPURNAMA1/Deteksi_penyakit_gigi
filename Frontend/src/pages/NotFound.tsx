// src/pages/NotFound.tsx
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white text-center px-4">
      {/* Ilustrasi */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 500 500"
        className="w-64 h-64 animate-bounce"
      >
        <circle cx="250" cy="250" r="200" fill="#facc15" opacity="0.3" />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy=".3em"
          fontSize="120"
          fontWeight="bold"
          fill="#f59e0b"
        >
          404
        </text>
      </svg>

      {/* Judul */}
      <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mt-6">
        Oops! Halaman Tidak Ditemukan
      </h1>

      {/* Deskripsi */}
      <p className="text-gray-600 mt-3 max-w-md">
        Sepertinya kamu tersesat. Halaman yang kamu cari mungkin sudah dipindahkan atau dihapus.
      </p>

      {/* Tombol kembali */}
      <Link
        to="/"
        className="mt-6 inline-block bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-yellow-600 transition-all duration-300"
      >
        🔙 Kembali ke Beranda
      </Link>
    </div>
  );
}
