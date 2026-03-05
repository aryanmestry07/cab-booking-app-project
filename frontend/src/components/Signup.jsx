import { useState } from "react";
import api from "../utils/api";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("rider");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!username || !password) {
      alert("Fill all fields ⚠️");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/register", {
        username,
        password,
        role,
      });

      alert("Account created successfully 🎉");
      window.location.href = "/login";
    } catch (err) {
      alert(err.response?.data?.detail || "Signup failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-96">

        <h1 className="text-2xl font-bold text-center mb-6">
          Create Account 🚀
        </h1>

        {/* Username */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-3 rounded-xl w-full mb-4"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-3 rounded-xl w-full mb-4"
        />

        {/* Role Selection */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border p-3 rounded-xl w-full mb-6"
        >
          <option value="rider">Rider 🚖</option>
          <option value="driver">Driver 🚗</option>
        </select>

        {/* Button */}
        <button
          onClick={handleSignup}
          disabled={loading}
          className="bg-black text-white py-3 rounded-xl w-full"
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>

        {/* Login Redirect */}
        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => (window.location.href = "/login")}
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
}