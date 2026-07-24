"use client";

export default function Error({ error, reset }) {
  return (
    <div className="max-w-lg mx-auto px-5 py-10 text-center">
      <h1 className="text-2xl font-bold text-navy dark:text-white mb-4">Something went wrong</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-6">{error.message}</p>
      <button
        onClick={() => reset()}
        className="px-6 py-2 bg-royal text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
