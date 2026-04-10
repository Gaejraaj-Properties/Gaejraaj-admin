import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Eye, EyeOff, Loader2, ShieldCheck, Building2, MapPin, TrendingUp, Users } from "lucide-react";

const FEATURES = [
  { icon: Building2,   label: "Manage Properties",    desc: "Approve, reject, and feature listings" },
  { icon: Users,       label: "User Management",       desc: "Control roles and account access" },
  { icon: TrendingUp,  label: "Analytics Overview",    desc: "Track views, inquiries, and growth" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [email,    setEmail]   = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]  = useState(false);
  const [error,    setError]   = useState("");
  const [loading,  setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setError(
        msg.includes("Access denied")
          ? "Access denied — admin accounts only."
          : "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 px-12 py-12"
        style={{ background: "linear-gradient(160deg, #0f2044 0%, #1B3F72 100%)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#C8922A" }}>
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-extrabold text-sm leading-none tracking-tight">
              <span className="text-white">Gaejraaj </span>
              <span style={{ color: "#C8922A" }}>Properties</span>
            </p>
            <p className="text-[9px] mt-1 font-semibold tracking-[0.2em] uppercase" style={{ color: "#5a82b0" }}>Admin Panel</p>
          </div>
        </div>

        {/* Hero text */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-semibold" style={{ background: "rgba(200,146,42,0.15)", color: "#C8922A", border: "1px solid rgba(200,146,42,0.3)" }}>
            <ShieldCheck className="w-3.5 h-3.5" />
            Secure Admin Access
          </div>
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Manage your<br />real estate<br />
            <span style={{ color: "#C8922A" }}>empire.</span>
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "#93b4d9" }}>
            Full control over listings, users, and inquiries across Uttarakhand &amp; Western UP.
          </p>

          {/* Feature list */}
          <div className="mt-8 space-y-4">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <Icon className="w-4 h-4" style={{ color: "#ADC8EE" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#93b4d9" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 text-xs" style={{ color: "#4a6fa5" }}>
          <MapPin className="w-3.5 h-3.5" />
          Serving Uttarakhand &amp; Western Uttar Pradesh
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#C8922A" }}>
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-sm leading-none tracking-tight">
            <span className="text-[#1B3F72]">Gaejraaj </span>
            <span style={{ color: "#C8922A" }}>Properties</span>
          </span>
        </div>

        <div className="w-full max-w-sm animate-fade-up">
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-sm text-gray-500 mt-1.5">Sign in to your admin account</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
              <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-red-200 flex items-center justify-center text-xs font-bold">!</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="email"
                placeholder="admin@gaejraaj.com"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
                style={{ "--tw-ring-color": "#ADC8EE" } as React.CSSProperties}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 pr-11 focus:outline-none focus:ring-2 focus:border-transparent transition"
                  style={{ "--tw-ring-color": "#ADC8EE" } as React.CSSProperties}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
              style={{ background: loading ? "#4a6fa5" : "#1B3F72" }}
              onMouseEnter={(e) => !loading && ((e.currentTarget as HTMLButtonElement).style.background = "#142f55")}
              onMouseLeave={(e) => !loading && ((e.currentTarget as HTMLButtonElement).style.background = "#1B3F72")}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="text-xs text-center text-gray-400 mt-8">
            Protected area — authorised personnel only
          </p>
        </div>
      </div>
    </div>
  );
}
