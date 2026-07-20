"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
import { TEACHING_METHODS, LANGUAGES, EXPERIENCE_LEVELS } from "@/lib/constants";

export default function OfferSkillsForm({ myProfile }) {
  const [form, setForm] = useState({
    skills_have: (myProfile?.skills_have || []).join(", "),
    skill_certifications: (myProfile?.skill_certifications || []).join(", "),
    skill_portfolio_url: myProfile?.skill_portfolio_url || "",
    skill_pricing: myProfile?.skill_pricing || "",
    teaching_method: myProfile?.teaching_method || TEACHING_METHODS[0],
    service_location: myProfile?.service_location || "",
    experience_level: myProfile?.experience_level || EXPERIENCE_LEVELS[0],
    availability: myProfile?.availability || "",
    languages: (myProfile?.languages || []).join(", "),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const { requireAuth } = useAuth();

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!requireAuth()) return; // opens the floating sign-in dropdown for guests, stops here
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();

    await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        is_offering_skills: true,
        skills_have: form.skills_have.split(",").map((s) => s.trim()).filter(Boolean),
        skill_certifications: form.skill_certifications.split(",").map((s) => s.trim()).filter(Boolean),
        skill_portfolio_url: form.skill_portfolio_url,
        skill_pricing: form.skill_pricing,
        teaching_method: form.teaching_method,
        service_location: form.service_location,
        experience_level: form.experience_level,
        availability: form.availability,
        languages: form.languages.split(",").map((s) => s.trim()).filter(Boolean),
      });

    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="px-5 space-y-4 pb-6">
      {myProfile?.is_offering_skills && (
        <div className="card p-3 bg-emerald-50 dark:bg-emerald/10 border-emerald/30">
          <p className="text-xs text-emerald font-medium">✓ Your expert profile is live in Talent Hub</p>
        </div>
      )}

      <Field label="Skills you can teach or offer" hint="comma separated">
        <input value={form.skills_have} onChange={(e) => update("skills_have", e.target.value)}
          placeholder="e.g. Excel modeling, Fabric sourcing, React" className="input" />
      </Field>

      <Field label="Certifications" hint="optional, comma separated">
        <input value={form.skill_certifications} onChange={(e) => update("skill_certifications", e.target.value)}
          placeholder="e.g. Google Analytics certified" className="input" />
      </Field>

      <Field label="Portfolio URL" hint="optional">
        <input value={form.skill_portfolio_url} onChange={(e) => update("skill_portfolio_url", e.target.value)}
          placeholder="https://…" className="input" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Pricing">
          <input value={form.skill_pricing} onChange={(e) => update("skill_pricing", e.target.value)}
            placeholder="e.g. ₹500/hr" className="input" />
        </Field>
        <Field label="Experience level">
          <select value={form.experience_level} onChange={(e) => update("experience_level", e.target.value)} className="input">
            {EXPERIENCE_LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Preferred teaching method">
        <select value={form.teaching_method} onChange={(e) => update("teaching_method", e.target.value)} className="input">
          {TEACHING_METHODS.map((m) => <option key={m}>{m}</option>)}
        </select>
      </Field>

      {(form.teaching_method === "In-person" || form.teaching_method === "Both") && (
        <Field label="Service location" hint="only shown to verified, mutually interested users">
          <input value={form.service_location} onChange={(e) => update("service_location", e.target.value)}
            placeholder="City / area" className="input" />
        </Field>
      )}

      <Field label="Availability">
        <input value={form.availability} onChange={(e) => update("availability", e.target.value)}
          placeholder="e.g. Weekday evenings" className="input" />
      </Field>

      <Field label="Languages" hint="comma separated">
        <input value={form.languages} onChange={(e) => update("languages", e.target.value)}
          placeholder="e.g. English, Hindi" className="input" />
      </Field>

      <button type="submit" disabled={saving}
        className="w-full px-5 py-3.5 rounded-2xl bg-emerald disabled:opacity-50 text-white text-sm font-medium shadow-soft">
        {saving ? "Saving…" : myProfile?.is_offering_skills ? "Update expert profile" : "Publish expert profile"}
      </button>
      {saved && <p className="text-xs text-emerald text-center">Saved — visible in Talent Hub now.</p>}

      <style jsx global>{`
        .input { width: 100%; padding: 13px 16px; border-radius: 14px; border: 1px solid #e2e8f0; outline: none; font-size: 14px; background: white; }
        .input:focus { border-color: #2563EB; }
        body.dark .input { background: #111827; border-color: #1e293b; color: white; }
      `}</style>
    </form>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {label} {hint && <span className="text-slate-300">— {hint}</span>}
      </label>
      {children}
    </div>
  );
}
