import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { saveToken } from "../utils/auth";

export default function DriverLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      alert("Please enter your driver credentials.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/login", {
        username,
        password
      });

      if (res.data.role !== "driver") {
        alert("Access denied. This portal is only for drivers.");
        return;
      }

      saveToken(res.data.access_token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("user_id", res.data.user_id);

      navigate("/driver");
    } catch (err) {
      alert(err.response?.data?.detail || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white text-[#1a1a1a] antialiased">
      
      {/* Updated Left Branding: Perfectly Matched to Platform Suite */}
      <div className="hidden lg:flex w-1/2 bg-black items-center justify-center p-12">
        <div className="max-w-md">
          {/* Large C Logo */}
          <div className="w-16 h-16 bg-white flex items-center justify-center rounded-xl mb-10 shadow-lg">
            <span className="text-black text-4xl font-black select-none">C</span>
          </div>

          <h2 className="text-5xl font-medium text-white tracking-tight leading-tight">
            Drive when you want, <br /> earn on your schedule.
          </h2>

          <p className="text-gray-400 mt-6 text-lg font-light">
            Sign in to your driver partner dashboard to start accepting rides.
          </p>
        </div>
      </div>

      {/* Right Login Section */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-24">
        <div className="w-full max-w-[400px]">
          
          {/* Mobile Logo Only */}
          <div className="lg:hidden mb-12">
            <div className="w-12 h-12 bg-black flex items-center justify-center rounded-lg shadow-sm">
              <span className="text-white text-2xl font-black">C</span>
            </div>
          </div>

          {/* Header */}
          <header className="mb-10 text-left">
            <h1 className="text-3xl font-medium tracking-tight">Driver Login</h1>
            <p className="text-sm text-gray-500 mt-2">
              Welcome back. Go online and start earning.
            </p>
          </header>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                Driver Username
              </label>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-4 bg-[#f6f6f6] border border-transparent focus:border-black focus:bg-white transition-all text-sm outline-none font-medium"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                Password
              </label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 bg-[#f6f6f6] border border-transparent focus:border-black focus:bg-white transition-all text-sm outline-none font-medium"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 font-bold text-sm tracking-widest hover:bg-[#222] transition disabled:bg-gray-300 mt-4 uppercase"
            >
              {loading ? "Verifying..." : "Go Online"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col gap-4">
            <p className="text-xs text-gray-500">
              Are you a rider?{" "}
              <button
                onClick={() => navigate("/")}
                className="text-black font-bold hover:underline ml-1"
              >
                Rider Login
              </button>
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Driver partner portal. Keep your credentials secure.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}