"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function NewProjectButton() {
  const { requireAuth } = useAuth();
  const router = useRouter();

  function handleClick() {
    if (requireAuth()) {
      router.push("/projects/new");
    }
    // If not signed in, requireAuth() already opened the floating sign-in dropdown.
  }

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 rounded-xl bg-royal text-white text-xs font-medium shadow-soft"
    >
      + New project
    </button>
  );
}
