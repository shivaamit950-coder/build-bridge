"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Home", icon: "⌂" },
  { href: "/ai", label: "AI", icon: "✦" },
  { href: "/messages", label: "Messages", icon: "◎" },
  { href: "/profile", label: "Profile", icon: "◐" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const hideOn = ["/auth", "/onboarding"];
  if (hideOn.includes(pathname)) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-white via-white/95 to-white/80 dark:from-slate-950 dark:via-[#0a0d12]/95 dark:to-[#0a0d12]/80 backdrop-blur-xl border-t border-amber-500/10 dark:border-amber-500/20 shadow-2xl">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        {TABS.map((tab) => {
          const active = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1.5 px-4 py-2 rounded-xl transition-all duration-200 ${
                active
                  ? "text-amber-600 dark:text-amber-500 bg-amber-500/10 dark:bg-amber-500/15"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <span className={`text-xl transition-transform ${active ? "scale-110" : "scale-100"}`}>
                {tab.icon}
              </span>
              <span className="text-[10px] font-semibold">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
