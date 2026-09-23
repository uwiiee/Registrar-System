import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ListOrdered,
  CalendarCheck,
  Briefcase,
  Megaphone,
  Users,
  Settings,
  GraduationCap,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const REGISTRAR_NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/queue", label: "Queue", icon: ListOrdered },
  { to: "/appointments", label: "Appointments", icon: CalendarCheck },
  { to: "/services", label: "Services", icon: Briefcase },
  { to: "/announcements", label: "Announcements", icon: Megaphone },
  { to: "/students", label: "Students", icon: Users },
];

const COURSE_NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/announcements", label: "Announcements", icon: Megaphone },
  { to: "/students", label: "Students", icon: Users },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const isRegistrar = user?.department === "Registrar";
  const navItems = isRegistrar ? REGISTRAR_NAV : COURSE_NAV;

  return (
    <aside className="w-64 min-h-screen bg-[#1E1B4B] text-white flex flex-col">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
          <GraduationCap size={18} color="#fff" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">Silay Institute</p>
          <p className="text-xs text-white/50 leading-tight">
            {user?.department}
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 transition-colors ${
                isActive
                  ? "bg-[#5B4FE5] text-white font-semibold"
                  : "text-white/70 hover:bg-white/5"
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4 border-t border-white/10 pt-4">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 ${
              isActive
                ? "bg-[#5B4FE5] text-white font-semibold"
                : "text-white/70 hover:bg-white/5"
            }`
          }
        >
          <Settings size={18} />
          Settings
        </NavLink>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/5"
        >
          <LogOut size={18} />
          Log Out
        </button>

        <div className="flex items-center gap-2 mt-4 px-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
            {user?.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div>
            <p className="text-xs font-semibold leading-tight">{user?.name}</p>
            <p className="text-[10px] text-white/50 leading-tight">
              {user?.department} Admin
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
