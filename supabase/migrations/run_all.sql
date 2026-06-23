-- Run this entire file in the Supabase SQL Editor (one paste, one click Run)
-- Dashboard: https://supabase.com/dashboard/project/fgqvnuvtwgklboojzjmg/editor

-- 001: SE Profiles
create table se_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  handle text unique not null,
  display_name text not null,
  bio text,
  cause_categories text[] default '{}',
  is_minor boolean default false,
  guardian_email text,
  guardian_consent_given boolean default false,
  avatar_public_id text,
  avatar_url text,
  recognition_tier text default 'Spark'
    check (recognition_tier in ('Spark','Flame','Torch','Beacon','Legend')),
  total_events_created integer default 0,
  total_donations_raised numeric(12,2) default 0,
  total_participants integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_se_profiles_user_id on se_profiles(user_id);
create index idx_se_profiles_handle on se_profiles(handle);

-- 002: Events
create type event_status as enum (
  'draft','pending_approval','live','wrap_up','memorial','archived','rejected'
);
create table events (
  id uuid primary key default gen_random_uuid(),
  se_profile_id uuid references se_profiles(id) on delete cascade not null,
  nonprofit_id uuid,
  title text not null,
  description text not null,
  cause_category text not null,
  location text,
  event_date date,
  status event_status default 'draft',
  hero_image_public_id text,
  hero_image_url text,
  promo_video_public_id text,
  promo_video_url text,
  is_private boolean default false,
  requires_peer_review boolean default false,
  total_donations numeric(12,2) default 0,
  total_participants integer default 0,
  rejection_reason text,
  submitted_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_events_se_profile_id on events(se_profile_id);
create index idx_events_status on events(status);

-- 003: Media
create type media_resource_type as enum ('image','video');
create table event_media (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade not null,
  public_id text not null,
  secure_url text not null,
  media_type media_resource_type not null,
  width integer,
  height integer,
  duration numeric,
  format text,
  display_order integer default 0,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz default now()
);
create index idx_event_media_event_id on event_media(event_id);

-- 004: Recognition
create table recognition_events (
  id uuid primary key default gen_random_uuid(),
  se_profile_id uuid references se_profiles(id) on delete cascade not null,
  event_type text not null,
  points_earned integer default 0,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);
create table recognition_tiers (
  tier_name text primary key,
  min_points integer not null,
  badge_color text not null,
  perks text[] default '{}'
);
insert into recognition_tiers values
  ('Spark',  0,     '#F59E0B', ARRAY['Profile badge','Feed visibility']),
  ('Flame',  500,   '#F97316', ARRAY['Flame badge','Priority feed','Peer review access']),
  ('Torch',  2000,  '#EF4444', ARRAY['Torch badge','Analytics dashboard','Featured events']),
  ('Beacon', 5000,  '#8B5CF6', ARRAY['Beacon badge','NP partnership invites','Impact reports']),
  ('Legend', 15000, '#06B6D4', ARRAY['Legend badge','Platform ambassador','Direct NP contact']);
create index idx_recognition_se on recognition_events(se_profile_id);

-- 005: RLS Policies
alter table se_profiles enable row level security;
alter table events enable row level security;
alter table event_media enable row level security;
alter table recognition_events enable row level security;

create policy "SE own profile read" on se_profiles for select using (auth.uid() = user_id);
create policy "SE own profile update" on se_profiles for update using (auth.uid() = user_id);
create policy "SE own profile insert" on se_profiles for insert with check (auth.uid() = user_id);

create policy "SE manage own events" on events for all using (
  se_profile_id in (select id from se_profiles where user_id = auth.uid())
);
create policy "Public read live events" on events for select using (status = 'live');

create policy "Public read live event media" on event_media for select using (
  event_id in (select id from events where status = 'live')
);
create policy "SE manage own media" on event_media for all using (uploaded_by = auth.uid());

create policy "SE read own recognition" on recognition_events for select using (
  se_profile_id in (select id from se_profiles where user_id = auth.uid())
);
