import { SkeletonLine, SkeletonRow } from "@/components/Skeletons";

export default function DiscoverLoading() {
  return (
    <main className="max-w-lg mx-auto px-5 pt-6">
      <SkeletonLine width="w-28" height="h-6" />
      <div className="flex gap-2 my-4">
        <div className="skeleton w-24 h-9 rounded-xl" />
        <div className="skeleton w-24 h-9 rounded-xl" />
      </div>
      <div className="skeleton w-full h-12 rounded-2xl mb-3" />
      <div className="flex gap-2 mb-5">
        <div className="skeleton w-24 h-9 rounded-xl" />
        <div className="skeleton w-28 h-9 rounded-xl" />
        <div className="skeleton w-20 h-9 rounded-xl" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    </main>
  );
}
