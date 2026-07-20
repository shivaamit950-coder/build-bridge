import Link from "next/link";

export default function JourneyCards() {
  return (
    <section className="px-5 mb-8">
      <h2 className="text-sm font-semibold text-navy dark:text-white mb-3">Choose Your Journey</h2>
      <div className="grid grid-cols-1 gap-4">
        <JourneyCard
          href="/discover"
          eyebrow="Partner up"
          title="Build Together"
          description="Connect with like-minded people, create partnerships, join exciting projects, and turn ideas into successful businesses."
          cta="Start Building"
          accent="royal"
        />
        <JourneyCard
          href="/skills-hub"
          eyebrow="Learn & earn"
          title="Talent Hub"
          description="Discover talented people, hire experts, learn new skills, or offer your own expertise through one trusted marketplace."
          cta="Explore Skills"
          accent="emerald"
        />
      </div>
    </section>
  );
}

function JourneyCard({ href, eyebrow, title, description, cta, accent }) {
  const accentMap = {
    royal: { bg: "from-royal/10 to-royal/0", text: "text-royal", btn: "bg-royal hover:bg-royal-600" },
    emerald: { bg: "from-emerald/10 to-emerald/0", text: "text-emerald", btn: "bg-emerald hover:bg-emerald-600" },
  };
  const a = accentMap[accent];

  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br ${a.bg} bg-white/60 dark:bg-[#111827]/60 backdrop-blur-xl p-6 shadow-soft hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5`}
    >
      <p className={`text-[11px] font-semibold uppercase tracking-wide ${a.text} mb-2`}>{eyebrow}</p>
      <h3 className="text-xl font-semibold text-navy dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-5">{description}</p>
      <span
        className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-white text-sm font-medium shadow-soft transition-colors ${a.btn}`}
      >
        {cta} <span className="transition-transform group-hover:translate-x-0.5">→</span>
      </span>
    </Link>
  );
}
