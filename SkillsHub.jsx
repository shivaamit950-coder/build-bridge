"use client";
import { useState, useMemo } from "react";
import SkillProfileCard from "@/SkillProfileCard";
import OfferSkillsForm from "@/OfferSkillsForm";
import { EXPERIENCE_LEVELS, LANGUAGES, PRICE_RANGES, AVAILABILITY } from "@/constants";
import { useLocation, haversineKm, DISTANCE_OPTIONS } from "@/useLocation";

export default function SkillsHub({ myProfile, experts, learners, currentUserId }) {
  const [tab, setTab] = useState("find"); // find | offer
  const [query, setQuery] = useState("");
  const [locationText, setLocationText] = useState("");
  const [onlineFilter, setOnlineFilter] = useState("All");
  const [experience, setExperience] = useState("All");
  const [language, setLanguage] = useState("All");
  const [minRating, setMinRating] = useState(0);
  const [price, setPrice] = useState("All");
  const [availability, setAvailability] = useState("All");
  const [radiusKm, setRadiusKm] = useState(25);
  const { coords: userCoords, status: locStatus, error: locError, refresh: refreshLocation } = useLocation();

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const loc = locationText.toLowerCase();
    return experts.filter((p) => {
      const matchesQuery =
        !q || p.skills_have?.some((s) => s.toLowerCase().includes(q)) || p.name?.toLowerCase().includes(q);
      const matchesLocation = !loc || (p.service_location || p.location || "").toLowerCase().includes(loc);
      const matchesOnline = onlineFilter === "All" || (onlineFilter === "Online" ? p.is_online : !p.is_online);
      const matchesExp = experience === "All" || p.experience_level === experience;
      const matchesLang = language === "All" || p.languages?.includes(language);
      const matchesRating = (p.rating || 0) >= minRating;
      const matchesAvailability = availability === "All" || p.availability === availability;
      return matchesQuery && matchesLocation && matchesOnline && matchesExp && matchesLang && matchesRating && matchesAvailability;
    });
  }, [experts, query, locationText, onlineFilter, experience, language, minRating, availability]);

  const nearby = useMemo(() => {
    if (!userCoords) return [];
    return experts
      .filter((p) => p.latitude && p.longitude)
      .map((p) => ({ ...p, distanceKm: haversineKm(userCoords.lat, userCoords.lon, p.latitude, p.longitude) }))
      .filter((p) => p.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 12);
  }, [experts, userCoords, radiusKm]);

  const topRated = [...experts].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8);
  const recentlyJoined = [...experts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 8);
  const trendingExperts = [...experts].sort((a, b) => (b.completed_sessions || 0) - (a.completed_sessions || 0)).slice(0, 8);
  const recommended = experts.slice(0, 8); // simple heuristic; could route through AI Match logic later

  return (
    <div>
      <div className="px-5 pt-6 mb-1">
        <h1 className="text-xl font-semibold text-navy dark:text-white">Talent Hub</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Hire an expert, or teach what you know.</p>
      </div>

      <div className="px-5 flex gap-2 my-4">
        <TabButton active={tab === "find"} onClick={() => setTab("find")}>Find Experts</TabButton>
        <TabButton active={tab === "offer"} onClick={() => setTab("offer")}>Offer Your Skills</TabButton>
      </div>

      {tab === "find" ? (
        <>
          <div className="px-5 space-y-3 mb-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by skill…"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] outline-none focus:border-royal text-sm text-navy dark:text-white"
            />
            <div className="flex gap-2 overflow-x-auto pb-1">
              <input
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                placeholder={userCoords ? "Location (auto-detected — edit if needed)" : "Location"}
                className="shrink-0 w-40 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-xs outline-none focus:border-royal"
              />
              <Select value={onlineFilter} onChange={setOnlineFilter} options={["All", "Online", "Offline"]} />
              <Select value={experience} onChange={setExperience} options={["All", ...EXPERIENCE_LEVELS]} />
              <Select value={language} onChange={setLanguage} options={["All", ...LANGUAGES]} />
              <Select value={price} onChange={setPrice} options={["All", ...PRICE_RANGES]} />
              <Select value={availability} onChange={setAvailability} options={["All", ...AVAILABILITY]} />
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="shrink-0 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-xs outline-none focus:border-royal"
              >
                <option value={0}>Any rating</option>
                <option value={3}>3★ and up</option>
                <option value={4}>4★ and up</option>
                <option value={4.5}>4.5★ and up</option>
              </select>
            </div>
            {locError && <p className="text-[10px] text-slate-400">{locError}</p>}
          </div>

          <div className="px-5 flex items-center gap-2 mb-4">
            <span className="text-[11px] text-slate-400">Nearby within</span>
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-xs outline-none focus:border-royal text-navy dark:text-white"
            >
              {DISTANCE_OPTIONS.map((km) => (
                <option key={km} value={km}>{km} km</option>
              ))}
            </select>
            <button
              onClick={refreshLocation}
              disabled={locStatus === "requesting"}
              className="text-[11px] text-royal font-medium disabled:opacity-50"
            >
              {locStatus === "requesting" ? "Updating…" : "Update my location"}
            </button>
          </div>

          {query || locationText ? (
            <div className="px-5 grid grid-cols-2 gap-3 mb-6">
              {filtered.length === 0 && <p className="col-span-2 text-xs text-slate-400 py-6 text-center">No experts match these filters yet.</p>}
              {filtered.map((p) => <SkillProfileCard key={p.id} profile={p} />)}
            </div>
          ) : (
            <>
              <Row title="Trending Experts" items={trendingExperts} />
              <Row title="Trending Learners" items={learners} isLearner />
              <Row title="Recently Joined" items={recentlyJoined} />
              <Row title="Top Rated Professionals" items={topRated} />
              <Row
                title="Nearby Experts"
                items={nearby}
                emptyText={userCoords ? "No experts with location data nearby yet." : "Enable location to see nearby experts."}
              />
              <Row title="Recommended For You" items={recommended} />
            </>
          )}
        </>
      ) : (
        <OfferSkillsForm myProfile={myProfile} />
      )}
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

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="shrink-0 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-xs outline-none focus:border-royal text-navy dark:text-white"
    >
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}

function Row({ title, items, emptyText, isLearner }) {
  return (
    <div className="mb-6">
      <div className="px-5 mb-3">
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{title}</h3>
      </div>
      {!items || items.length === 0 ? (
        <p className="px-5 text-xs text-slate-400">{emptyText || "Nobody here yet."}</p>
      ) : (
        <div className="px-5 flex gap-3 overflow-x-auto pb-2">
          {items.map((p) => <SkillProfileCard key={p.id} profile={p} />)}
        </div>
      )}
    </div>
  );
}
