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
            <ProtectedRoute>
              <Deteksi />
            </ProtectedRoute>
          }
        />
        <Route
          path="/premium"
          element={
            <ProtectedRoute>
              <DeteksiPremium />
            </ProtectedRoute>
          }
        />
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
