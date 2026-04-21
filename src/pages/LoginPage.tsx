import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Eye, EyeOff, Loader2, ShieldCheck,
  Building2, MapPin, TrendingUp, Users,
} from "lucide-react";

const FEATURES = [
  { icon: Building2,  label: "Manage Properties",  desc: "Approve, reject & feature listings" },
  { icon: Users,      label: "User Management",     desc: "Control roles and account access"  },
  { icon: TrendingUp, label: "Analytics Overview",  desc: "Track views, inquiries and growth" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [email,    setEmail]   = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]  = useState(false);
  const [error,    setError]   = useState("");
  const [loading,  setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
        className="hidden lg:flex flex-col justify-between w-[460px] shrink-0 px-12 py-12 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)" }}
      >
        {/* Animated aurora overlay */}
        <div
          className="absolute inset-0 animate-aurora opacity-50"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.4) 0%, rgba(6,182,212,0.25) 50%, rgba(99,102,241,0.3) 100%)",
          }}
        />

        {/* Floating orb 1 */}
        <div
          className="absolute top-16 right-8 w-60 h-60 rounded-full pointer-events-none animate-float animate-glow-pulse"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)" }}
        />
        {/* Floating orb 2 */}
        <div
          className="absolute bottom-28 -left-10 w-52 h-52 rounded-full pointer-events-none animate-float2"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.22) 0%, transparent 70%)" }}
        />
        {/* Floating orb 3 */}
        <div
          className="absolute top-1/2 right-4 w-36 h-36 rounded-full pointer-events-none animate-blob-drift delay-300"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)" }}
        />

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />

        {/* Spinning ring */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full pointer-events-none animate-spin-slow opacity-[0.07]"
          style={{ border: "1px dashed #a5b4fc" }}
        />

        {/* ── Logo ── */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, #6366f1, #06b6d4)",
              boxShadow: "0 0 20px rgba(99,102,241,0.5)",
            }}
          >
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-black text-[14px] leading-none tracking-tight">
              <span className="text-white">Gaejraaj </span>
              <span className="grad-text-indigo">Properties</span>
            </p>
            <p className="text-[9px] font-bold tracking-[0.22em] uppercase mt-1" style={{ color: "#334155" }}>
              Admin Panel
            </p>
          </div>
        </div>

        {/* ── Hero text ── */}
        <div className="relative z-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-semibold"
            style={{ background: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.25)" }}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Secure Admin Access
          </div>

          <h1 className="text-[42px] font-black text-white leading-[1.05] mb-4 tracking-tight">
            Manage your<br />real estate<br />
            <span className="grad-text-aurora">empire.</span>
          </h1>

          <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
            Full control over listings, users &amp; inquiries<br />
            across Uttarakhand &amp; Western UP.
          </p>

          <div className="mt-8 space-y-4">
            {FEATURES.map(({ icon: Icon, label, desc }, i) => (
              <div
                key={label}
                className="flex items-start gap-3.5 animate-slide-in-left"
                style={{ animationDelay: `${i * 100 + 150}ms` }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.2)" }}
                >
                  <Icon className="w-4 h-4" style={{ color: "#a5b4fc" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#475569" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="relative z-10 flex items-center gap-2 text-xs" style={{ color: "#334155" }}>
          <MapPin className="w-3.5 h-3.5" />
          Serving Uttarakhand &amp; Western Uttar Pradesh
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white">
        {/* Subtle top-right decoration */}
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none animate-glow-pulse opacity-30"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)" }}
        />

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-10">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6366f1, #06b6d4)" }}
          >
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-[14px] tracking-tight">
            <span className="text-slate-800">Gaejraaj </span>
            <span className="grad-text-indigo">Properties</span>
          </span>
        </div>

        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-8">
            <h2 className="text-[26px] font-black text-gray-900 leading-tight">Welcome back</h2>
            <p className="text-sm text-slate-400 mt-1.5">Sign in to your admin account</p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-5 animate-fade-up">
              <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold">!</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12.5px] font-semibold text-slate-600 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required autoFocus autoComplete="email"
                placeholder="admin@gaejraaj.com"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-gray-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-[12.5px] font-semibold text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-gray-900 placeholder:text-slate-300 pr-11 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] mt-1"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                boxShadow: "0 4px 18px rgba(99,102,241,0.35)",
              }}
              onMouseEnter={(e) => !loading && ((e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 24px rgba(99,102,241,0.5)")}
              onMouseLeave={(e) => !loading && ((e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 18px rgba(99,102,241,0.35)")}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="text-xs text-center text-slate-300 mt-8">
            Protected area — authorised personnel only
          </p>
        </div>
      </div>
    </div>
  );
}
