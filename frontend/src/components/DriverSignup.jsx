import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function DriverSignup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!username || !password || !confirmPassword) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/register", {
        username,
        password,
        role: "driver"
      });

      toast.success("Driver account created successfully 🚗");
      navigate("/driver-login");
    } catch {
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white text-[#1a1a1a] antialiased">
      
      {/* Updated Left Branding: Perfectly Matched to Suite */}
      <div className="hidden lg:flex w-1/2 bg-black items-center justify-center p-12">
        <div className="max-w-md">
          {/* Large C Logo */}
          <div className="w-16 h-16 bg-white flex items-center justify-center rounded-xl mb-10 shadow-lg">
            <span className="text-black text-4xl font-black select-none">C</span>
          </div>

          <h2 className="text-5xl font-medium text-white tracking-tight leading-tight">
            The road is yours. <br /> Start driving today.
          </h2>

          <p className="text-gray-400 mt-6 text-lg font-light">
            Join CabGo as a driver partner and start earning on your schedule.
          </p>
        </div>
      </div>

      {/* Right Signup Section */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-24">
        <div className="w-full max-w-[400px]">
          
          {/* Mobile Logo */}
          <div className="lg:hidden mb-12 text-left">
            <div className="w-12 h-12 bg-black flex items-center justify-center rounded-lg shadow-sm">
              <span className="text-white text-2xl font-black">C</span>
            </div>
          </div>

          {/* Header */}
          <header className="mb-10 text-left">
            <h1 className="text-3xl font-medium tracking-tight">Partner Sign up</h1>
            <p className="text-sm text-gray-500 mt-2">
              Create your account to start accepting rides.
            </p>
          </header>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                Driver Username
              </label>
              <input
                type="text"
                placeholder="Choose a username"
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
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 bg-[#f6f6f6] border border-transparent focus:border-black focus:bg-white transition-all text-sm outline-none font-medium"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-4 bg-[#f6f6f6] border border-transparent focus:border-black focus:bg-white transition-all text-sm outline-none font-medium"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 font-bold text-sm tracking-widest hover:bg-[#222] transition disabled:bg-gray-300 uppercase mt-4"
            >
              {loading ? "Registering..." : "Create Partner Account"}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col gap-4">
            <p className="text-xs text-gray-500">
              Already a driver partner?{" "}
              <button
                onClick={() => navigate("/driver-login")}
                className="text-black font-bold hover:underline ml-1"
              >
                Log in
              </button>
            </p>

            <p className="text-xs text-gray-500">
              Just need a ride?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-black font-bold hover:underline ml-1"
              >
                Rider Signup
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}