"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomeSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/discover?q=${encodeURIComponent(query)}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-amber-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="What do you want to build?"
        className="relative w-full pl-6 pr-16 py-4 rounded-2xl border border-amber-500/30 hover:border-amber-500/50 focus:border-amber-400 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 shadow-lg hover:shadow-amber-500/10 dark:shadow-amber-500/5 outline-none transition-all text-sm text-navy dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </button>
    </form>
  );
}
