import { useNavigate, useLocation } from "react-router-dom";

function Sidebar({ role }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Theme based on role: Rider (White) / Driver (Black)
  const isDriver = role === "driver";
  const themeClass = isDriver 
    ? "bg-[#0a0a0a] border-white/5 text-white" 
    : "bg-white border-gray-100 text-[#1a1a1a]";

  const activeClass = isDriver
    ? "bg-white text-black"
    : "bg-black text-white";

  const hoverClass = isDriver
    ? "hover:bg-white/10"
    : "hover:bg-gray-100";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user_id");
    navigate("/");
  };

  const navItems = [
    { label: "Dashboard", path: `/${role}`, icon: "⌂" },
    { label: "Activity", path: `/${role}/history`, icon: "⌛" },
  ];

  return (
    <div className={`h-screen w-64 border-r flex flex-col p-8 fixed left-0 top-0 z-50 transition-colors duration-300 ${themeClass}`}>
      
      {/* Platform Logo */}
      <div 
        className="flex items-center gap-3 mb-12 cursor-pointer group" 
        onClick={() => navigate(`/${role}`)}
      >
        <div className={`w-10 h-10 flex items-center justify-center rounded shadow-sm transition-all ${isDriver ? 'bg-white text-black' : 'bg-black text-white'}`}>
          <span className="text-xl font-black">C</span>
        </div>
        <div>
          <h1 className="text-xl font-medium tracking-tighter leading-none">CabGo</h1>
          <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${isDriver ? 'text-emerald-500' : 'text-gray-400'}`}>
            {role}
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-4 px-4 py-3 text-sm font-medium transition-all ${
                isActive ? activeClass : hoverClass
              }`}
            >
              <span className="text-lg opacity-70">{item.icon}</span>
              <span className="tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Account Section */}
      <div className="pt-8 border-t border-current opacity-10 flex flex-col gap-2">
        {/* Visual spacer */}
      </div>

      <button
        onClick={handleLogout}
        className={`w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-4 ${
          isDriver ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-600'
        }`}
      >
        <span>→</span>
        Logout
      </button>
    </div>
  );
}

export default Sidebar;