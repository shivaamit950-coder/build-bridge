import { SkeletonLine, SkeletonHRow } from "@/components/Skeletons";

export default function HomeLoading() {
  return (
    <main className="max-w-lg mx-auto">
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <SkeletonLine width="w-32" height="h-6" />
        <div className="skeleton w-8 h-8 rounded-full" />
      </div>

      <div className="px-5 mb-6">
        <div className="skeleton w-full h-14 rounded-3xl" />
      </div>

      <div className="px-5 space-y-3 mb-6">
        <div className="skeleton w-full h-36 rounded-3xl" />
        <div className="skeleton w-full h-36 rounded-3xl" />
      </div>

      <div className="px-5 mb-3">
        <SkeletonLine width="w-40" />
      </div>
      <SkeletonHRow count={3} />

      <div className="px-5 mb-3 mt-6">
        <SkeletonLine width="w-36" />
      </div>
      <SkeletonHRow count={4} />
    </main>
  );
}
