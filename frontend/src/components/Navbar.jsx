import { useNavigate } from "react-router-dom";

function Navbar({ role }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="flex justify-between items-center bg-white shadow px-6 py-4">
      <h1 className="text-xl font-bold">CabGo 🚗</h1>

      <div className="flex items-center gap-4">
        <span className="bg-gray-200 px-3 py-1 rounded-full text-sm capitalize">
          {role}
        </span>

        <button
          onClick={handleLogout}
          className="text-red-500 hover:text-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;