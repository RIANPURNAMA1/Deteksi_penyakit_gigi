import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaTooth, FaSearch, FaCrown, FaHeartbeat, FaUserMd, FaAmbulance } from "react-icons/fa";
import Images from "../assets/images/dokter-gigi.jpg";
import Swal from "sweetalert2";

// ⛑️ Tambahkan deklarasi untuk TypeScript
declare global {
  interface Window {
    snap: any;
  }
}

const HeroSection = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const premiumStatus = localStorage.getItem("isPremium");
    if (premiumStatus === "true") {
      setIsPremium(true);
    }
  }, []);

  const isLoggedIn = () => {
    return localStorage.getItem("token") !== null;
  };

  const handleNavigation = async (path: string) => {
    if (!isLoggedIn()) {
      setShowModal(true);
      return;
    }

    if (path === "/premium") {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8000/api/user/status", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.isPremium) {
          setIsPremium(true);
          navigate("/premium");
        } else {
          setIsPremium(false);
          setShowPremiumModal(true);
        }
      } catch (error) {
        console.error("Gagal cek status premium:", error);
        Swal.fire("Gagal", "Gagal mengecek status premium", "error");
      }

      return;
    }

    navigate(path);
  };

  const handleBuyNow = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/midtrans/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ amount: 29000 }),
      });

      const data = await response.json();

      if (!data.token) {
        throw new Error("Token tidak ditemukan di response.");
      }

      if (!window.snap) {
        Swal.fire(
          "Error",
          "Midtrans Snap belum dimuat. Coba refresh halaman.",
          "error"
        );
        return;
      }

      window.snap.pay(data.token, {
        onSuccess: async () => {
          await fetch("http://localhost:8000/api/user/premium/activate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          setIsPremium(true);
          Swal.fire({
            icon: "success",
            title: "Pembayaran Berhasil 🎉",
            text: "Premium telah aktif!",
          }).then(() => {
            navigate("/premium");
          });
        },
        onPending: () =>
          Swal.fire(
            "Menunggu Konfirmasi",
            "Pembayaran sedang diproses ⏳",
            "info"
          ),
        onError: () =>
          Swal.fire("Gagal", "Terjadi kesalahan dalam pembayaran ❌", "error"),
        onClose: () =>
          Swal.fire(
            "Ditutup",
            "Kamu menutup popup sebelum menyelesaikan ❗",
            "warning"
          ),
      });
    } catch (err: any) {
      Swal.fire(
        "Gagal",
        "Gagal memproses pembayaran Midtrans: " + err.message,
        "error"
      );
    }
  };

  return (
    <div className="bg-gradient-to-b from-blue-900 to-blue-600 min-h-screen py-16 px-6 lg:px-20 text-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-6">
          <span className="bg-white text-blue-800 px-4 py-1 rounded-full font-semibold text-sm tracking-wide">
            Trusted Medical
          </span>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Smart Detection,{" "}
            <span className="text-blue-300">Healthier Smiles</span>
          </h1>
          <p className="text-lg text-gray-200">
            Diagnose various dental diseases quickly and accurately with our
            AI-powered detection system using YOLOv8 technologies.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => handleNavigation("/deteksi")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-base flex items-center gap-2"
            >
              <FaHeartbeat /> Start Detection Free
            </button>
            <button
              onClick={() => handleNavigation("/premium")}
              className="bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-3 rounded-lg text-base flex items-center gap-2"
            >
              <FaCrown /> Premium
            </button>
          </div>
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8">
  <div className="group bg-gradient-to-tr from-blue-50 to-white p-6 rounded-xl shadow hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-blue-100">
    <div className="flex items-start gap-4">
      <div>
      <div className="bg-blue-100 p-3 rounded-full flex justify-center text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition">
        <FaAmbulance className="text-2xl" />
      </div>
        <h4 className="font-bold text-lg text-blue-800 group-hover:text-blue-600 transition">24/7 Emergency Services</h4>
        <p className="text-[13px] text-gray-600 mt-1">
          We're here for you any time, any day, to handle urgent dental care needs with priority.
        </p>
      </div>
    </div>
  </div>


  <div className="group bg-gradient-to-tr from-blue-50 to-white p-6 rounded-xl shadow hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-blue-100">
    <div className="flex items-start gap-4">
      <div>
      <div className="bg-blue-100 p-3 rounded-full flex justify-center text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition">
        <FaUserMd className="text-2xl" />
      </div>
        <h4 className="font-bold text-lg text-blue-800 group-hover:text-blue-600 transition">Skilled Medical Professionals</h4>
        <p className="text-[13px] text-gray-600 mt-1">
          Our experienced dental doctors are committed to providing safe and effective treatments.
        </p>
      </div>
    </div>
  </div>
</div>
        </div>
        <div className="flex justify-center">
          <img
            src={Images}
            alt="Dentist"
            className="w-full max-w-lg rounded-xl shadow-2xl"
          />
        </div>
      </div>

      {showModal && (
        <dialog open className="modal modal-open">
          <div className="modal-box text-center">
            <h3 className="font-bold text-lg text-red-600">🔒 Access Denied</h3>
            <p className="py-4 text-blue-600">Please log in to use this feature.</p>
            <div className="modal-action justify-center">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowModal(false);
                  navigate("/login");
                }}
              >
                Log In Now
              </button>
              <button className="btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </dialog>
      )}

      {showPremiumModal && (
        <dialog open className="modal modal-open">
          <div className="modal-box max-w-3xl bg-white text-blue-900 p-8 rounded-2xl shadow-xl">
            <h3 className="font-extrabold text-3xl text-yellow-500 text-center mb-6">
              🌟 Unlock Premium Features
            </h3>

            <div className="grid sm:grid-cols-2 gap-6 mb-6">
              <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-xl shadow hover:shadow-md transition duration-300">
                <h4 className="font-bold text-xl mb-2 text-yellow-600">
                  ✔️ Advanced Detection
                </h4>
                <p className="text-sm text-gray-700">
                  Get more precise dental analysis with YOLOv8 Pro and
                  deep-learning enhancements.
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-xl shadow hover:shadow-md transition duration-300">
                <h4 className="font-bold text-xl mb-2 text-yellow-600">
                  📈 Health Reports
                </h4>
                <p className="text-sm text-gray-700">
                  Access and download detailed PDF reports of your diagnosis and
                  recommendations.
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-xl shadow hover:shadow-md transition duration-300">
                <h4 className="font-bold text-xl mb-2 text-yellow-600">
                  👩‍⚕️ Online Consultations
                </h4>
                <p className="text-sm text-gray-700">
                  Enjoy 3x/month one-on-one sessions with certified dental
                  professionals.
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-xl shadow hover:shadow-md transition duration-300">
                <h4 className="font-bold text-xl mb-2 text-yellow-600">
                  🗃️ Personal Record Vault
                </h4>
                <p className="text-sm text-gray-700">
                  Track your dental health history and progress anytime you need
                  it.
                </p>
              </div>
            </div>

            <div className="text-center mt-6">
              <h4 className="text-2xl font-bold mb-2 text-blue-700">
                💰 Only IDR 29.000 / month
              </h4>
              <p className="text-sm text-gray-500 mb-6">
                Pay easily via GoPay, QRIS, or Bank Transfer
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  className="bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold transition duration-300"
                  onClick={() => {
                    setShowPremiumModal(false);
                    handleBuyNow();
                  }}
                >
                  Buy Premium Now
                </button>
                <button
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition duration-300"
                  onClick={() => setShowPremiumModal(false)}
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default HeroSection;
