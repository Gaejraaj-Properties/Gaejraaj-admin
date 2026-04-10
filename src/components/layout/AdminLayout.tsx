import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Bell, ChevronRight, Clock, CheckCircle, Building2 } from "lucide-react";
import Sidebar from "./Sidebar";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../lib/api";

const ROUTE_META: Record<string, { title: string; crumbs?: string[] }> = {
  "/":            { title: "Dashboard" },
  "/properties":  { title: "Properties",  crumbs: ["Properties"] },
  "/users":       { title: "Users",        crumbs: ["Users"] },
  "/inquiries":   { title: "Inquiries",    crumbs: ["Inquiries"] },
};

interface PendingProperty {
  _id: string;
  title: string;
  type: string;
  location: { city: string; state: string };
  owner: { name: string };
  createdAt: string;
}

export default function AdminLayout() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [pendingList, setPendingList] = useState<PendingProperty[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const meta   = ROUTE_META[location.pathname] ?? { title: "Admin" };
  const crumbs = meta.crumbs ?? [];

  const initials = user?.name
    ?.split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "A";

  // Fetch pending count on every route change
  useEffect(() => {
    api
      .get("/admin/stats")
      .then((res) => setPendingCount(res.data?.data?.pendingProperties ?? 0))
      .catch(() => {});
  }, [location.pathname]);

  // Fetch pending properties when dropdown opens
  useEffect(() => {
    if (!open) return;
    setLoadingList(true);
    api
      .get("/admin/properties?status=pending&limit=6&page=1")
      .then((res) => setPendingList(res.data?.data?.properties ?? []))
      .catch(() => setPendingList([]))
      .finally(() => setLoadingList(false));
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-[#f4f6fb]">
      {/* Fixed sidebar */}
      <div className="fixed top-0 left-0 bottom-0 z-30">
        <Sidebar pendingCount={pendingCount} />
      </div>

      {/* Main — offset by sidebar */}
      <div className="flex-1 flex flex-col min-h-screen" style={{ marginLeft: 240 }}>
        {/* ── Top header ── */}
        <header
          className="sticky top-0 z-20 flex items-center px-6 border-b"
          style={{
            height: 56,
            backgroundColor: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(8px)",
            borderColor: "#e8edf5",
          }}
        >
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 flex-1 min-w-0">
            <Link
              to="/"
              className="text-[12.5px] font-medium transition-colors"
              style={{ color: "#94a3b8" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#1B3F72")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#94a3b8")}
            >
              Home
            </Link>
            {crumbs.map((crumb) => (
              <span key={crumb} className="flex items-center gap-1.5">
                <ChevronRight style={{ width: 12, height: 12, color: "#cbd5e1" }} />
                <span className="text-[12.5px] font-semibold text-gray-800">{crumb}</span>
              </span>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2 shrink-0">

            {/* ── Notification bell + dropdown ── */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen((v) => !v)}
                className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{
                  color: open ? "#1B3F72" : "#94a3b8",
                  backgroundColor: open ? "#f1f5f9" : "transparent",
                }}
                title="Pending approvals"
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f1f5f9";
                  (e.currentTarget as HTMLButtonElement).style.color = "#1B3F72";
                }}
                onMouseLeave={(e) => {
                  if (!open) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
                  }
                }}
              >
                <Bell style={{ width: 16, height: 16 }} />
                {pendingCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full border border-white flex items-center justify-center text-[9px] font-bold text-white px-0.5"
                    style={{ backgroundColor: "#C8922A" }}
                  >
                    {pendingCount > 99 ? "99+" : pendingCount}
                  </span>
                )}
              </button>

              {/* Dropdown panel */}
              {open && (
                <div
                  className="absolute right-0 top-[calc(100%+8px)] w-80 rounded-xl border border-gray-100 overflow-hidden animate-fade-down"
                  style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.10)", backgroundColor: "#fff", zIndex: 50 }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Bell style={{ width: 14, height: 14, color: "#C8922A" }} />
                      <span className="text-[13px] font-bold text-gray-800">Pending Approvals</span>
                    </div>
                    {pendingCount > 0 && (
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
                      >
                        {pendingCount} pending
                      </span>
                    )}
                  </div>

                  {/* List */}
                  <div className="max-h-72 overflow-y-auto">
                    {loadingList ? (
                      <div className="py-8 flex flex-col items-center gap-2">
                        <div className="w-5 h-5 border-2 border-gray-200 border-t-[#1B3F72] rounded-full animate-spin" />
                        <p className="text-xs text-gray-400">Loading…</p>
                      </div>
                    ) : pendingList.length === 0 ? (
                      <div className="py-8 text-center">
                        <CheckCircle style={{ width: 28, height: 28, color: "#86efac", margin: "0 auto 8px" }} />
                        <p className="text-[13px] font-semibold text-gray-700">All caught up!</p>
                        <p className="text-xs text-gray-400 mt-0.5">No pending properties</p>
                      </div>
                    ) : (
                      pendingList.map((p) => (
                        <button
                          key={p._id}
                          onClick={() => {
                            navigate("/properties?status=pending");
                            setOpen(false);
                          }}
                          className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                            style={{ backgroundColor: "#EEF3FB" }}
                          >
                            <Building2 style={{ width: 14, height: 14, color: "#1B3F72" }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12.5px] font-semibold text-gray-800 truncate leading-tight">{p.title}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5 capitalize">
                              {p.type} · {p.location.city}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock style={{ width: 10, height: 10, color: "#C8922A" }} />
                              <span className="text-[10.5px] text-gray-400">
                                {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                              </span>
                            </div>
                          </div>
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 mt-0.5"
                            style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
                          >
                            Pending
                          </span>
                        </button>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {pendingCount > 0 && (
                    <div className="px-4 py-2.5 border-t border-gray-100">
                      <button
                        onClick={() => { navigate("/properties?status=pending"); setOpen(false); }}
                        className="w-full text-[12px] font-semibold text-center py-1.5 rounded-lg transition-colors"
                        style={{ color: "#1B3F72" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#EEF3FB")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        View all {pendingCount} pending →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-gray-200 mx-1" />

            {/* User pill */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                style={{ background: "linear-gradient(135deg, #1B3F72 0%, #2a5298 100%)" }}
              >
                {initials}
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="text-[12.5px] font-semibold text-gray-800 leading-none">{user?.name}</p>
                <p className="text-[10.5px] text-gray-400 mt-0.5 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 animate-fade-up">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
