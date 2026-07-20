"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import { useAuth } from "@/components/AuthProvider";

const STARTERS = [
  "Review my startup idea",
  "What roles does my project need?",
  "Estimate rough costs for my idea",
  "What should my next step be?",
];

export default function AIPage() {
  const [tab, setTab] = useState("match"); // match | assistant
  const [provider, setProvider] = useState(null); // null until we know what's actually available
  const [available, setAvailable] = useState(null);

  useEffect(() => {
    fetch("/api/ai-providers")
      .then((r) => r.json())
      .then((data) => {
        setAvailable(data.providers);
        const firstWorking = Object.entries(data.providers).find(([, v]) => v.available);
        setProvider(firstWorking ? firstWorking[0] : null);
      })
      .catch(() => setAvailable({}));
  }, []);

  return (
    <main className="max-w-lg mx-auto flex flex-col h-screen">
      <TopBar />
      <div className="px-5 pt-5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-royal">✦</span>
            <h1 className="text-xl font-semibold text-navy dark:text-white">AI</h1>
          </div>
          {available && <ProviderToggle provider={provider} setProvider={setProvider} available={available} />}
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
          One place for AI-powered matching and idea help.
        </p>
        <div className="flex gap-2 mb-2">
          <TabButton active={tab === "match"} onClick={() => setTab("match")}>Find Matches</TabButton>
          <TabButton active={tab === "assistant"} onClick={() => setTab("assistant")}>Ask Assistant</TabButton>
        </div>
      </div>

      {available && !provider ? (
        <div className="px-5 py-6">
          <div className="card p-5 text-center">
            <p className="text-sm font-medium text-navy dark:text-white mb-1">No AI provider connected yet</p>
            <p className="text-xs text-slate-400">
              Add ANTHROPIC_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY in Vercel's environment variables, then redeploy.
            </p>
          </div>
        </div>
      ) : tab === "match" ? (
        <MatchPanel provider={provider} />
      ) : (
        <AssistantPanel provider={provider} />
      )}
    </main>
  );
}

function ProviderToggle({ provider, setProvider, available }) {
  const options = [
    { key: "claude", label: "Claude" },
    { key: "chatgpt", label: "ChatGPT" },
    { key: "gemini", label: "Gemini" },
  ].filter((o) => available[o.key]?.available);

  if (options.length === 0) return null;

  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-full p-1">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => setProvider(o.key)}
          className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
            provider === o.key ? "bg-white dark:bg-[#111827] text-navy dark:text-white shadow-softer" : "text-slate-400"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        active ? "bg-navy text-white dark:bg-royal" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
      }`}
    >
      {children}
    </button>
  );
}

function MatchPanel({ provider }) {
  const [matches, setMatches] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { requireAuth } = useAuth();

  async function runMatch() {
    if (!requireAuth()) return; // opens the floating sign-in dropdown for guests, stops here
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setMatches(data.matches);
    } catch {
      setError("Something went wrong. Try again.");
    }
    setLoading(false);
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 py-5">
      {!matches && (
        <button
          onClick={runMatch}
          disabled={loading}
          className="w-full px-5 py-4 rounded-2xl bg-royal disabled:opacity-50 text-white text-sm font-medium shadow-soft"
        >
          {loading ? "Analyzing profiles…" : "Find my matches"}
        </button>
      )}

      {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
      {matches && matches.length === 0 && (
        <div className="card p-8 text-center mt-4">
          <p className="text-sm text-slate-400">No other builders to match with yet.</p>
        </div>
      )}

      <div className="space-y-3 mt-4">
        {matches?.map((m) => (
          <Link key={m.id} href={`/profile/${m.id}`} className="card p-4 flex gap-3 items-start fade-in">
            <div className="w-11 h-11 rounded-full bg-royal-50 dark:bg-royal/10 flex items-center justify-center text-royal font-semibold shrink-0">
              {m.profile.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-navy dark:text-white truncate">{m.profile.name}</p>
                <ScoreBadge score={m.score} />
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{m.reasoning}</p>
            </div>
          </Link>
        ))}
      </div>

      {matches && matches.length > 0 && (
        <button
          onClick={runMatch}
          disabled={loading}
          className="w-full mt-4 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-navy dark:text-white text-xs font-medium"
        >
          {loading ? "Refreshing…" : "Refresh matches"}
        </button>
      )}
    </div>
  );
}

function ScoreBadge({ score }) {
  const color = score >= 75 ? "emerald" : score >= 50 ? "royal" : "slate";
  const colorMap = {
    emerald: "bg-emerald-50 text-emerald dark:bg-emerald/10",
    royal: "bg-royal-50 text-royal dark:bg-royal/10",
    slate: "bg-slate-100 text-slate-500 dark:bg-slate-800",
  };
  return <span className={`text-[11px] font-semibold px-2 py-1 rounded-full shrink-0 ${colorMap[color]}`}>{score}% fit</span>;
}

function AssistantPanel({ provider }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hey — tell me about what you're building, or ask me anything about your idea, plan, team, or next steps." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const { requireAuth } = useAuth();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(text) {
    const content = text ?? input;
    if (!content.trim() || loading) return;
    if (!requireAuth()) return; // opens the floating sign-in dropdown for guests, stops here
    const newMessages = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, provider }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.error ? "Something went wrong: " + data.error : data.reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Something went wrong. Try again." }]);
    }
    setLoading(false);
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} fade-in`}>
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user" ? "bg-royal text-white rounded-br-md" : "card text-navy dark:text-slate-200 rounded-bl-md"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div className="card px-4 py-3 rounded-2xl rounded-bl-md text-sm text-slate-400 w-fit">Thinking…</div>}
        {messages.length === 1 && (
          <div className="grid grid-cols-2 gap-2 pt-2">
            {STARTERS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-left text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-royal hover:text-royal transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex gap-2 sticky bottom-20 bg-white dark:bg-[#0B1120]"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your idea, plan, or next steps…"
          className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] outline-none focus:border-royal text-sm text-navy dark:text-white"
        />
        <button type="submit" disabled={loading} className="px-4 py-3 rounded-2xl bg-royal disabled:opacity-50 text-white text-sm font-medium shadow-soft">
          Send
        </button>
      </form>
    </div>
  );
}
