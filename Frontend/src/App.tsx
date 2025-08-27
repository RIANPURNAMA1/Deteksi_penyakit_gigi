import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home";

import Deteksi from "./pages/Deteksi";
import FullScreenLoader from "./components/FullScreenLoader";
import DeteksiPremium from "./pages/DeteksiPremium";
import Register from "./pages/Register";
import Login from "./pages/Login";
import GuestRoute from "./routes/GuestRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import PaymentPage from "./pages/PaymenPage";
import NotFound from "./pages/NotFound";
import Admin from "./Admin/Page/Admin";
import Konsultasi from "./pages/Konsultasi";
import DataPasien from "./Admin/Page/Pasien";
import Pemeriksaan from "./Admin/Page/HasilPemeriksaan";

const AppContent = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Tampilkan loading saat path berubah
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 1000); // waktu simulasi loading
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  return (
    <>
      {loading && <FullScreenLoader />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/deteksi"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Deteksi />
            </ProtectedRoute>
          }
        />
        <Route path="/premium" element={<DeteksiPremium />} />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route path="/payment" element={<PaymentPage />} />

        <Route path="/konsultasi" element={<Konsultasi />} />
        <Route path="/pasien" element={<DataPasien />} />
        <Route path="/pemeriksaan" element={<Pemeriksaan />} />

        <Route path="*" element={<NotFound />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin", "dokter"]}>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
