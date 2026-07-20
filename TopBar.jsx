"use client";
import Link from "next/link";
import { useTheme } from "./ThemeProvider";

export default function TopBar({ notifCount = 0, showMessages = false }) {
  const { dark, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-lg border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-lg mx-auto flex items-center justify-between px-5 py-3.5">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-royal flex items-center justify-center text-white text-xs font-bold">
            BB
          </span>
          <span className="font-semibold text-sm text-navy dark:text-white">BuildBridge</span>
        </Link>

        <div className="flex items-center gap-3">
          {showMessages && (
            <Link
              href="/messages"
              aria-label="Messages"
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
            >
              ◎
            </Link>
          )}
          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
          >
            {dark ? "☀" : "☾"}
          </button>
          <Link
            href="/notifications"
            className="relative w-8 h-8 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
          >
            🔔
            {notifCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald" />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
