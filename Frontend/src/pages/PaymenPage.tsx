
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle } from "react-icons/fa";

const PaymentPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-2xl mx-auto bg-slate-200 shadow-xl rounded-xl p-8">
        <h1 className="text-3xl font-bold text-blue-600 text-center mb-6">
          💳 Payment for Premium Access
        </h1>
        <p className="text-center text-gray-600 mb-4">
          Please choose one of the following payment methods to activate your premium access.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="border rounded-lg p-4 bg-blue-50 shadow-sm">
            <h3 className="font-semibold mb-2">🟦 GoPay / QRIS</h3>
            <img
              src="/images/qris.png" // ganti dengan QRIS milikmu
              alt="QRIS Payment"
              className="w-full h-40 object-contain mb-2"
            />
            <p className="text-sm text-gray-500">Scan the QR code using GoPay, DANA, ShopeePay, etc.</p>
          </div>

          <div className="border rounded-lg p-4 bg-yellow-50 shadow-sm">
            <h3 className="font-semibold mb-2">🏦 Bank Transfer</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>Bank: BCA</li>
              <li>Account No: 1234567890</li>
              <li>Name: RII DEV</li>
              <li>Note: "PREMIUM-{Math.floor(Math.random() * 1000)}"</li>
            </ul>
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-gray-600 text-sm">
            After payment, please confirm via WhatsApp or wait for automatic activation.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="btn btn-outline flex items-center gap-2"
          >
            <FaArrowLeft /> Back to Home
          </button>
          <button
            onClick={() => {
              alert("Your premium request has been submitted!");
              navigate("/premium");
            }}
            className="btn btn-success flex items-center gap-2"
          >
            <FaCheckCircle /> I've Paid
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
