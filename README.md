# BuildBridge

A premium, mobile-first app to find the right partner to build a business
with — co-founder, manufacturer, marketer, developer, investor, designer,
salesperson, advisor, or business expert — plus a Talent Hub to hire or
teach skills.

## Stack
- Next.js 14 (App Router)
- Supabase (Postgres, Auth, Storage, Row Level Security, Realtime)
- **Claude and ChatGPT** — switchable per request, toggle in the AI page
- Tailwind CSS — navy `#0F172A`, royal blue `#2563EB`, emerald `#10B981`
- PWA-ready (installable, works as the base for Play Store publishing)

## 1. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. **SQL Editor → New Query** → paste all of `supabase/schema.sql` → Run.
3. **Storage** → create three public buckets: `attachments`, `voice-notes`, `avatars`.
4. **Authentication → Providers** — enable Email (on by default) and, for
   worldwide public users, also enable **Google** (Settings → Auth →
   Google — needs a Google Cloud OAuth client, free, ~10 min setup via
   Supabase's own guide linked on that page).
5. **Authentication → URL Configuration** — add `http://localhost:3000`
   and your production URL to the redirect allow-list.
6. **Project Settings → API** — copy your Project URL and anon public key.

## 2. AI provider keys

- **Claude**: console.anthropic.com → create an API key.
- **ChatGPT**: platform.openai.com → create an API key.
  Both are optional independently — if only one key is set, that provider's
  toggle simply won't work until the other key is added. The AI page lets
  the person switch between them per request.

## 3. Environment variables

Copy `.env.example` to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
ANTHROPIC_API_KEY=sk-ant-your-key-here
OPENAI_API_KEY=sk-your-openai-key-here
```

## 4. Run locally

```bash
npm install
npm run dev
```

## 5. Deploy to the web (Vercel)

1. Push to GitHub, import into vercel.com.
2. Add all four environment variables in Vercel project settings.
3. Deploy. Add your live `https://yourapp.vercel.app` URL to Supabase's
   redirect allow-list afterward.
4. Test the live app end to end before moving to Play Store steps below —
   the web app IS the source for the store listing, so it needs to work
   first.

## 6. Publish to Google Play Store

This app is already a working PWA (manifest + service worker included in
`public/`), which is the foundation both paths below need.

**Path A — fastest, fully no-code (recommended for you):**
Use a wrapper service like Median.co or GoNative (~$40–150/month). Give
them your live Vercel URL, they hand back a Play Store–ready Android
build. No code, no manifest editing, no signing keys to manage yourself.

**Path B — free, one extra technical step:**
Use PWABuilder.com (free, visual interface). Enter your live URL — it
reads the `manifest.json` already in this project and generates an
Android package. You'll want **real app icons** before this step (replace
the placeholder ones in `public/icons/` — they're functional but plain,
generated as a placeholder, not final branding).

**Either path, you'll also need:**
- A **Google Play Developer account** — $25 one-time fee.
- A **Privacy Policy URL** — required before Play Store accepts any listing.
- App screenshots and a short description — Play Console asks for these directly.
- A **Data Safety questionnaire** in Play Console — declares what data you
  collect (chat, location for Nearby Experts/Opportunities, etc.).

## Launch scope — read before going wide

Per the plan: **launch in one city or niche first**, not worldwide on day
one. A directory that's empty everywhere is empty everywhere. Get real
density in one place, then expand.

## What's real vs. what's a placeholder in this build

**Fully real, working end to end:**
Auth, onboarding, profiles, projects, Discover (all filters), Talent Hub
(Find Experts / Offer Your Skills, geolocation), bookmarks, real-time
messaging, file sharing, real voice note recording, notifications, dark
mode, **AI Match and AI Assistant — both genuinely callable via Claude or
ChatGPT**, switchable per request in the AI page.

**Intentionally a placeholder for this pass:**
- Video calls generate a Google Meet link rather than in-app calling.
- App icons in `public/icons/` are a simple placeholder (royal blue, "BB")
  — swap for real branded icons before a public Play Store listing.
- No analytics/drop-off tracking yet — worth adding before wide release so
  you can see where people get stuck, not just guess.

## Project structure

```
app/
  page.js                    → Home (search, Choose Your Journey, community showcase)
  auth/page.js                → Sign in
  onboarding/page.js           → 7-question onboarding flow
  discover/page.js             → Full filter search (people + projects) — reachable via Home card
  projects/...                 → Browse/create/view projects
  ai/page.js                   → Merged AI page — Match + Assistant tabs, Claude/ChatGPT toggle
  messages/...                  → Real-time chat + files + voice + video link
  profile/...                   → Your profile + others'
  skills-hub/page.js            → Talent Hub — Find Experts / Offer Your Skills — via Home card
  notifications/page.js         → Notifications feed
  api/ai-match/route.js         → Compatibility scoring (Claude or ChatGPT)
  api/ai-assistant/route.js     → Idea/plan assistant chat (Claude or ChatGPT)
  api/ai-providers/route.js     → Which AI providers are configured
components/
  ThemeProvider.jsx, TopBar.jsx, BottomNav.jsx → Navigation shell (4 tabs: Home, AI, Messages, Profile)
  ServiceWorkerRegister.jsx     → Registers the PWA service worker
  ChatRoom.jsx, ProfileEditor.jsx, DiscoverFilters.jsx, SkillsHub.jsx, JourneyCards.jsx, CommunityShowcase.jsx
lib/
  supabaseClient.js / supabaseServer.js → Supabase clients
  aiProviders.js                → Claude + ChatGPT abstraction, one function for both
  constants.js                  → Industries, stages, collab types, availability
public/
  manifest.json, sw.js, icons/  → PWA files for Play Store publishing
supabase/
  schema.sql                    → Full database schema, run this first
```
