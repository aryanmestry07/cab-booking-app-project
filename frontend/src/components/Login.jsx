import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { saveToken } from "../utils/auth";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Enter username & password ⚠️");
      return;
    }

    try {
      setLoading(true);

      // ✅ SEND JSON (NOT formData)
      const res = await api.post("/auth/login", {
        username: username,
        password: password,
      });

      // ✅ Save token
      saveToken(res.data.access_token);

      // ✅ Save role
      localStorage.setItem("role", res.data.role);

      alert("Login Successful 🔥");

      // ✅ Redirect properly
      if (res.data.role === "admin") {
        navigate("/admin");
      } else if (res.data.role === "driver") {
        navigate("/driver");
      } else {
        navigate("/rider");
      }

    } catch (err) {
      alert(err.response?.data?.detail || "Login Failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-96">

        <h1 className="text-2xl font-bold text-center mb-6">
          Login 🔐
        </h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-3 rounded-xl w-full mb-4"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-3 rounded-xl w-full mb-6"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-black text-white py-3 rounded-xl w-full"
        >
          {loading ? "Logging in..." : "Login 🚀"}
        </button>

        <p className="text-center mt-4 text-sm">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-blue-600 cursor-pointer"
          >
            Sign Up
          </span>
        </p>

      </div>
    </div>
  );
}