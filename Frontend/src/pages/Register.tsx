import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"register" | "verify">("register"); // step pendaftaran
  const [loading, setLoading] = useState(false); // ⏳ state loading
  const [resendCooldown, setResendCooldown] = useState(0); // ⏲️ cooldown resend

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/register", { name, email, password });
      Swal.fire({
        title: "OTP Terkirim!",
        text: "Silakan cek email Anda untuk kode OTP.",
        icon: "info",
        confirmButtonText: "Lanjutkan",
      });
      setStep("verify");
    } catch (error: any) {
      Swal.fire({
        title: "Pendaftaran Gagal",
        text:
          error.response?.data?.message ||
          "Terjadi kesalahan saat mendaftar.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/verify-otp", { email, otp });
      localStorage.setItem("token", response.data.access_token);

      Swal.fire({
        title: "Verifikasi Berhasil!",
        text: `Selamat datang, ${response.data.user.name}`,
        icon: "success",
        confirmButtonText: "Lanjutkan",
      }).then(() => {
        navigate("/login");
      });
    } catch (error: any) {
      Swal.fire({
        title: "Verifikasi Gagal",
        text: error.response?.data?.message || "Kode OTP salah.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    try {
      await api.post("/resend-otp", { email });
      Swal.fire({
        title: "OTP Baru Dikirim",
        text: "Silakan cek email Anda.",
        icon: "info",
      });

      // Set cooldown 30 detik
      setResendCooldown(30);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      Swal.fire({
        title: "Gagal Kirim OTP",
        text: error.response?.data?.message || "Terjadi kesalahan.",
        icon: "error",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-600 px-4 py-10">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl">
        {step === "register" ? (
          <>
            <h2 className="text-3xl font-extrabold text-blue-800 text-center mb-4">
              Create Your Account
            </h2>
            <p className="text-sm text-center text-gray-500 mb-6">
              Start monitoring your dental health today
            </p>

            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Masukkan email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Daftar Sekarang"
                )}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-extrabold text-blue-800 text-center mb-4">
              Verifikasi OTP
            </h2>
            <p className="text-sm text-center text-gray-500 mb-6">
              Masukkan kode OTP yang dikirim ke email Anda
            </p>
            <form onSubmit={handleVerify} className="space-y-5">
              <input
                type="text"
                placeholder="Kode OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition duration-200 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  "Verifikasi Sekarang"
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={handleResendOtp}
                disabled={resendCooldown > 0}
                className={`text-blue-600 font-semibold hover:underline ${
                  resendCooldown > 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {resendCooldown > 0
                  ? `Kirim Ulang OTP (${resendCooldown}s)`
                  : "Kirim Ulang OTP"}
              </button>
            </div>
          </>
        )}

        <p className="mt-4 text-sm text-center text-gray-600">
          Sudah punya akun?{" "}
          <span
            className="text-blue-600 cursor-pointer hover:underline font-semibold"
            onClick={() => navigate("/login")}
          >
            Masuk di sini
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
