import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Building2,
  Users,
  MessageSquare,
  Clock,
  TrendingUp,
  Eye,
  ArrowRight,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import api from "../lib/api";
import { formatPrice } from "../lib/format";
import StatCard from "../components/ui/StatCard";
import { StatusBadge } from "../components/ui/Badge";
import { useAuth } from "../contexts/AuthContext";

interface Stats {
  totalProperties: number;
  pendingProperties: number;
  approvedProperties: number;
  totalUsers: number;
  totalInquiries: number;
  totalViews: number;
  cityDistribution: { city: string; count: number }[];
  typeDistribution: { name: string; value: number }[];
  listingDistribution: { name: string; count: number }[];
}

interface RecentProperty {
  _id: string;
  title: string;
  price: number;
  status: string;
  listingType: string;
  type: string;
  location: { city: string };
  createdAt: string;
  slug: string;
}

const PIE_COLORS = ["#7c3aed", "#06b6d4", "#ec4899", "#10b981", "#f59e0b", "#6366f1"];

const TYPE_CHIP: Record<string, { bg: string; color: string }> = {
  apartment:  { bg: "#eff6ff", color: "#2563eb" },
  house:      { bg: "#f0fdf4", color: "#059669" },
  villa:      { bg: "#f5f3ff", color: "#7c3aed" },
  plot:       { bg: "#fffbeb", color: "#d97706" },
  commercial: { bg: "#fff7ed", color: "#ea580c" },
  farmhouse:  { bg: "#f0fdfa", color: "#0d9488" },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const TODAY = new Date().toLocaleDateString("en-IN", {
  weekday: "long", day: "numeric", month: "long", year: "numeric",
});

interface BarTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function BarTooltip({ active, payload, label }: BarTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border shadow-lg rounded-xl px-3.5 py-2.5 text-xs" style={{ borderColor: "#e2e8f0" }}>
      <p className="font-semibold text-gray-700 mb-0.5">{label}</p>
      <p className="font-bold" style={{ color: "#7c3aed" }}>{payload[0].value} listings</p>
    </div>
  );
}

function SkeletonStat() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 animate-pulse"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      <div className="w-12 h-12 rounded-2xl bg-gray-100 shrink-0" />
      <div className="flex-1">
        <div className="h-7 bg-gray-100 rounded-lg w-16 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-24 mb-1.5" />
        <div className="h-2.5 bg-gray-100 rounded w-16" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<RecentProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentLoading, setRecentLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/stats")
      .then((res) => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));

    api.get("/admin/properties/recent")
      .then((res) => setRecent(res.data.data?.properties || []))
      .catch(() => {})
      .finally(() => setRecentLoading(false));
  }, []);

  const firstName = user?.name?.split(" ")[0] ?? "Admin";

  const statCards = [
    {
      label: "Total Properties",
      value: loading ? "—" : (stats?.totalProperties ?? 0),
      icon: Building2,
      accentColor: "#7c3aed",
      iconBg: "#f5f3ff",
      gradientFrom: "#7c3aed",
      gradientTo: "#6366f1",
      sub: loading ? "" : `${stats?.approvedProperties ?? 0} approved`,
    },
    {
      label: "Pending Approval",
      value: loading ? "—" : (stats?.pendingProperties ?? 0),
      icon: Clock,
      accentColor: "#f59e0b",
      iconBg: "#fffbeb",
      gradientFrom: "#f59e0b",
      gradientTo: "#ef4444",
      sub: "Awaiting review",
    },
    {
      label: "Total Users",
      value: loading ? "—" : (stats?.totalUsers ?? 0),
      icon: Users,
      accentColor: "#10b981",
      iconBg: "#f0fdf4",
      gradientFrom: "#10b981",
      gradientTo: "#06b6d4",
      sub: "Registered accounts",
    },
    {
      label: "Inquiries",
      value: loading ? "—" : (stats?.totalInquiries ?? 0),
      icon: MessageSquare,
      accentColor: "#ec4899",
      iconBg: "#fdf2f8",
      gradientFrom: "#ec4899",
      gradientTo: "#8b5cf6",
      sub: "All time",
    },
    {
      label: "Total Views",
      value: loading ? "—" : (stats?.totalViews?.toLocaleString() ?? 0),
      icon: Eye,
      accentColor: "#06b6d4",
      iconBg: "#ecfeff",
      gradientFrom: "#06b6d4",
      gradientTo: "#6366f1",
      sub: "Across all listings",
    },
    {
      label: "Live Listings",
      value: loading ? "—" : (stats?.approvedProperties ?? 0),
      icon: TrendingUp,
      accentColor: "#f59e0b",
      iconBg: "#fffbeb",
      gradientFrom: "#f59e0b",
      gradientTo: "#10b981",
      sub: "Currently active",
    },
  ];

  // Max count for city bar scaling
  const maxCity = Math.max(...(stats?.cityDistribution?.map((c) => c.count) ?? [1]));
  // Total for listing type percentages
  const totalListing = stats?.listingDistribution?.reduce((s, d) => s + d.count, 0) ?? 1;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">

      {/* ── Welcome Banner ── */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}
      >
        {/* Aurora overlay */}
        <div
          className="absolute inset-0 animate-aurora opacity-60"
          style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.4) 0%, rgba(6,182,212,0.25) 40%, rgba(245,158,11,0.15) 70%, rgba(99,102,241,0.3) 100%)" }}
        />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
        {/* Glow blobs */}
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full blur-3xl animate-glow-pulse"
          style={{ background: "rgba(99,102,241,0.3)" }} />
        <div className="absolute -bottom-8 left-1/4 w-44 h-44 rounded-full blur-3xl animate-glow-pulse delay-300"
          style={{ background: "rgba(6,182,212,0.22)" }} />

        <div className="relative px-7 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span
                className="text-[10px] font-bold uppercase tracking-[0.18em] px-3 py-1 rounded-full"
                style={{ background: "rgba(99,102,241,0.2)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.25)" }}
              >
                {TODAY}
              </span>
            </div>
            <h1 className="text-[26px] font-black text-white leading-tight tracking-tight">
              {getGreeting()}, {firstName} 👋
            </h1>
            <p className="text-sm mt-1.5" style={{ color: "#64748b" }}>
              Here's an overview of your real-estate platform.
            </p>
          </div>

          {/* Right — inline mini stats */}
          <div className="flex items-center gap-3 sm:gap-5 shrink-0 flex-wrap">
            {[
              { label: "Properties", val: stats?.totalProperties, icon: Building2, color: "#a5b4fc" },
              { label: "Users",      val: stats?.totalUsers,      icon: Users,     color: "#67e8f9" },
              { label: "Inquiries",  val: stats?.totalInquiries,  icon: MessageSquare, color: "#fcd34d" },
            ].map(({ label, val, icon: Icon, color }) => (
              <div key={label} className="flex flex-col items-center">
                <div className="flex items-center gap-1.5">
                  <Icon style={{ width: 11, height: 11, color }} />
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#475569" }}>{label}</span>
                </div>
                <span className="text-[22px] font-black text-white leading-none mt-0.5">
                  {loading ? "—" : (val ?? 0)}
                </span>
              </div>
            ))}

            {!loading && (stats?.pendingProperties ?? 0) > 0 && (
              <Link
                to="/properties?status=pending"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-bold transition-all hover:scale-[1.03] active:scale-[0.97] shrink-0"
                style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)", color: "#fff", boxShadow: "0 4px 16px rgba(245,158,11,0.4)" }}
              >
                <Clock style={{ width: 13, height: 13 }} />
                {stats!.pendingProperties} pending
                <ArrowRight style={{ width: 12, height: 12 }} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonStat key={i} />)
          : statCards.map((c) => <StatCard key={c.label} {...c} />)
        }
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Bar — Properties by City */}
        <div
          className="lg:col-span-3 bg-white rounded-2xl border p-5 flex flex-col"
          style={{ borderColor: "#edf2f7", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-gray-900 text-[13.5px] flex items-center gap-2">
                <MapPin style={{ width: 13, height: 13, color: "#f59e0b" }} />
                Properties by City
              </h2>
              <p className="text-[11px] text-gray-400 mt-0.5 ml-5">Listings across key locations</p>
            </div>
          </div>

          {loading ? (
            <div className="flex-1 h-[200px] animate-pulse bg-gray-50 rounded-xl" />
          ) : (stats?.cityDistribution?.length ?? 0) === 0 ? (
            <div className="flex-1 h-[200px] flex items-center justify-center text-sm text-gray-400">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats!.cityDistribution} barSize={22} barCategoryGap="30%">
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="city"
                  tick={{ fontSize: 10.5, fill: "#94a3b8", fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10.5, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  width={24}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: "#f8fafc", radius: 6 }} />
                <Bar dataKey="count" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Donut — Property Type */}
        <div
          className="lg:col-span-2 bg-white rounded-2xl border p-5 flex flex-col"
          style={{ borderColor: "#edf2f7", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
        >
          <div className="mb-4">
            <h2 className="font-bold text-gray-900 text-[13.5px] flex items-center gap-2">
              <Building2 style={{ width: 13, height: 13, color: "#f59e0b" }} />
              By Property Type
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5 ml-5">Type breakdown</p>
          </div>

          {loading ? (
            <div className="flex-1 h-[180px] animate-pulse bg-gray-50 rounded-xl" />
          ) : (stats?.typeDistribution?.length ?? 0) === 0 ? (
            <div className="flex-1 h-[180px] flex items-center justify-center text-sm text-gray-400">No data yet</div>
          ) : (
            <div className="flex flex-col gap-3 flex-1">
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie
                    data={stats!.typeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {stats!.typeDistribution.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => [v ?? 0, ""]}
                    contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Custom legend */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {stats!.typeDistribution.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-[10.5px] text-gray-500 capitalize truncate">{d.name}</span>
                    <span className="text-[10.5px] font-semibold text-gray-700 ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Listing Type Breakdown ── */}
      {!loading && (stats?.listingDistribution?.length ?? 0) > 0 && (
        <div
          className="bg-white rounded-2xl border p-5"
          style={{ borderColor: "#edf2f7", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-gray-900 text-[13.5px]">Listing Type Distribution</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Sale · Rent · Lease · PG breakdown</p>
            </div>
            <span className="text-xs font-semibold text-gray-400">{stats!.totalProperties} total</span>
          </div>
          <div className="space-y-3">
            {stats!.listingDistribution.map((d, i) => {
              const pct = Math.round((d.count / totalListing) * 100);
              const color = PIE_COLORS[i % PIE_COLORS.length];
              return (
                <div key={d.name} className="flex items-center gap-4">
                  <span className="w-14 text-[12px] font-semibold capitalize text-gray-600">{d.name}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                  <span className="w-8 text-[11.5px] font-bold text-right" style={{ color }}>{pct}%</span>
                  <span className="w-6 text-[11px] text-gray-400 text-right">{d.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Bottom Row: Recent + City Details ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent Listings — 2 cols */}
        <div
          className="lg:col-span-2 bg-white rounded-2xl border overflow-hidden"
          style={{ borderColor: "#edf2f7", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
        >
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #f1f5f9" }}>
            <div>
              <h2 className="font-bold text-gray-900 text-[13.5px]">Recent Listings</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Latest 10 property submissions</p>
            </div>
            <Link
              to="/properties"
              className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors group"
              style={{ color: "#6366f1" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#4f46e5")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#6366f1")}
            >
              View all
              <ArrowRight style={{ width: 12, height: 12 }} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {recentLoading ? (
            <div className="divide-y divide-gray-50">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-xl bg-gray-100 shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 bg-gray-100 rounded w-48 mb-1.5" />
                    <div className="h-2.5 bg-gray-100 rounded w-24" />
                  </div>
                  <div className="h-3 bg-gray-100 rounded w-16" />
                </div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="py-14 text-center">
              <Building2 style={{ width: 36, height: 36, color: "#e2e8f0" }} className="mx-auto mb-3" />
              <p className="text-sm text-gray-400">No properties yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recent.map((p) => {
                const chip = TYPE_CHIP[p.type] ?? { bg: "#f1f5f9", color: "#64748b" };
                return (
                  <div
                    key={p._id}
                    className="px-5 py-3.5 flex items-center gap-3.5 hover:bg-[#fafbfc] transition-colors"
                  >
                    {/* Type icon */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: chip.bg }}
                    >
                      <Building2 style={{ width: 15, height: 15, color: chip.color }} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-[13px] truncate leading-snug">{p.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <MapPin style={{ width: 9, height: 9, color: "#94a3b8" }} />
                        <span className="text-[11px] text-gray-400">{p.location.city}</span>
                        <span className="text-gray-200 text-xs">·</span>
                        <span
                          className="text-[10px] font-semibold capitalize px-1.5 py-0.5 rounded-md"
                          style={{ backgroundColor: chip.bg, color: chip.color }}
                        >
                          {p.type}
                        </span>
                      </div>
                    </div>

                    {/* Price + status */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[12.5px] font-bold" style={{ color: "#f59e0b" }}>
                        {formatPrice(p.price)}
                      </span>
                      <StatusBadge status={p.status} />
                    </div>

                    {/* Review link */}
                    <Link
                      to={`/properties?search=${encodeURIComponent(p.title)}`}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0"
                      style={{ background: "#eef2ff", color: "#6366f1" }}
                      title="Review"
                      onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#e0e7ff")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#eef2ff")}
                    >
                      <ArrowRight style={{ width: 12, height: 12 }} />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right col: City list + quick links */}
        <div className="flex flex-col gap-4">

          {/* Top cities */}
          <div
            className="bg-white rounded-2xl border p-5 flex-1"
            style={{ borderColor: "#edf2f7", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
          >
            <h2 className="font-bold text-gray-900 text-[13.5px] mb-4 flex items-center gap-2">
              <MapPin style={{ width: 13, height: 13, color: "#f59e0b" }} />
              Top Cities
            </h2>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="h-2.5 bg-gray-100 rounded w-16" />
                    <div className="flex-1 h-2 bg-gray-100 rounded-full" />
                    <div className="h-2.5 bg-gray-100 rounded w-6" />
                  </div>
                ))}
              </div>
            ) : (stats?.cityDistribution?.length ?? 0) === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No data yet</p>
            ) : (
              <div className="space-y-2.5">
                {stats!.cityDistribution.slice(0, 6).map((c, i) => {
                  const pct = Math.round((c.count / maxCity) * 100);
                  return (
                    <div key={c.city} className="flex items-center gap-3">
                      <span className="w-[72px] text-[11.5px] font-medium text-gray-600 truncate">{c.city}</span>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: i === 0 ? "#6366f1" : i === 1 ? "#f59e0b" : "#c7d2fe",
                          }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-gray-500 w-5 text-right">{c.count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div
            className="bg-white rounded-2xl border p-4 space-y-2"
            style={{ borderColor: "#edf2f7", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Quick Actions</p>
            {[
              {
                to: "/properties?status=pending",
                label: "Review Pending",
                sub: `${stats?.pendingProperties ?? 0} awaiting`,
                icon: Clock,
                bg: "#fffbeb",
                color: "#d97706",
              },
              {
                to: "/properties",
                label: "All Properties",
                sub: `${stats?.totalProperties ?? 0} listings`,
                icon: Building2,
                bg: "#eef2ff",
                color: "#6366f1",
              },
              {
                to: "/inquiries",
                label: "Inquiries",
                sub: `${stats?.totalInquiries ?? 0} total`,
                icon: MessageSquare,
                bg: "#f5f3ff",
                color: "#7c3aed",
              },
              {
                to: "/users",
                label: "Users",
                sub: `${stats?.totalUsers ?? 0} accounts`,
                icon: Users,
                bg: "#f0fdf4",
                color: "#059669",
              },
            ].map(({ to, label, sub, icon: Icon, bg, color }) => (
              <Link
                key={to}
                to={to}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:shadow-sm"
                style={{ backgroundColor: bg }}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
                  <Icon style={{ width: 13, height: 13, color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold leading-none" style={{ color }}>{label}</p>
                  <p className="text-[10.5px] mt-0.5 opacity-70" style={{ color }}>{sub}</p>
                </div>
                <ArrowRight style={{ width: 12, height: 12, color, opacity: 0.5 }} className="group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>

          {/* Platform health */}
          <div
            className="bg-white rounded-2xl border p-5"
            style={{ borderColor: "#edf2f7", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
          >
            <h2 className="font-bold text-gray-900 text-[13px] mb-3">Platform Health</h2>
            <div className="space-y-2.5">
              {[
                {
                  label: "Approval Rate",
                  val: stats
                    ? `${Math.round(((stats.approvedProperties) / Math.max(stats.totalProperties, 1)) * 100)}%`
                    : "—",
                  icon: CheckCircle2,
                  color: "#059669",
                },
                {
                  label: "Avg. Views / Property",
                  val: stats && stats.totalProperties > 0
                    ? Math.round(stats.totalViews / stats.totalProperties).toLocaleString()
                    : "—",
                  icon: Eye,
                  color: "#0284c7",
                },
                {
                  label: "Inquiry Rate",
                  val: stats && stats.totalProperties > 0
                    ? `${((stats.totalInquiries / stats.totalProperties) * 100).toFixed(1)}%`
                    : "—",
                  icon: MessageSquare,
                  color: "#7c3aed",
                },
              ].map(({ label, val, icon: Icon, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon style={{ width: 12, height: 12, color }} />
                    <span className="text-[11.5px] text-gray-500">{label}</span>
                  </div>
                  <span className="text-[12.5px] font-bold" style={{ color }}>{loading ? "—" : val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
