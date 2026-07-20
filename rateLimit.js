import { createServerSupabase } from "@/lib/supabaseServer";

/**
 * Simple per-user, per-hour rate limit backed by Supabase.
 * Protects the AI endpoints (the only ones with real per-call cost) from
 * runaway bills if a user — or a bot — hammers the API.
 *
 * Returns { allowed: true } or { allowed: false, retryAfterMinutes }.
 */
export async function checkRateLimit(userId, action, limitPerHour = 20) {
  const supabase = createServerSupabase();
  const windowStart = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count, error } = await supabase
    .from("rate_limits")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("action", action)
    .gte("created_at", windowStart);

  // Fail open on a DB error — don't block real users because of an infra hiccup,
  // but this is logged so it's visible in Supabase logs.
  if (error) {
    console.error("Rate limit check failed:", error.message);
    return { allowed: true };
  }

  if (count >= limitPerHour) {
    return { allowed: false, retryAfterMinutes: 60 };
  }

  await supabase.from("rate_limits").insert({ user_id: userId, action });
  return { allowed: true };
}
