"use client";
import { useAuth } from "@/AuthProvider";

export default function SignInPrompt({ title, description }) {
  const { requireAuth } = useAuth();

  return (
    <div className="card p-8 text-center mx-5 mt-4">
      <div className="w-11 h-11 rounded-full bg-royal-50 dark:bg-royal/10 flex items-center justify-center text-royal mx-auto mb-3">
        →
      </div>
      <p className="text-sm font-medium text-navy dark:text-white mb-1">{title}</p>
      <p className="text-xs text-slate-400 mb-4">{description}</p>
      <button
        onClick={() => requireAuth()}
        className="px-5 py-2.5 rounded-xl bg-royal text-white text-xs font-medium shadow-soft"
      >
        Sign in
      </button>
    </div>
  );
}
