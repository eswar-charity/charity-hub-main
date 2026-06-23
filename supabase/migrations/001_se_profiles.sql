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
