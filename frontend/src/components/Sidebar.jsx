import { useNavigate } from "react-router-dom";

function Sidebar({ role }) {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col p-6 fixed z-50">
      <div className="flex items-center gap-2 mb-10">
        <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white font-bold">C</div>
        <h1 className="text-xl font-bold text-black tracking-tight">CabGo</h1>
      </div>

      <nav className="space-y-1 flex-1">
        <button 
          onClick={() => navigate(`/${role}`)}
          className="w-full text-left px-4 py-2 rounded-lg text-gray-900 hover:bg-gray-100 font-medium transition"
        >
          Dashboard
        </button>
        <button className="w-full text-left px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100 font-medium transition">
          Ride History
        </button>
      </nav>

      <button 
        onClick={() => { localStorage.removeItem("token"); navigate("/"); }}
        className="w-full text-left px-4 py-2 text-red-600 font-bold hover:bg-red-50 rounded-lg transition"
      >
        Logout
      </button>
    </div>
  );
}

export default Sidebar;