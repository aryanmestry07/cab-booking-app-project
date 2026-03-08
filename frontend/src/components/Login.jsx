import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {

    e.preventDefault();

    if (!username || !password) {
      alert("Please enter username and password.");
      return;
    }

    setLoading(true);

    try {

      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          password
        })
      });

      const data = await response.json();

      console.log("Login response:", data);

      if (response.ok) {

        // Save authentication data
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("role", data.role);

        if (data.user_id) {
          localStorage.setItem("user_id", data.user_id);
        }

        // Redirect based on role
        if (data.role === "driver") {
          navigate("/driver");
        } else {
          navigate("/rider");
        }

      } else {

        alert(data.detail || "Invalid username or password.");

      }

    } catch (error) {

      console.error("Login Error:", error);
      alert("Authentication service unavailable.");

    } finally {

      setLoading(false);

    }

  };

  return (
    <div className="min-h-screen flex bg-white text-[#1a1a1a] antialiased">

      <div className="hidden lg:flex w-1/2 bg-black items-center justify-center p-12">

        <div className="max-w-md">

          <div className="w-16 h-16 bg-white flex items-center justify-center rounded-xl mb-10 shadow-lg">
            <span className="text-black text-4xl font-black">C</span>
          </div>

          <h2 className="text-5xl font-medium text-white tracking-tight leading-tight">
            Reliable rides, <br /> anytime, anywhere.
          </h2>

          <p className="text-gray-400 mt-6 text-lg font-light">
            Streamlined mobility for the modern world.
          </p>

        </div>

      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-24">

        <div className="w-full max-w-[400px]">

          <div className="lg:hidden mb-12">
            <div className="w-12 h-12 bg-black flex items-center justify-center rounded-lg">
              <span className="text-white text-2xl font-black">C</span>
            </div>
          </div>

          <header className="mb-10">
            <h1 className="text-3xl font-medium tracking-tight">Log in</h1>
            <p className="text-sm text-gray-500 mt-2">
              Enter your credentials to access your account.
            </p>
          </header>

          <form onSubmit={handleLogin} className="space-y-6">

            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                Username
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
              className="w-full bg-black text-white py-4 font-bold text-sm tracking-widest hover:bg-[#222] transition disabled:bg-gray-300 uppercase"
            >
              {loading ? "Verifying..." : "Log In"}
            </button>

          </form>

          <div className="mt-12 pt-8 border-t border-gray-100">

            <p className="text-xs text-gray-500">
              New to CabGo?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-black font-bold hover:underline ml-1"
              >
                Sign up
              </button>
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;