export default function Loading() {
  return (
    <div className="max-w-lg mx-auto">
      <div className="px-5 pt-6 pb-4 space-y-4">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4 animate-pulse" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/2 animate-pulse" />
      </div>
      <div className="space-y-3 px-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}
