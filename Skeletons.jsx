// Reusable skeleton building blocks — same radii, spacing, and card shape as
// real content, so nothing visually "jumps" when data finishes loading.

export function SkeletonLine({ width = "w-full", height = "h-3" }) {
  return <div className={`skeleton ${width} ${height} rounded-full`} />;
}

export function SkeletonAvatar({ size = "w-11 h-11" }) {
  return <div className={`skeleton ${size} rounded-full shrink-0`} />;
}

export function SkeletonRow() {
  return (
    <div className="card p-4 flex items-center gap-3">
      <SkeletonAvatar />
      <div className="flex-1 space-y-2">
        <SkeletonLine width="w-1/3" />
        <SkeletonLine width="w-2/3" height="h-2.5" />
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card p-4 min-w-[220px] space-y-3">
      <div className="flex justify-between items-start gap-2">
        <SkeletonLine width="w-2/3" />
        <div className="skeleton w-14 h-5 rounded-full shrink-0" />
      </div>
      <SkeletonLine height="h-2.5" />
      <SkeletonLine width="w-1/2" height="h-2.5" />
      <div className="flex gap-2 pt-1">
        <div className="skeleton w-16 h-5 rounded-full" />
        <div className="skeleton w-12 h-5 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonHRow({ count = 4 }) {
  return (
    <div className="flex gap-3 overflow-x-auto px-5 pb-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
