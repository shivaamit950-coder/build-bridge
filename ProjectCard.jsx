"use client";
import Link from "next/link";

export default function ProjectCard({ project }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="card p-4 flex flex-col gap-2 hover:shadow-soft transition-shadow fade-in"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-navy dark:text-white text-sm leading-snug">{project.title}</h3>
        {project.stage && (
          <span className="shrink-0 text-[10px] font-medium px-2 py-1 rounded-full bg-emerald-50 text-emerald dark:bg-emerald/10">
            {project.stage}
          </span>
        )}
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-2">
        {project.description}
      </p>
      {project.required_skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {project.required_skills.slice(0, 3).map((s) => (
            <span
              key={s}
              className="text-[10px] px-2 py-1 rounded-full bg-royal-50 text-royal dark:bg-royal/10 font-medium"
            >
              {s}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
        <span>{project.location || "Remote"}</span>
        {project.investment_needed && <span>{project.investment_needed}</span>}
      </div>
    </Link>
  );
}
