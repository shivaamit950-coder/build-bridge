"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { INDUSTRIES, STAGES, COLLAB_TYPES, AVAILABILITY } from "@/constants";
import ProjectCard from "@/ProjectCard";
import { useLocation, haversineKm, DISTANCE_OPTIONS } from "@/useLocation";

export default function DiscoverFilters({ profiles, projects }) {
  const [tab, setTab] = useState("people"); // people | projects
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("All");
  const [country, setCountry] = useState("");
  const [availability, setAvailability] = useState("All");
  const [collabType, setCollabType] = useState("All");
  const [stage, setStage] = useState("All");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [radiusKm, setRadiusKm] = useState(25);
  const { coords: userCoords, status: locStatus, refresh: refreshLocation } = useLocation({ autoRequest: false });

  const filteredPeople = useMemo(() => {
    const q = query.toLowerCase();
    return profiles
      .filter((p) => {
        const matchesQuery =
          !q ||
          p.name?.toLowerCase().includes(q) ||
          p.bio?.toLowerCase().includes(q) ||
          p.skills_have?.some((s) => s.toLowerCase().includes(q));
        const matchesIndustry = industry === "All" || p.industries?.includes(industry);
        const matchesCountry =
          !country || p.countries_interested?.some((c) => c.toLowerCase().includes(country.toLowerCase()));
        const matchesAvailability = availability === "All" || p.availability === availability;
        const matchesCollab = collabType === "All" || p.collaboration_type?.includes(collabType);
        return matchesQuery && matchesIndustry && matchesCountry && matchesAvailability && matchesCollab;
      })
      .map((p) =>
        userCoords && p.latitude && p.longitude
          ? { ...p, distanceKm: haversineKm(userCoords.lat, userCoords.lon, p.latitude, p.longitude) }
          : p
      )
      .filter((p) => !nearbyOnly || (userCoords && p.distanceKm != null && p.distanceKm <= radiusKm))
      .sort((a, b) => (nearbyOnly ? (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity) : 0));
  }, [profiles, query, industry, country, availability, collabType, nearbyOnly, radiusKm, userCoords]);

  const filteredProjects = useMemo(() => {
    const q = query.toLowerCase();
    return projects.filter((p) => {
      const matchesQuery =
        !q || p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
      const matchesIndustry = industry === "All" || p.industry === industry;
      const matchesStage = stage === "All" || p.stage === stage;
      const matchesRemote = !remoteOnly || !p.location || p.location.toLowerCase().includes("remote");
      return matchesQuery && matchesIndustry && matchesStage && matchesRemote;
    });
  }, [projects, query, industry, stage, remoteOnly]);

  return (
    <div>
      <div className="px-5 flex gap-2 mb-4">
        <TabButton active={tab === "people"} onClick={() => setTab("people")}>People</TabButton>
        <TabButton active={tab === "projects"} onClick={() => setTab("projects")}>Projects</TabButton>
      </div>

      <div className="px-5 space-y-3 mb-5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tab === "people" ? "Search by name, skill, or bio…" : "Search projects…"}
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] outline-none focus:border-royal text-sm text-navy dark:text-white"
        />

        <div className="flex gap-2 overflow-x-auto pb-1">
          <Select value={industry} onChange={setIndustry} label="Industry" options={["All", ...INDUSTRIES]} />
          {tab === "people" && (
            <>
              <Select value={availability} onChange={setAvailability} label="Availability" options={["All", ...AVAILABILITY]} />
              <Select
                value={collabType}
                onChange={setCollabType}
                label="Collaboration"
                options={["All", ...COLLAB_TYPES.map((c) => c.value)]}
                displayLabels={{ All: "All", ...Object.fromEntries(COLLAB_TYPES.map((c) => [c.value, c.label])) }}
              />
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Country"
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-xs outline-none focus:border-royal shrink-0 w-28"
              />
              <button
                onClick={() => {
                  const next = !nearbyOnly;
                  setNearbyOnly(next);
                  if (next && !userCoords) refreshLocation();
                }}
                className={`shrink-0 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                  nearbyOnly ? "border-royal bg-royal-50 text-royal dark:bg-royal/10" : "border-slate-200 dark:border-slate-800 text-slate-500"
                }`}
              >
                {locStatus === "requesting" ? "Locating…" : "Nearby"}
              </button>
              {nearbyOnly && (
                <select
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="shrink-0 px-2 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-xs outline-none focus:border-royal"
                >
                  {DISTANCE_OPTIONS.map((km) => (
                    <option key={km} value={km}>{km} km</option>
                  ))}
                </select>
              )}
            </>
          )}
          {tab === "projects" && (
            <>
              <Select value={stage} onChange={setStage} label="Stage" options={["All", ...STAGES]} />
              <button
                onClick={() => setRemoteOnly((r) => !r)}
                className={`shrink-0 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                  remoteOnly ? "border-royal bg-royal-50 text-royal dark:bg-royal/10" : "border-slate-200 dark:border-slate-800 text-slate-500"
                }`}
              >
                Remote only
              </button>
            </>
          )}
        </div>
      </div>

      {tab === "people" ? (
        <div className="px-5 space-y-3">
          {filteredPeople.length === 0 && <EmptyState what="people" />}
          {filteredPeople.map((p) => (
            <Link key={p.id} href={`/profile/${p.id}`} className="card p-4 flex items-center gap-3 fade-in">
              <div className="w-11 h-11 rounded-full bg-royal-50 dark:bg-royal/10 flex items-center justify-center text-royal font-semibold shrink-0">
                {p.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-navy dark:text-white truncate">{p.name}</p>
                <p className="text-xs text-slate-400 truncate">{p.headline || p.bio}</p>
                {p.skills_have?.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-1">
                    {p.skills_have.slice(0, 2).map((s) => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {p.verified && <span className="text-emerald text-xs shrink-0">✓ Verified</span>}
            </Link>
          ))}
        </div>
      ) : (
        <div className="px-5 grid grid-cols-1 gap-3">
          {filteredProjects.length === 0 && <EmptyState what="projects" />}
          {filteredProjects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
        active ? "bg-navy text-white dark:bg-royal" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
      }`}
    >
      {children}
    </button>
  );
}

function Select({ value, onChange, label, options, displayLabels }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className="shrink-0 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-xs outline-none focus:border-royal text-navy dark:text-white"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {displayLabels?.[o] || o}
        </option>
      ))}
    </select>
  );
}

function EmptyState({ what }) {
  return (
    <div className="card p-8 text-center">
      <p className="text-sm text-slate-400">No {what} match these filters yet.</p>
      <p className="text-xs text-slate-400 mt-1">Try widening your search.</p>
    </div>
  );
}
