import { type ElementType, useEffect, useRef, useState } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ElementType;
  accentColor: string;
  iconBg: string;
  sub?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

function useCountUp(target: number, duration = 1000) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // ease-out-expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return count;
}

export default function StatCard({
  label, value, icon: Icon, accentColor, sub,
  gradientFrom, gradientTo,
}: StatCardProps) {
  const isNumeric = typeof value === "number";
  const animated  = useCountUp(isNumeric ? (value as number) : 0);
  const display   = isNumeric ? animated : value;

  const gFrom = gradientFrom ?? accentColor;
  const gTo   = gradientTo   ?? accentColor;

  return (
    <div
      className="bg-white rounded-2xl p-5 flex items-center gap-4 group cursor-default overflow-hidden relative transition-all duration-250 hover:-translate-y-1"
      style={{ border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 28px ${accentColor}25, 0 2px 8px rgba(0,0,0,0.06)`;
        (e.currentTarget as HTMLDivElement).style.borderColor = `${accentColor}30`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "#f1f5f9";
      }}
    >
      {/* Gradient top bar appears on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-[2.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-250 rounded-t-2xl"
        style={{ background: `linear-gradient(to right, ${gFrom}, ${gTo})` }}
      />

      {/* Very subtle radial glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 rounded-2xl pointer-events-none"
        style={{ background: `radial-gradient(ellipse 70% 60% at 10% 10%, ${accentColor}0c 0%, transparent 70%)` }}
      />

      {/* Icon */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-250 group-hover:scale-110 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${gFrom}18 0%, ${gTo}12 100%)`, border: `1.5px solid ${accentColor}18` }}
      >
        <Icon style={{ width: 21, height: 21, color: accentColor }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 relative z-10">
        <p className="text-[28px] font-black leading-none tracking-tight text-gray-900 animate-count-reveal">
          {display}
        </p>
        <p className="text-[12.5px] font-semibold text-gray-500 mt-1.5 leading-none">{label}</p>
        {sub && (
          <p className="text-[11px] mt-1 font-medium" style={{ color: `${accentColor}bb` }}>{sub}</p>
        )}
      </div>
    </div>
  );
}
