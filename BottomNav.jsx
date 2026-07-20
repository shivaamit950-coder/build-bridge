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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2 pb-[calc(env(safe-area-inset-bottom)+8px)]">
        {TABS.map((tab) => {
          const active = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors"
            >
              <span className={`text-lg ${active ? "text-royal" : "text-slate-400"}`}>{tab.icon}</span>
              <span className={`text-[10px] font-medium ${active ? "text-royal" : "text-slate-400"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
