"use client";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { createClient } from "@/supabaseClient";

const AuthContext = createContext({ user: null, loading: true, requireAuth: () => false });

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) setDropdownOpen(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  function requireAuth() {
    if (user) return true;
    setDropdownOpen(true);
    return false;
  }

  return (
    <AuthContext.Provider value={{ user, loading, requireAuth }}>
      {children}
      {!loading && !user && (
        <FloatingSignIn open={dropdownOpen} setOpen={setDropdownOpen} />
      )}
    </AuthContext.Provider>
  );
}

function FloatingSignIn({ open, setOpen }) {
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef(null);
  const supabase = createClient();

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setShowEmail(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, setOpen]);

  async function handleGoogle() {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${window.location.pathname}` },
    });
  }

  async function handleEmailSend(e) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding` },
    });
    setLoading(false);
    if (!error) setSent(true);
  }

  return (
    <div ref={wrapRef} className="fixed bottom-24 left-5 z-40">
      {open && (
        <div className="absolute bottom-16 left-0 w-72 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 dark:from-[#0f1419] dark:to-[#0a0d12] border border-amber-500/20 shadow-2xl space-y-3 p-4">
          {sent ? (
            <div className="text-center">
              <p className="text-xs text-amber-200/90 p-2 font-medium">
                ✓ Check your email for a sign-in link
              </p>
            </div>
          ) : !showEmail ? (
            <>
              <p className="text-[11px] text-amber-100/60 font-medium uppercase tracking-wider mb-3">Join BuildBridge</p>
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-semibold transition-all shadow-lg hover:shadow-amber-500/30 disabled:opacity-50"
              >
                <GoogleIcon />
                {loading ? "Connecting…" : "Continue with Google"}
              </button>
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700/50"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-gradient-to-br from-slate-900 to-slate-950 text-slate-400">or</span>
                </div>
              </div>
              <button
                onClick={() => setShowEmail(true)}
                className="w-full px-4 py-3 rounded-xl border border-amber-500/40 hover:border-amber-500/60 bg-slate-800/40 hover:bg-slate-700/50 text-amber-200 text-xs font-medium transition-all"
              >
                Continue with Email
              </button>
            </>
          ) : (
            <form onSubmit={handleEmailSend} className="space-y-3">
              <p className="text-[11px] text-amber-100/60 font-medium">Enter your email</p>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-amber-500/30 bg-slate-800/60 outline-none focus:border-amber-400 text-white text-xs placeholder:text-slate-400 transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-semibold transition-all shadow-lg disabled:opacity-50"
              >
                {loading ? "Sending…" : "Send Sign-In Link"}
              </button>
            </form>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Sign in"
        className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-2xl shadow-amber-500/30 flex items-center justify-center text-2xl hover:scale-110 transition-transform duration-200"
      >
        {open ? "✕" : "👤"}
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18">
      <path fill="#ffffff" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.09-1.8 2.73v2.27h2.92c1.7-1.57 2.68-3.88 2.68-6.64z" />
      <path fill="#ffffff" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.27c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33C2.44 15.98 5.48 18 9 18z" />
      <path fill="#ffffff" d="M3.97 10.7c-.18-.54-.28-1.11-.28-1.7s.1-1.16.28-1.7V4.97H.96A8.996 8.996 0 000 9c0 1.45.35 2.83.96 4.03l3.01-2.33z" />
      <path fill="#ffffff" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.97l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}
