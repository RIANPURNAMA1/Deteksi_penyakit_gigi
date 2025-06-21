// src/routes/GuestRoute.tsx
import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
}

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Route untuk memastikan user belum login.
 * Jika sudah ada token di localStorage, maka akan dialihkan ke halaman home.
 * Jika belum, maka akan menampilkan komponen children.
 * @param {{ children: React.ReactNode }} props
 * @returns {React.ReactElement}
 */
/*******  1ec16061-9d4a-45d6-bb01-4f8f25996b44  *******/const GuestRoute: React.FC<Props> = ({ children }) => {
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default GuestRoute;
