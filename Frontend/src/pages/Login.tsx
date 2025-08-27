import { GiTooth } from "react-icons/gi"; // ikon gigi
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Swal from "sweetalert2";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  try {
    const response = await api.post("/login", { email, password });
    localStorage.setItem("token", response.data.access_token);
    localStorage.setItem("user", JSON.stringify(response.data.user)); // simpan user lengkap

    Swal.fire({
      title: "Login Successful",
      text: `Welcome back, ${response.data.user.name}!`,
      icon: "success",
      confirmButtonText: "Continue",
    }).then(() => {
      const role = response.data.user.role;
      if (role === "admin" || role === "dokter") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    });
  } catch (error: any) {
    Swal.fire({
      title: "Login Failed",
      text: error.response?.data?.message || "Incorrect email or password.",
      icon: "error",
      confirmButtonText: "Try Again",
    });
  } finally {
    setIsLoading(false);
  }
};


  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 px-4 py-10">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-blue-100">
        {/* Header dengan ikon gigi */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full shadow-md mb-3 animate-bounce">
            <GiTooth className="text-4xl text-blue-700" />
          </div>
          <h2 className="text-3xl font-extrabold text-blue-800 text-center">
            Welcome Back 👋
          </h2>
          <p className="text-sm text-center text-gray-500 mt-2">
            Login to access your dental health
          </p>
        </div>

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Register link */}
        <p className="mt-6 text-sm text-center text-gray-600">
          Don’t have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer hover:underline font-semibold"
            onClick={() => navigate("/register")}
          >
            Sign up here
          </span>
        </p>
      </div>
    </div>


  );
};

export default Login;
