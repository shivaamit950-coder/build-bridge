"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/supabaseClient";

// Only re-prompt/re-save automatically if the stored location is older than this.
// "Update when needed" = don't hit GPS + write to the DB on every single page
// load forever — just when it's actually gone stale, or the user asks explicitly.
const STALE_AFTER_MS = 24 * 60 * 60 * 1000; // 24 hours

export function useLocation({ autoRequest = true } = {}) {
  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | requesting | granted | denied | unsupported
  const [error, setError] = useState("");
  const supabase = createClient();

  const requestAndSave = useCallback(async () => {
    if (!navigator.geolocation) {
      setStatus("unsupported");
      setError("Location isn't available on this device/browser.");
      return;
    }
    setStatus("requesting");
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCoords({ lat, lon });
        setStatus("granted");

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from("profiles")
            .update({ latitude: lat, longitude: lon, location_updated_at: new Date().toISOString() })
            .eq("id", user.id);
        }
      },
      () => {
        setStatus("denied");
        setError("Location unavailable — you can still search by typing a city.");
      },
      { timeout: 8000 }
    );
  }, []);

  // On mount: use the profile's already-saved coords if fresh, otherwise
  // (re)request — this is the "update location when needed" behavior rather
  // than hitting GPS on literally every page view.
  useEffect(() => {
    if (!autoRequest) return;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        requestAndSave(); // guests: just use the coords in-session, nothing to save against
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("latitude, longitude, location_updated_at")
        .eq("id", user.id)
        .single();

      const isStale =
        !profile?.location_updated_at ||
        Date.now() - new Date(profile.location_updated_at).getTime() > STALE_AFTER_MS;

      if (profile?.latitude && profile?.longitude && !isStale) {
        setCoords({ lat: profile.latitude, lon: profile.longitude });
        setStatus("granted");
      } else {
        requestAndSave();
      }
    })();
  }, [autoRequest, requestAndSave]);

  return { coords, status, error, refresh: requestAndSave };
}

export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const DISTANCE_OPTIONS = [5, 10, 25, 50];
