"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function MessageOwnerButton({ ownerId, ownerName }) {
  const { requireAuth } = useAuth();
  const router = useRouter();

  function handleClick() {
    if (requireAuth()) {
      router.push(`/messages/${ownerId}`);
    }
    // If not signed in, requireAuth() already opened the floating sign-in dropdown.
  }

  return (
    <button
      onClick={handleClick}
      className="block text-center w-full px-5 py-3.5 rounded-2xl bg-royal text-white text-sm font-medium shadow-soft"
    >
      Message {ownerName}
    </button>
  );
}
