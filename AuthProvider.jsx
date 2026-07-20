"use client";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabaseClient";

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

  // Any page/component can call requireAuth() before an action (message, post, save, etc).
  // Returns true if already signed in (go ahead); if not, opens the sign-in dropdown and returns false.
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
    <div ref={wrapRef} className="fixed bottom-24 right-5 z-40">
      {open && (
        <div className="absolute bottom-16 right-0 w-64 card p-3 shadow-soft fade-in space-y-2">
          {sent ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 p-2">
              Check your email for a sign-in link.
            </p>
          ) : !showEmail ? (
            <>
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white dark:bg-[#1a2234] border border-slate-200 dark:border-slate-700 text-xs font-medium text-navy dark:text-white disabled:opacity-50"
              >
                <GoogleIcon />
                {loading ? "Connecting…" : "Continue with Google"}
              </button>
              <button
                onClick={() => setShowEmail(true)}
                className="w-full text-center text-[11px] text-slate-400 hover:text-slate-500 py-1"
              >
                or use email
              </button>
            </>
          ) : (
            <form onSubmit={handleEmailSend} className="space-y-2">
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-[#111827] outline-none focus:border-royal text-xs"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full px-3 py-2 rounded-xl bg-royal text-white text-xs font-medium disabled:opacity-50"
              >
                {loading ? "Sending…" : "Send link"}
              </button>
            </form>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Sign in"
        className="w-14 h-14 rounded-full bg-royal text-white shadow-soft flex items-center justify-center text-xl hover:bg-royal-600 transition-colors"
      >
        {open ? "×" : "👤"}
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.09-1.8 2.73v2.27h2.92c1.7-1.57 2.68-3.88 2.68-6.64z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.27c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33C2.44 15.98 5.48 18 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.7c-.18-.54-.28-1.11-.28-1.7s.1-1.16.28-1.7V4.97H.96A8.996 8.996 0 000 9c0 1.45.35 2.83.96 4.03l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.97l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}
