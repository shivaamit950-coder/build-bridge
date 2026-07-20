import Link from "next/link";

export default function CommunityShowcase({ stats, builders, experts, projects }) {
  const hasRealActivity = stats && (stats.businesses_started + stats.successful_collaborations + stats.skills_shared + stats.active_members) > 0;

  return (
    <section className="mb-8">
      <div className="px-5 mb-5">
        <h2 className="text-sm font-semibold text-navy dark:text-white mb-1">Built together, by this community</h2>
        {hasRealActivity ? (
          <div className="grid grid-cols-2 gap-3 mt-3">
            <StatCard label="Businesses started" value={stats.businesses_started} accent="royal" />
            <StatCard label="Successful collaborations" value={stats.successful_collaborations} accent="emerald" />
            <StatCard label="Skills shared" value={stats.skills_shared} accent="royal" />
            <StatCard label="Active members" value={stats.active_members} accent="emerald" />
          </div>
        ) : (
          <p className="text-xs text-slate-400 mt-1">
            Just getting started — you could be one of the first people building here.
          </p>
        )}
      </div>

      <ShowcaseRow title="Featured Builders" items={builders} type="profile" emptyText="No featured builders yet." />
      <ShowcaseRow title="Featured Experts" items={experts} type="profile" emptyText="No featured experts yet." />
      <ShowcaseRow title="Fastest Growing Projects" items={projects} type="project" emptyText="No projects yet — post the first one." />
    </section>
  );
}

function StatCard({ label, value, accent }) {
  const accentText = accent === "royal" ? "text-royal" : "text-emerald";
  return (
    <div className="card p-4 backdrop-blur-xl bg-white/70 dark:bg-[#111827]/70">
      <p className={`text-2xl font-semibold ${accentText}`}>{value}</p>
      <p className="text-[11px] text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

function ShowcaseRow({ title, items, type, emptyText }) {
  return (
    <div className="mb-6">
      <div className="px-5 flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{title}</h3>
      </div>
      {!items || items.length === 0 ? (
        <p className="px-5 text-xs text-slate-400">{emptyText}</p>
      ) : (
        <div className="px-5 flex gap-3 overflow-x-auto pb-2">
          {items.map((item) =>
            type === "profile" ? (
              <Link
                key={item.id}
                href={`/profile/${item.id}`}
                className="card min-w-[150px] p-4 flex flex-col items-center text-center gap-2 shrink-0 backdrop-blur-xl bg-white/70 dark:bg-[#111827]/70 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-full bg-royal-50 dark:bg-royal/10 flex items-center justify-center text-royal font-semibold">
                  {item.name?.[0]?.toUpperCase() || "?"}
                </div>
                <span className="text-xs font-medium text-navy dark:text-white truncate w-full">{item.name}</span>
                <span className="text-[10px] text-slate-400 line-clamp-2">{item.headline || item.bio}</span>
              </Link>
            ) : (
              <Link
                key={item.id}
                href={`/projects/${item.id}`}
                className="card min-w-[220px] p-4 flex flex-col gap-2 shrink-0 backdrop-blur-xl bg-white/70 dark:bg-[#111827]/70 hover:shadow-lg transition-shadow"
              >
                <p className="text-xs font-semibold text-navy dark:text-white line-clamp-1">{item.title}</p>
                <p className="text-[11px] text-slate-400 line-clamp-2">{item.description}</p>
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}
