"use client";
import { useState } from "react";
import { createClient } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import ProjectCard from "@/ProjectCard";

export default function ProfileEditor({ profile, projects }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: profile?.name || "",
    headline: profile?.headline || "",
    bio: profile?.bio || "",
    portfolio_url: profile?.portfolio_url || "",
    skills_have: (profile?.skills_have || []).join(", "),
  });
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function save() {
    setSaving(true);
    await supabase
      .from("profiles")
      .update({
        name: form.name,
        headline: form.headline,
        bio: form.bio,
        portfolio_url: form.portfolio_url,
        skills_have: form.skills_have.split(",").map((s) => s.trim()).filter(Boolean),
      })
      .eq("id", profile.id);
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/auth");
  }

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-royal-50 dark:bg-royal/10 flex items-center justify-center text-royal font-semibold text-xl">
          {profile.name?.[0]?.toUpperCase() || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-navy dark:text-white truncate">{profile.name}</h1>
            {profile.verified && <span className="text-emerald text-xs">✓</span>}
          </div>
          <p className="text-xs text-slate-400 truncate">{profile.headline || profile.location}</p>
        </div>
        <button
          onClick={() => setEditing((e) => !e)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-navy dark:text-white"
        >
          {editing ? "Cancel" : "Edit"}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Reputation" value={profile.reputation_score ?? 0} />
        <Stat label="Projects" value={projects.length} />
        <Stat label="Experience" value={profile.experience_years ? `${profile.experience_years}y` : "—"} />
      </div>

      {editing ? (
        <div className="space-y-3">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="input" />
          <input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} placeholder="Headline — e.g. Full-stack developer, ex-Amazon" className="input" />
          <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Bio / what you're building" rows={3} className="input" />
          <input value={form.portfolio_url} onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })} placeholder="Portfolio URL" className="input" />
          <input value={form.skills_have} onChange={(e) => setForm({ ...form, skills_have: e.target.value })} placeholder="Skills, comma separated" className="input" />
          <button onClick={save} disabled={saving} className="w-full px-5 py-3 rounded-2xl bg-royal disabled:opacity-50 text-white text-sm font-medium shadow-soft">
            {saving ? "Saving…" : "Save changes"}
          </button>
          <style jsx global>{`
            .input { width: 100%; padding: 13px 16px; border-radius: 14px; border: 1px solid #e2e8f0; outline: none; font-size: 14px; }
            .input:focus { border-color: #2563EB; }
            body.dark .input { background: #111827; border-color: #1e293b; color: white; }
          `}</style>
        </div>
      ) : (
        <>
          {profile.bio && <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{profile.bio}</p>}

          {profile.skills_have?.length > 0 && (
            <TagBlock label="Skills" items={profile.skills_have} />
          )}
          {profile.skills_needed?.length > 0 && (
            <TagBlock label="Looking for" items={profile.skills_needed} />
          )}
          {profile.industries?.length > 0 && (
            <TagBlock label="Industries" items={profile.industries} />
          )}
          {profile.languages?.length > 0 && (
            <TagBlock label="Languages" items={profile.languages} />
          )}

          {profile.portfolio_url && (
            <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-royal text-sm font-medium">
              View portfolio →
            </a>
          )}
        </>
      )}

      {projects.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-navy dark:text-white mb-3">Your projects</p>
          <div className="grid grid-cols-1 gap-3">
            {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        </div>
      )}

      <button onClick={signOut} className="text-xs text-slate-400 underline">
        Sign out
      </button>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card p-3 text-center">
      <p className="text-lg font-semibold text-navy dark:text-white">{value}</p>
      <p className="text-[10px] text-slate-400">{label}</p>
    </div>
  );
}

function TagBlock({ label, items }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((i) => (
          <span key={i} className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {i}
          </span>
        ))}
      </div>
    </div>
  );
}
