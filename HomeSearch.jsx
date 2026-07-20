"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomeSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    router.push(`/discover?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="What do you want to build?"
        className="w-full pl-5 pr-14 py-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-soft outline-none focus:border-royal text-sm text-navy dark:text-white placeholder:text-slate-400"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-royal text-white flex items-center justify-center hover:bg-royal-600 transition-colors"
      >
        ⌕
      </button>
    </form>
  );
}
