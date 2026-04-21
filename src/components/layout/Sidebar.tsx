import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  LayoutDashboard, Building2, Users, MessageSquare,
  LogOut, ShieldCheck, FileText,
} from "lucide-react";

interface SidebarProps {
  pendingCount?: number;
}

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [{ to: "/", icon: LayoutDashboard, label: "Dashboard" }],
  },
  {
    label: "Manage",
    items: [
      { to: "/properties",   icon: Building2,    label: "Properties"   },
      { to: "/users",        icon: Users,         label: "Users"        },
      { to: "/inquiries",    icon: MessageSquare, label: "Inquiries"    },
      { to: "/land-records", icon: FileText,       label: "Land Records" },
    ],
  },
];

export default function Sidebar({ pendingCount = 0 }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  const initials = user?.name
    ?.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2) ?? "A";

  return (
    <aside
      className="w-[240px] flex flex-col min-h-screen shrink-0"
      style={{ background: "#0f172a" }}
    >
      {/* Top rainbow accent line */}
      <div style={{
        height: 3,
        background: "linear-gradient(to right, #6366f1, #06b6d4, #f59e0b, #f43f5e, #6366f1)",
        flexShrink: 0,
      }} />

      {/* ── Logo ── */}
      <div className="px-5 h-[62px] flex items-center gap-3 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
            boxShadow: "0 0 14px rgba(99,102,241,0.45)",
          }}
        >
          <Building2 style={{ width: 17, height: 17, color: "#fff" }} />
        </div>
        <div className="leading-none">
          <p className="font-extrabold text-[13.5px] tracking-tight leading-none">
            <span className="text-white">Gaejraaj </span>
            <span className="grad-text-indigo">Properties</span>
          </p>
          <p className="text-[9px] font-semibold tracking-[0.22em] uppercase mt-1"
            style={{ color: "#475569" }}>
            Admin Panel
          </p>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto">
        {NAV_SECTIONS.map((section, si) => (
          <div key={section.label} className={si > 0 ? "mt-6" : ""}>
            <p className="px-2 mb-2 text-[9.5px] font-bold uppercase tracking-[0.25em] select-none"
              style={{ color: "#334155" }}>
              {section.label}
            </p>

            {section.items.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 mb-0.5 ${
                    isActive ? "text-white" : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                  }`
                }
                style={({ isActive }) =>
                  isActive
                    ? { background: "rgba(99,102,241,0.2)", boxShadow: "inset 0 0 0 1px rgba(165,180,252,0.15)" }
                    : {}
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active left accent bar */}
                    {isActive && (
                      <span
                        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
                        style={{
                          background: "linear-gradient(to bottom, #a5b4fc, #67e8f9)",
                          boxShadow: "0 0 8px rgba(165,180,252,0.6)",
                        }}
                      />
                    )}

                    {/* Icon container */}
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-150"
                      style={isActive
                        ? { background: "rgba(99,102,241,0.25)" }
                        : { background: "rgba(255,255,255,0.05)" }
                      }
                    >
                      <Icon style={{
                        width: 14, height: 14,
                        color: isActive ? "#a5b4fc" : "currentColor",
                      }} />
                    </div>

                    <span className="flex-1 leading-none">{label}</span>

                    {/* Pending badge */}
                    {label === "Properties" && pendingCount > 0 && (
                      <span
                        className="inline-flex items-center justify-center text-[9.5px] font-bold rounded-full min-w-[18px] h-[18px] px-1 leading-none"
                        style={{
                          background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                          color: "#fff",
                          boxShadow: "0 0 8px rgba(245,158,11,0.4)",
                        }}
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
      <div className="px-3 py-3 shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2.5 px-3 py-2.5 mb-1.5 rounded-xl"
          style={{ background: "rgba(255,255,255,0.05)" }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{
              background: "linear-gradient(135deg, #6366f1, #06b6d4)",
              boxShadow: "0 0 10px rgba(99,102,241,0.35)",
            }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-semibold text-white truncate leading-tight">{user?.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <ShieldCheck style={{ width: 9, height: 9, color: "#6366f1" }} />
              <p className="text-[10px] capitalize" style={{ color: "#475569" }}>{user?.role}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12.5px] font-medium transition-all duration-150"
          style={{ color: "#475569" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(239,68,68,0.1)";
            (e.currentTarget as HTMLButtonElement).style.color = "#fca5a5";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "#475569";
          }}
        >
          <LogOut style={{ width: 13, height: 13 }} className="shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
