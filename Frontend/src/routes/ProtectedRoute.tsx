import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
  allowedRoles?: string[]; // role yang diizinkan
  requirePremium?: boolean; // apakah halaman butuh premium
}

const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles, requirePremium }) => {
  const token = localStorage.getItem("token");
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  // Kalau belum login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Cek role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Cek premium jika halaman butuh premium
  if (requirePremium && !user.isPremium) {
    return <Navigate to="/premium" replace />; 
    // "/premium-info" bisa diarahkan ke halaman upsell / penjelasan paket premium
  }

  return <>{children}</>;
};

export default ProtectedRoute;
