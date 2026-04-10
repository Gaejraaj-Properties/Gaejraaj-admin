import { ElementType } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ElementType;
  accentColor: string;
  iconBg: string;
  sub?: string;
  href?: string;
}

export default function StatCard({
  label, value, icon: Icon, accentColor, iconBg, sub,
}: StatCardProps) {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-all duration-200 group cursor-default overflow-hidden relative"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: accentColor }}
      />

      {/* Icon */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
        style={{ backgroundColor: iconBg }}
      >
        <Icon style={{ width: 20, height: 20, color: accentColor }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[27px] font-extrabold leading-none tracking-tight"
          style={{ color: "#0f172a" }}
        >
          {value}
        </p>
        <p className="text-[12.5px] font-semibold text-gray-500 mt-1.5 leading-none">{label}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}
