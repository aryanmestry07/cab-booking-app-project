import { useNavigate } from "react-router-dom";

function Navbar({ role }) {

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user_id");
    navigate("/");
  };

  const goDashboard = () => {
    if (role === "rider") navigate("/rider");
    if (role === "driver") navigate("/driver");
  };

  const goHistory = () => {
    if (role === "rider") navigate("/rider/history");
    if (role === "driver") navigate("/driver/history");
  };

  return (
    <div className="flex justify-between items-center bg-white shadow px-6 py-4">

      {/* Logo */}
      <h1
        className="text-xl font-bold cursor-pointer"
        onClick={goDashboard}
      >
        CabGo 🚗
      </h1>

      <div className="flex items-center gap-6">

        {/* Dashboard */}
        <button
          onClick={goDashboard}
          className="text-gray-700 hover:text-black font-medium"
        >
          Dashboard
        </button>

        {/* History */}
        <button
          onClick={goHistory}
          className="text-gray-700 hover:text-black font-medium"
        >
          History
        </button>

        {/* Role Badge */}
        <span className="bg-gray-200 px-3 py-1 rounded-full text-sm capitalize">
          {role}
        </span>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="text-red-500 hover:text-red-700 font-medium"
        >
          Logout
        </button>

      </div>

    </div>
  );
}

export default Navbar;