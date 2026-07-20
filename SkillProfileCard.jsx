"use client";
import Link from "next/link";

export default function SkillProfileCard({ profile, wide = false }) {
  return (
    <Link
      href={`/profile/${profile.id}`}
      className={`card p-4 flex flex-col gap-2.5 shrink-0 backdrop-blur-xl bg-white/70 dark:bg-[#111827]/70 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ${
        wide ? "min-w-[240px]" : "min-w-[190px]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <div className="w-11 h-11 rounded-full bg-royal-50 dark:bg-royal/10 flex items-center justify-center text-royal font-semibold overflow-hidden">
            {profile.photo_url ? (
              <img src={profile.photo_url} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              profile.name?.[0]?.toUpperCase() || "?"
            )}
          </div>
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#111827] ${
              profile.is_online ? "bg-emerald" : "bg-slate-300"
            }`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-navy dark:text-white truncate">{profile.name}</p>
          <p className="text-[11px] text-slate-400 truncate">{profile.headline || profile.bio}</p>
        </div>
      </div>

      {profile.skills_have?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {profile.skills_have.slice(0, 2).map((s) => (
            <span key={s} className="text-[9px] px-2 py-0.5 rounded-full bg-royal-50 dark:bg-royal/10 text-royal font-medium">
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 text-[10px] text-slate-400 flex-wrap">
        {profile.rating > 0 && <span>★ {profile.rating.toFixed(1)}</span>}
        {profile.completed_sessions > 0 && <span>· {profile.completed_sessions} sessions</span>}
        {profile.response_time_mins && <span>· ~{profile.response_time_mins}m reply</span>}
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400">
        <span className="truncate">{profile.service_location || profile.location || "Remote"}</span>
        <span className={profile.is_online ? "text-emerald font-medium" : "text-slate-400"}>
          {profile.is_online ? "Online" : "Offline"}
        </span>
      </div>

      <span className="text-center w-full py-2 rounded-xl bg-royal text-white text-[11px] font-medium mt-1">
        View profile
      </span>
    </Link>
  );
}
