import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  LayoutDashboard,
  Building2,
  Users,
  MessageSquare,
  LogOut,
  ShieldCheck,
} from "lucide-react";

interface SidebarProps {
  pendingCount?: number;
}

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    label: "Manage",
    items: [
      { to: "/properties", icon: Building2, label: "Properties" },
      { to: "/users",      icon: Users,     label: "Users"       },
      { to: "/inquiries",  icon: MessageSquare, label: "Inquiries" },
    ],
  },
];

export default function Sidebar({ pendingCount = 0 }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ?.split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "A";

  return (
    <aside
      className="w-[240px] flex flex-col min-h-screen shrink-0"
      style={{ backgroundColor: "#0a1929" }}
    >
      {/* Top gradient accent line — matches frontend Footer */}
      <div style={{ height: 3, background: "linear-gradient(to right, #1B3F72, #C8922A, #1B3F72)", flexShrink: 0 }} />

      {/* ── Logo ── */}
      <div
        className="px-5 h-[60px] flex items-center gap-3 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #C8922A 0%, #e0a83a 100%)" }}
        >
          <Building2 style={{ width: 16, height: 16, color: "#fff" }} />
        </div>
        <div className="leading-none">
          <p className="font-extrabold text-[13px] tracking-tight leading-none">
            <span className="text-white">Gaejraaj </span>
            <span style={{ color: "#C8922A" }}>Properties</span>
          </p>
          <p
            className="text-[9px] font-semibold tracking-[0.2em] uppercase mt-1"
            style={{ color: "#3a5f8a" }}
          >
            Admin Panel
          </p>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {NAV_SECTIONS.map((section, si) => (
          <div key={section.label} className={si > 0 ? "mt-5" : ""}>
            {/* Section label */}
            <p
              className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest select-none"
              style={{ color: "#3a5f8a" }}
            >
              {section.label}
            </p>

            {section.items.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 mb-0.5 overflow-hidden ${
                    isActive
                      ? "text-white"
                      : "text-[#6b9cc8] hover:text-white hover:bg-white/[0.06]"
                  }`
                }
                style={({ isActive }) =>
                  isActive
                    ? { background: "rgba(27,63,114,0.65)", boxShadow: "inset 0 0 0 1px rgba(173,200,238,0.1)" }
                    : {}
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Gold left-accent bar */}
                    {isActive && (
                      <span
                        className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full"
                        style={{ backgroundColor: "#C8922A" }}
                      />
                    )}
                    <Icon
                      style={{ width: 15, height: 15 }}
                      className={`shrink-0 transition-colors ${isActive ? "text-[#C8922A]" : "text-current"}`}
                    />
                    <span className="flex-1 leading-none">{label}</span>
                    {label === "Properties" && pendingCount > 0 && (
                      <span
                        className="inline-flex items-center justify-center text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 leading-none"
                        style={{ backgroundColor: "#C8922A", color: "#fff" }}
                      >
                        {pendingCount > 99 ? "99+" : pendingCount}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* ── User footer ── */}
      <div
        className="px-3 py-3 shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Admin badge */}
        <div className="flex items-center gap-2 px-3 py-2 mb-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: "linear-gradient(135deg, #1B3F72 0%, #2a5298 100%)", color: "#ADC8EE", border: "1.5px solid rgba(173,200,238,0.2)" }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-semibold text-white truncate leading-tight">{user?.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <ShieldCheck style={{ width: 9, height: 9, color: "#C8922A" }} />
              <p className="text-[10px] capitalize" style={{ color: "#5a82b0" }}>{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12.5px] font-medium transition-all duration-150"
          style={{ color: "#5a82b0" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(239,68,68,0.1)";
            (e.currentTarget as HTMLButtonElement).style.color = "#fca5a5";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "#5a82b0";
          }}
        >
          <LogOut style={{ width: 13, height: 13 }} className="shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
