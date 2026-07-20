"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";

export default function BookmarkButton({ projectId, initiallyBookmarked }) {
  const [bookmarked, setBookmarked] = useState(initiallyBookmarked);
  const [loading, setLoading] = useState(false);
  const { requireAuth } = useAuth();
  const supabase = createClient();

  async function toggle() {
    if (!requireAuth()) return; // opens the floating sign-in dropdown for guests

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (bookmarked) {
      await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("project_id", projectId);
    } else {
      await supabase.from("bookmarks").insert({ user_id: user.id, project_id: projectId });
    }
    setBookmarked(!bookmarked);
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label="Bookmark"
      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
        bookmarked ? "bg-royal text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
      }`}
    >
      {bookmarked ? "★" : "☆"}
    </button>
  );
}
