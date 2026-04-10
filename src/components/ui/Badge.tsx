interface StatusBadgeProps {
  status: string;
}

const STATUS_MAP: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  // Property statuses
  pending:  { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400" },
  approved: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  rejected: { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500" },
  sold:     { bg: "bg-gray-100",   text: "text-gray-600",    dot: "bg-gray-400" },
  rented:   { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-400" },

  // Inquiry statuses
  new:      { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-400" },
  read:     { bg: "bg-gray-100",   text: "text-gray-600",    dot: "bg-gray-400" },
  replied:  { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  closed:   { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-400" },

  // User roles
  admin:    { bg: "bg-violet-50",  text: "text-violet-700",  dot: "bg-violet-500" },
  agent:    { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-400" },
  seller:   { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  buyer:    { bg: "bg-gray-100",   text: "text-gray-600",    dot: "bg-gray-400" },

  // User status
  active:   { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  inactive: { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-400" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const lower = status?.toLowerCase() ?? "";
  const style = STATUS_MAP[lower] ?? {
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${style.bg} ${style.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
      {lower}
    </span>
  );
}
