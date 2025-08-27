import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaTooth,
  FaUsers,
  FaChartBar,
  FaSignOutAlt,
  FaTimes,
} from "react-icons/fa";

type SidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  handleLogout: () => void;
};

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  handleLogout,
}: SidebarProps) {
  const location = useLocation();

  const menuItems = [
    { path: "/admin", label: "Dashboard", icon: <FaChartBar /> },
    { path: "/pasien", label: "Data Pasien", icon: <FaUsers /> },
    { path: "/pemeriksaan", label: "Hasil Pemeriksaan", icon: <FaTooth /> },
  ];

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 bg-gray-100 shadow-xl transition-transform duration-300 ease-in-out flex flex-col z-50
        ${sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"} 
        md:translate-x-0 md:static`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-700 shadow-md">
          <Link
            to="/"
            className="flex items-center text-xl font-extrabold text-white gap-1"
          >
            <FaTooth className="text-white text-2xl" />
            <span>GIGI</span>.ID
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white md:hidden"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-blue-100 hover:scale-105"
                }`}
              >
                {item.icon} {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-100 hover:scale-105 transition text-red-500 w-full"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
