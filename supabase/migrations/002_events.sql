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
