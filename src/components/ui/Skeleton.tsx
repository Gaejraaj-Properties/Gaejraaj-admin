interface SkeletonLineProps {
  className?: string;
}

export function SkeletonLine({ className = "" }: SkeletonLineProps) {
  return (
    <div
      className={`bg-gray-200 rounded-md animate-pulse ${className}`}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
      {/* Icon box */}
      <div className="w-11 h-11 rounded-xl bg-gray-200 animate-pulse shrink-0" />
      <div className="flex-1 space-y-2.5 py-0.5">
        <SkeletonLine className="h-6 w-20" />
        <SkeletonLine className="h-3.5 w-32" />
        <SkeletonLine className="h-3 w-24" />
      </div>
    </div>
  );
}

interface SkeletonTableProps {
  rows?: number;
}

export function SkeletonTable({ rows = 6 }: SkeletonTableProps) {
  return (
    <div className="overflow-hidden">
      {/* Header row */}
      <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-6">
        <SkeletonLine className="h-3 w-28" />
        <SkeletonLine className="h-3 w-20" />
        <SkeletonLine className="h-3 w-16" />
        <SkeletonLine className="h-3 w-16" />
        <SkeletonLine className="h-3 w-12" />
        <SkeletonLine className="h-3 w-20 ml-auto" />
      </div>
      {/* Data rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="px-4 py-3.5 flex items-center gap-6 border-b border-gray-50"
        >
          {/* Name + sub */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse shrink-0" />
            <div className="space-y-1.5 flex-1">
              <SkeletonLine className="h-3.5 w-36" />
              <SkeletonLine className="h-2.5 w-24" />
            </div>
          </div>
          <SkeletonLine className="h-3 w-20 hidden sm:block" />
          <SkeletonLine className="h-5 w-14 rounded-full" />
          <SkeletonLine className="h-5 w-12 rounded-full hidden md:block" />
          <SkeletonLine className="h-3 w-16 hidden lg:block" />
          {/* Actions */}
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="w-7 h-7 rounded-lg bg-gray-200 animate-pulse" />
            <div className="w-7 h-7 rounded-lg bg-gray-200 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
