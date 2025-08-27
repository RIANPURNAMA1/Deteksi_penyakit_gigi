import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import {
  FaTooth,
  FaBars,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserPlus,
} from "react-icons/fa";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const timeoutRef = useRef<number | null>(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  };

  const showInactivityModal = () => {
    Swal.fire({
      title: "Auto Logout",
      text: "You have been logged out due to inactivity.",
      icon: "info",
      confirmButtonText: "OK",
    }).then(() => handleLogout());
  };

  const resetInactivityTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (isLoggedIn) showInactivityModal();
    }, 600000);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      const events = ["mousemove", "keydown", "click", "scroll"];
      events.forEach((event) => window.addEventListener(event, resetInactivityTimeout));
      resetInactivityTimeout();
      return () => {
        events.forEach((event) => window.removeEventListener(event, resetInactivityTimeout));
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }
  }, [isLoggedIn]);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center text-xl font-extrabold text-blue-700 gap-2">
          <FaTooth className="text-blue-500 text-2xl" />
          <span className="text-black">Smart dental disease</span>detection
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex space-x-6 items-center text-sm font-semibold">
          <Link to="/" className="hover:text-blue-600 transition">Home</Link>
          <a href="#how-it-works" className="hover:text-blue-600 transition">How It Works</a>
          <a href="#diseases" className="hover:text-blue-600 transition">Diseases</a>
          <a href="#detection" className="hover:text-blue-600 transition">Detection</a>
          <a href="#pricing" className="hover:text-blue-600 transition">Pricing</a>
          <a href="#contact" className="hover:text-blue-600 transition">Contact</a>
          <a href="#faq" className="hover:text-blue-600 transition">FAQ</a>
        </div>

        {/* Login / Logout */}
        <div className="hidden lg:block">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="bg-blue-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-medium text-sm transition"
            >
              <FaSignOutAlt className="inline mr-1" /> Logout
            </button>
          ) : (
            <div>
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 mr-2 text-white px-4 py-2 rounded-full font-medium text-sm transition"
              >
              <FaSignInAlt className="inline mr-1" /> Login
            </Link>
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium text-sm transition"
              >
              <FaUserPlus className="inline mr-1" /> Register
            </Link>
              </div>
          )}
        </div>

        {/* Mobile Button */}
        <div className="lg:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-xl text-gray-700">
            <FaBars />
          </button>
        </div>
      </nav>

    {/* Mobile Menu */}
{isMenuOpen && (
  <div className="lg:hidden bg-white px-6 pb-4 shadow-md">
    <div className="flex flex-col space-y-3 font-medium text-sm">
      <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
      <a href="#how-it-works" onClick={() => setIsMenuOpen(false)}>How It Works</a>
      <a href="#diseases" onClick={() => setIsMenuOpen(false)}>Diseases</a>
      <a href="#detection" onClick={() => setIsMenuOpen(false)}>Detection</a>
      <a href="#pricing" onClick={() => setIsMenuOpen(false)}>Pricing</a>
      <a href="#contact" onClick={() => setIsMenuOpen(false)}>Contact</a>
      <a href="#faq" onClick={() => setIsMenuOpen(false)}>FAQ</a>
      
      {isLoggedIn ? (
        <button 
          onClick={() => { setIsMenuOpen(false); handleLogout(); }} 
          className="bg-blue-500 hover:bg-red-600 text-white px-4 py-2 rounded-full"
        >
          <FaSignOutAlt className="inline mr-1" /> Logout
        </button>
      ) : (
        <div className="flex flex-col space-y-2">
          <Link 
            to="/login" 
            onClick={() => setIsMenuOpen(false)} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-center"
          >
            <FaSignInAlt className="inline mr-1" /> Login
          </Link>
          <Link 
            to="/register" 
            onClick={() => setIsMenuOpen(false)} 
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-center"
          >
            <FaUserPlus className="inline mr-1" /> Register
          </Link>
        </div>
      )}
    </div>
  </div>
)}

    </header>
  );
};

export default Navbar;
