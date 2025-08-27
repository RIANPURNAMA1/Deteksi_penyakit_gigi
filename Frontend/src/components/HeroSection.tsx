import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaTooth,
  FaSearch,
  FaCrown,
  FaHeartbeat,
  FaUserMd,
  FaAmbulance,
} from "react-icons/fa";
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
              <FaCrown /> Check and consult with a doctor
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8">
            <div className="group bg-gradient-to-tr from-blue-50 to-white p-6 rounded-xl shadow hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-blue-100">
              <div className="flex items-start gap-4">
                <div>
                  <div className="bg-blue-100 p-3 rounded-full flex justify-center text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition">
                    <FaAmbulance className="text-2xl" />
                  </div>
                  <h4 className="font-bold text-lg text-blue-800 group-hover:text-blue-600 transition">
                    24/7 Emergency Services
                  </h4>
                  <p className="text-[13px] text-gray-600 mt-1">
                    We're here for you any time, any day, to handle urgent
                    dental care needs with priority.
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
                  <h4 className="font-bold text-lg text-blue-800 group-hover:text-blue-600 transition">
                    Skilled Medical Professionals
                  </h4>
                  <p className="text-[13px] text-gray-600 mt-1">
                    Our experienced dental doctors are committed to providing
                    safe and effective treatments.
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

            {/* 🔽 Informasi tambahan berbentuk card */}
      <div className="mt-20 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">
          Why Choose <span className="text-yellow-400">Our System?</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white text-blue-900 p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300">
            <div className="flex items-center justify-center bg-blue-100 w-16 h-16 rounded-full mb-4 mx-auto">
              <FaTooth className="text-3xl text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-center">AI Detection</h3>
            <p className="text-sm text-gray-600 text-center mt-2">
              Powered by YOLOv8, detect dental diseases in real-time with high
              accuracy and efficiency.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white text-blue-900 p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300">
            <div className="flex items-center justify-center bg-yellow-100 w-16 h-16 rounded-full mb-4 mx-auto">
              <FaSearch className="text-3xl text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-center">Detailed Analysis</h3>
            <p className="text-sm text-gray-600 text-center mt-2">
              Get clear reports and health insights that help track your dental
              condition over time.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white text-blue-900 p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300">
            <div className="flex items-center justify-center bg-green-100 w-16 h-16 rounded-full mb-4 mx-auto">
              <FaUserMd className="text-3xl text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-center">Expert Support</h3>
            <p className="text-sm text-gray-600 text-center mt-2">
              Connect with certified dental professionals for trusted guidance
              and consultations.
            </p>
          </div>
        </div>
      </div>
      {/* 🔽 How It Works Section (Timeline Style) */}
      <div className="mt-24 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-16">
          How <span className="text-yellow-400">It Works</span>
        </h2>

        <div className="relative flex items-center justify-between">
          {/* Garis penghubung */}
          <div className="absolute top-5 left-0 w-full h-1 bg-gray-200"></div>

          {/* Step 1 */}
          <div className="relative flex flex-col items-center w-1/3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-400 text-white font-bold text-xl z-10">
              1
            </div>
            <h3 className="mt-4 text-lg font-semibold">Upload Photo</h3>
            <p className="text-sm text-white mt-2 px-4">
              Take a picture of your teeth using your phone or webcam.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative flex flex-col items-center w-1/3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-400 text-white font-bold text-xl z-10">
              2
            </div>
            <h3 className="mt-4 text-lg font-semibold">AI Detection</h3>
            <p className="text-sm text-white mt-2 px-4">
              Our YOLOv8 AI analyzes and identifies dental conditions instantly.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative flex flex-col items-center w-1/3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-400 text-white font-bold text-xl z-10">
              3
            </div>
            <h3 className="mt-4 text-lg font-semibold">View Results</h3>
            <p className="text-sm text-white mt-2 px-4">
              Get a detailed report and recommendations in just seconds.
            </p>
          </div>
        </div>
      </div>


            {/* 🔽 Testimonials Section */}
      <div className="mt-24 bg-blue-800 py-16 px-6 text-center rounded-3xl">
        <h2 className="text-3xl font-bold text-white mb-12">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white text-blue-900 p-6 rounded-xl shadow-md">
            <p className="italic">"Super helpful! I detected caries early and got treatment in time."</p>
            <h4 className="mt-4 font-bold">– Andi, 22</h4>
          </div>
          <div className="bg-white text-blue-900 p-6 rounded-xl shadow-md">
            <p className="italic">"The premium consultation saved me a trip to the clinic. Very efficient."</p>
            <h4 className="mt-4 font-bold">– Siti, 28</h4>
          </div>
          <div className="bg-white text-blue-900 p-6 rounded-xl shadow-md">
            <p className="italic">"Easy to use, accurate, and affordable. Highly recommend!"</p>
            <h4 className="mt-4 font-bold">– Budi, 31</h4>
          </div>
        </div>
      </div>


      {/* 🔽 Pricing Section (Enhanced) */}
      <div className="mt-24 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-white mb-12">
          Simple pricing for everyone — start free, upgrade anytime.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Free Plan */}
          <div className="relative bg-blue-900 text-blue-900 p-8 rounded-2xl shadow-lg hover:scale-105 hover:shadow-2xl transition transform duration-300">
            <h3 className="text-2xl font-semibold">Free Plan</h3>
            <p className="text-white mt-2">Basic detection features for everyone</p>
            <h4 className="text-4xl text-white font-extrabold mt-6">IDR 0</h4>

            <ul className="mt-6 space-y-3 text-sm text-white text-left">
              <li>✔️ Basic Detection</li>
              <li>✔️ Limited Report Access</li>
              <li>❌ No Consultations</li>
            </ul>

            <button
              onClick={() => handleNavigation("/deteksi")}
              className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              Get Started
            </button>
          </div>

          {/* Premium Plan */}
          <div className="relative bg-gradient-to-b from-yellow-50 to-yellow-100 border-2  border-yellow-400 p-8 rounded-2xl shadow-xl hover:scale-105 hover:shadow-2xl transition transform duration-300">
            {/* Badge Popular */}
            <span className="absolute -top-3 right-6 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
              Most Popular
            </span>

            <h3 className="text-2xl font-semibold text-yellow-600">Premium Plan</h3>
            <p className="text-gray-600 mt-2">Unlock full power with premium features</p>
            <h4 className="text-4xl text-yellow-600 font-extrabold mt-6">IDR 29.000 <span className="text-base font-medium">/ month</span></h4>

            <ul className="mt-6 space-y-3 text-sm text-gray-700 text-left">
              <li>✔️ Advanced Detection</li>
              <li>✔️ PDF Health Reports</li>
              <li>✔️ Online Consultations</li>
              <li>✔️ Health Record Vault</li>
            </ul>

            <button
              onClick={() => handleNavigation("/premium")}
              className="mt-8 w-full bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>

 

{/* 🔽 FAQ Section */}
<div className="mt-24 max-w-5xl mx-auto px-6">
  <h2 className="text-3xl font-bold text-center mb-12">
    Frequently Asked <span className="text-yellow-600">Questions</span>
  </h2>

  <div className="space-y-4">
    {[
      {
        q: "Is the Free Plan really free?",
        a: "Yes, the Free Plan is 100% free with no hidden fees. You can use basic detection features anytime.",
      },
      {
        q: "How accurate is the AI detection?",
        a: "Our AI model is trained using YOLOv8 with thousands of dental images, providing high accuracy in real-time.",
      },
      {
        q: "Can I consult with a real dentist?",
        a: "Yes, with the Premium Plan you get access to online consultations with certified dentists.",
      },
      {
        q: "How do I upgrade to Premium?",
        a: "Simply click 'Upgrade Now' in the Premium Plan section and follow the payment instructions.",
      },
    ].map((item, i) => (
      <details
        key={i}
        className="group bg-blue-900 shadow-md p-6 rounded-xl cursor-pointer transition hover:shadow-lg"
      >
        <summary className="flex justify-between items-center font-semibold text-lg">
          {item.q}
          <span className="transition-transform group-open:rotate-45 text-blue-600">+</span>
        </summary>
        <p className="mt-3 text-white">{item.a}</p>
      </details>
    ))}
  </div>
</div>


      {/* 🔽 Call To Action */}
      <div className="mt-24 text-center bg-gradient-to-r from-blue-700 to-blue-500 text-white py-16 px-6 rounded-3xl shadow-xl">
        <h2 className="text-3xl font-bold mb-4">Ready to Take Care of Your Smile?</h2>
        <p className="mb-8 text-lg text-gray-200">
          Join thousands of users who already trust our AI-powered dental detection.
        </p>
        <button
          onClick={() => handleNavigation("/register")}
          className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 px-8 py-4 rounded-lg font-bold"
        >
          Get Started for Free
        </button>
      </div>

      {/* 🔽 Contact Section */}
<div className="mt-32 bg-gradient-to-r from-blue-600 to-indigo-600 py-20 text-white relative">
  <div className="max-w-4xl mx-auto text-center mb-16">
    <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
      Let’s Stay Connected
    </h2>
    <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto">
      Kami percaya komunikasi yang baik adalah kunci pelayanan terbaik. 
      Hubungi kami untuk pertanyaan, bantuan, atau sekadar konsultasi.
    </p>
    <div className="mt-6 flex justify-center gap-6">
      <div className="bg-white/10 backdrop-blur-lg px-6 py-3 rounded-full shadow-md">
        🌍 Layanan 24/7
      </div>
      <div className="bg-white/10 backdrop-blur-lg px-6 py-3 rounded-full shadow-md">
        ⚡ Respon Cepat
      </div>
      <div className="bg-white/10 backdrop-blur-lg px-6 py-3 rounded-full shadow-md">
        💙 Customer First
      </div>
    </div>
  </div>

  <div className="max-w-6xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12">
    {/* Left: Contact Info */}
    <div>
      <h3 className="text-3xl font-bold mb-6">Get in Touch</h3>
      <p className="text-blue-100 mb-8">
        Have questions, feedback, or need assistance? We’re here to help you.
      </p>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <span className="text-2xl">📧</span>
          <div>
            <h4 className="font-semibold">Email</h4>
            <p className="text-blue-100">support@dentalai.com</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-2xl">📱</span>
          <div>
            <h4 className="font-semibold">WhatsApp</h4>
            <p className="text-blue-100">+62 812 3456 7890</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-2xl">📍</span>
          <div>
            <h4 className="font-semibold">Location</h4>
            <p className="text-blue-100">Cianjur, Indonesia</p>
          </div>
        </div>
      </div>
    </div>

    {/* Right: Map / Call to Action */}
    <div className="bg-white text-blue-900 p-8 rounded-2xl shadow-lg flex flex-col items-center justify-center">
      <h3 className="text-2xl font-semibold mb-4">Visit Us</h3>
      <p className="mb-6 text-center text-gray-600">
        You can find our office at the heart of Bandung city. Feel free to
        contact us anytime!
      </p>
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3952.971940744853!2d107.6098104153345!3d-6.914744795003151!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e62f6a92b67f%3A0x401e8f1fc28c7c0!2sBandung!5e0!3m2!1sen!2sid!4v1692868680642!5m2!1sen!2sid"
        width="100%"
        height="220"
        style={{ border: 0 }}
        allowFullScreen={true}
        loading="lazy"
        className="rounded-xl shadow-md"
      ></iframe>
      <a
        href="https://wa.me/6281234567890"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
      >
        Chat via WhatsApp
      </a>
    </div>
  </div>
</div>



      {/* 🔽 Footer */}
      <footer className="mt-24 bg-blue-900 text-gray-300 py-10 rounded-2xl">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
          <div>
            <h3 className="font-bold text-white mb-3">Smart Dental AI</h3>
            <p className="text-sm">
              AI-powered dental disease detection system using YOLOv8 for a
              healthier smile.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-white mb-3">Quick Links</h3>
            <ul className="text-sm space-y-2">
              <li><a href="/deteksi" className="hover:underline">Start Detection</a></li>
              <li><a href="/premium" className="hover:underline">Premium Features</a></li>
              <li><a href="/about" className="hover:underline">About Us</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white mb-3">Contact</h3>
            <p className="text-sm">📍 Cianjur, Indonesia</p>
            <p className="text-sm">📧 support@smartdental.ai</p>
          </div>
        </div>
        <div className="text-center text-gray-500 mt-6 text-sm">
          © {new Date().getFullYear()} Smart Dental AI. All rights reserved.
        </div>
      </footer>

      {showModal && (
        <dialog open className="modal modal-open">
          <div className="modal-box text-center">
            <h3 className="font-bold text-lg text-red-600">🔒 Access Denied</h3>
            <p className="py-4 text-blue-600">
              Please log in to use this feature.
            </p>
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
