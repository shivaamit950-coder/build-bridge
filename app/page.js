import { redirect } from "next/navigation";
import { createServerSupabase } from "@/supabaseServer";
import TopBar from "@/TopBar";
import HomeSearch from "@/HomeSearch";
import JourneyCards from "@/JourneyCards";
import CommunityShowcase from "@/CommunityShowcase";

export default async function HomePage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    profile = data;
    if (profile && !profile.onboarded) redirect("/onboarding");
  }

  const { data: stats } = await supabase.from("community_stats").select("*").eq("id", 1).single();

  const buildersQuery = supabase
    .from("profiles")
    .select("*")
    .eq("onboarded", true)
    .order("reputation_score", { ascending: false })
    .limit(6);
  if (user) buildersQuery.neq("id", user.id);
  const { data: builders } = await buildersQuery;

  const expertsQuery = supabase
    .from("profiles")
    .select("*")
    .eq("is_offering_skills", true)
    .order("rating", { ascending: false })
    .limit(6);
  if (user) expertsQuery.neq("id", user.id);
  const { data: experts } = await expertsQuery;

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <main className="max-w-lg mx-auto">
      <TopBar />

      <div className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-semibold text-navy dark:text-white mb-1">
          {profile?.name ? `Hey, ${profile.name} 👋` : "Hey there 👋"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">
          Find the right partner to build with.
        </p>
        <HomeSearch />
      </div>

      <JourneyCards />
      <CommunityShowcase stats={stats} builders={builders} experts={experts} projects={projects} />

      <div className="h-6" />
    </main>
  );
}
