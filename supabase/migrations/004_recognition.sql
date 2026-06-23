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
