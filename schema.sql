-- Run in Supabase SQL Editor, top to bottom.

-- =========== PROFILES ===========
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  headline text,                      -- e.g. "Full-stack developer, ex-Amazon"
  avatar_url text,
  location text,
  countries_interested text[],        -- countries willing to collaborate in
  languages text[],
  skills_have text[],                 -- skills they bring
  skills_needed text[],               -- skills they're looking for
  industries text[],
  collaboration_type text[],          -- equity | salary | revenue_share | freelance | advisor | mentor
  availability text,                  -- e.g. "10 hrs/week", "Full-time"
  experience_years int,
  verified boolean default false,
  reputation_score numeric default 0,
  bio text,
  portfolio_url text,
  onboarded boolean default false,
  is_hidden boolean default false,    -- lets a user hide their own profile from Discover without deleting it
  created_at timestamptz default now(),
  last_active timestamptz default now()
);
alter table profiles enable row level security;
create policy "Profiles viewable by everyone" on profiles for select using (is_hidden = false or is_hidden is null);
create policy "Users manage their own profile" on profiles for insert with check ((select auth.uid()) = id);
create policy "Users update their own profile" on profiles for update using ((select auth.uid()) = id);

-- =========== PROJECTS ===========
create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  problem text,                       -- problem being solved
  stage text,                         -- Idea | Building | Launched | Scaling
  required_skills text[],
  location text,
  investment_needed text,
  timeline text,
  equity_offered text,
  commitment text,                    -- expected time commitment
  industry text,
  created_at timestamptz default now()
);
alter table projects enable row level security;
create policy "Projects viewable by everyone" on projects for select using (true);
create policy "Owners manage their projects" on projects for insert with check ((select auth.uid()) = owner_id);
create policy "Owners update their projects" on projects for update using ((select auth.uid()) = owner_id);
create policy "Owners delete their projects" on projects for delete using ((select auth.uid()) = owner_id);

-- =========== BOOKMARKS / SAVED PROJECTS ===========
create table if not exists bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  project_id uuid references projects(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, project_id)
);
alter table bookmarks enable row level security;
create policy "Users manage their own bookmarks" on bookmarks for all using ((select auth.uid()) = user_id);

-- =========== AI MATCH CACHE (avoid recomputing on every page load) ===========
create table if not exists match_scores (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  matched_profile_id uuid references profiles(id) on delete cascade not null,
  score numeric not null,             -- 0-100 compatibility score
  reasoning text,                     -- short AI-generated explanation
  created_at timestamptz default now(),
  unique(user_id, matched_profile_id)
);
alter table match_scores enable row level security;
create policy "Users view their own match scores" on match_scores for select using ((select auth.uid()) = user_id);
create policy "Users can insert their own match scores" on match_scores for insert with check ((select auth.uid()) = user_id);

-- =========== MESSAGES (text + file + voice note) ===========
create table if not exists conversations (
  id uuid default gen_random_uuid() primary key,
  user_a uuid references profiles(id) on delete cascade not null,
  user_b uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_a, user_b)
);
alter table conversations enable row level security;
create policy "Users see their own conversations" on conversations for select using ((select auth.uid()) = user_a or (select auth.uid()) = user_b);
create policy "Users can start conversations" on conversations for insert with check ((select auth.uid()) = user_a or (select auth.uid()) = user_b);

create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  body text,
  attachment_url text,
  attachment_type text,               -- 'file' | 'voice' | null
  created_at timestamptz default now()
);
alter table messages enable row level security;
create policy "Users read messages in their conversations" on messages for select
  using (exists (select 1 from conversations c where c.id = conversation_id and ((select auth.uid()) = c.user_a or (select auth.uid()) = c.user_b)));
create policy "Users send messages in their conversations" on messages for insert
  with check ((select auth.uid()) = sender_id and exists (select 1 from conversations c where c.id = conversation_id and ((select auth.uid()) = c.user_a or (select auth.uid()) = c.user_b)));

-- =========== NOTIFICATIONS ===========
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null,                 -- 'message' | 'match' | 'connection_request' | 'system'
  body text not null,
  link text,
  read boolean default false,
  created_at timestamptz default now()
);
alter table notifications enable row level security;
create policy "Users see their own notifications" on notifications for select using ((select auth.uid()) = user_id);
create policy "Users update their own notifications" on notifications for update using ((select auth.uid()) = user_id);
-- Any signed-in user can create a notification FOR another user (e.g. "X messaged you").
-- Without this, the notifications table had no way to ever receive a row.
create policy "Authenticated users can create notifications" on notifications for insert with check ((select auth.role()) = 'authenticated');

-- =========== STORAGE (voice notes + files + avatars) ===========
-- Create these 3 buckets once in Supabase Dashboard → Storage (mark all "Public"):
--   voice-notes, attachments, avatars
--
-- Public bucket = anyone with the exact file URL can READ it (fine — you already
-- share these URLs inside conversations/profiles). But WRITE access is separate
-- and was previously missing entirely, which silently blocked every upload.
--
-- The app uploads voice notes/attachments to a path like "{conversationId}/filename",
-- so the write policy checks the uploader is actually part of that conversation —
-- not just any signed-in user, and not a folder-per-user scheme (which wouldn't
-- match how the app actually names files).
create policy "Users upload attachments only into their own conversations"
  on storage.objects for insert
  with check (
    bucket_id in ('attachments', 'voice-notes')
    and exists (
      select 1 from conversations c
      where c.id::text = (storage.foldername(name))[1]
      and ((select auth.uid()) = c.user_a or (select auth.uid()) = c.user_b)
    )
  );

-- Avatars use a per-user folder ("{user_id}/filename"), so this one *is* a direct match.
create policy "Users upload to their own avatars folder"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users update their own uploaded files"
  on storage.objects for update
  using (owner = (select auth.uid()));

create policy "Users delete their own uploaded files"
  on storage.objects for delete
  using (owner = (select auth.uid()));

-- Auto-hide stale/inactive profiles from Discover after 120 days (optional, schedule via pg_cron)
create or replace function mark_inactive_last_active()
returns void as $$
begin
  update profiles set reputation_score = greatest(reputation_score - 1, 0)
  where last_active < now() - interval '120 days';
end;
$$ language plpgsql;

-- Skills Hub additions (Find Experts / Offer Your Skills)
alter table profiles add column if not exists is_offering_skills boolean default false;
alter table profiles add column if not exists skill_certifications text[];
alter table profiles add column if not exists skill_portfolio_url text;
alter table profiles add column if not exists skill_pricing text;
alter table profiles add column if not exists teaching_method text; -- 'Online' | 'In-person' | 'Both'
alter table profiles add column if not exists service_location text;
alter table profiles add column if not exists is_online boolean default true;
alter table profiles add column if not exists rating numeric default 0;
alter table profiles add column if not exists completed_sessions int default 0;
alter table profiles add column if not exists response_time_mins int;
alter table profiles add column if not exists experience_level text;
alter table profiles add column if not exists languages text[];
alter table profiles add column if not exists latitude double precision;
alter table profiles add column if not exists longitude double precision;
alter table profiles add column if not exists location_updated_at timestamptz;
alter table profiles add column if not exists photo_url text;
alter table profiles add column if not exists kyc_verified boolean default false;

-- Community stats (used by homepage showcase — update via triggers or a scheduled job as real data grows)
create table if not exists community_stats (
  id int primary key default 1,
  businesses_started int default 0,
  successful_collaborations int default 0,
  skills_shared int default 0,
  active_members int default 0,
  updated_at timestamp with time zone default now()
);
insert into community_stats (id) values (1) on conflict (id) do nothing;
alter table community_stats enable row level security;
create policy "Stats are viewable by everyone" on community_stats for select using (true);

-- Rate limiting for AI endpoints — protects against cost runaway at scale.
-- Each call to AI Match / AI Assistant logs one row here; the API checks
-- how many rows exist for that user in the last hour before allowing another call.
create table if not exists rate_limits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  action text not null,
  created_at timestamp with time zone default now()
);
create index if not exists rate_limits_user_action_time on rate_limits (user_id, action, created_at);
alter table rate_limits enable row level security;
create policy "Users can only see their own rate limit records" on rate_limits for select using ((select auth.uid()) = user_id);
create policy "Users can insert their own rate limit records" on rate_limits for insert with check ((select auth.uid()) = user_id);

-- Old rate limit rows can be purged periodically to keep the table small.
-- Schedule with pg_cron alongside hide_inactive_profiles, e.g.:
-- select cron.schedule('purge-rate-limits', '0 4 * * *', $$delete from rate_limits where created_at < now() - interval '2 days'$$);

-- ============================================================
-- MIGRATION — run this block only if you already ran schema.sql
-- before (i.e. your app was live before guest browsing was added).
-- This updates the read policies so people can browse without an
-- account. Safe to run even if you're not sure — it just replaces
-- the two policies below.
-- ============================================================
drop policy if exists "Profiles viewable by authenticated users" on profiles;
drop policy if exists "Profiles viewable by everyone" on profiles;
create policy "Profiles viewable by everyone" on profiles for select using (is_hidden = false or is_hidden is null);

drop policy if exists "Projects viewable by authenticated users" on projects;
drop policy if exists "Projects viewable by everyone" on projects;
create policy "Projects viewable by everyone" on projects for select using (true);

-- Fixes a real bug: is_hidden was referenced by the policy above but never
-- existed as a column, which would make the policy silently misbehave or
-- fail depending on when it was created. Safe to run even if it already exists.
alter table profiles add column if not exists is_hidden boolean default false;

-- Storage upload policies — if your file/voice uploads have been failing silently,
-- this was almost certainly why (no INSERT policy existed on storage.objects at all).
drop policy if exists "Users upload attachments only into their own conversations" on storage.objects;
create policy "Users upload attachments only into their own conversations"
  on storage.objects for insert
  with check (
    bucket_id in ('attachments', 'voice-notes')
    and exists (
      select 1 from conversations c
      where c.id::text = (storage.foldername(name))[1]
      and ((select auth.uid()) = c.user_a or (select auth.uid()) = c.user_b)
    )
  );
drop policy if exists "Users upload to their own avatars folder" on storage.objects;
create policy "Users upload to their own avatars folder"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Users update their own uploaded files" on storage.objects;
create policy "Users update their own uploaded files" on storage.objects for update using (owner = (select auth.uid()));
drop policy if exists "Users delete their own uploaded files" on storage.objects;
create policy "Users delete their own uploaded files" on storage.objects for delete using (owner = (select auth.uid()));
