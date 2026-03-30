import { Home, Layers, LayoutGrid, Users, Settings, Sparkles } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Layers, label: "Categories", path: "/categories" },
  { icon: LayoutGrid, label: "Templates", path: "/templates" },
  { icon: Users, label: "Users", path: "/users" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[76px] gradient-primary flex flex-col items-center py-6 z-50">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`nav-icon-btn ${isActive ? "active" : ""}`}
            >
              <item.icon className="w-5 h-5 text-white/90" />
              <span className="text-[9px] font-bold tracking-wider text-white/70 uppercase">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Avatar at bottom */}
      <div className="mt-auto">
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
          EW
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
