create type np_verification_status as enum (
  'submitted','verifying','verified','settlement_setup','active','rejected'
);

create type np_type as enum ('standard','church','religious_org');

create table nonprofits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  organization_name text not null,
  email text not null,
  ein text unique,
  legal_name text,
  registered_address text,
  official_contact_email text,
  website text,
  np_type np_type default 'standard',
  verification_status np_verification_status default 'submitted',
  ein_check_passed boolean default false,
  ein_check_started_at timestamptz,
  verified_at timestamptz,
  rejection_reason text,
  stripe_account_id text,
  stripe_onboarding_complete boolean default false,
  total_events_active integer default 0,
  total_events_draft integer default 0,
  total_donations_received numeric(12,2) default 0,
  pending_approvals_count integer default 0,
  next_payout_date date,
  next_payout_amount numeric(12,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table np_event_approvals (
  id uuid primary key default gen_random_uuid(),
  nonprofit_id uuid references nonprofits(id) on delete cascade not null,
  event_id uuid references events(id) on delete cascade not null,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references auth.users(id),
  review_note text,
  submitted_at timestamptz default now(),
  reviewed_at timestamptz
);

create table np_donations (
  id uuid primary key default gen_random_uuid(),
  nonprofit_id uuid references nonprofits(id) on delete cascade not null,
  event_id uuid references events(id),
  donor_display_name text default 'Anonymous',
  donor_avatar_initials text,
  donor_avatar_color text,
  amount numeric(10,2) not null,
  stripe_payment_intent_id text,
  donated_at timestamptz default now()
);

create table np_activity (
  id uuid primary key default gen_random_uuid(),
  nonprofit_id uuid references nonprofits(id) on delete cascade not null,
  activity_text text not null,
  activity_type text default 'info',
  flagged boolean default false,
  created_at timestamptz default now()
);

create table np_engagement_daily (
  id uuid primary key default gen_random_uuid(),
  nonprofit_id uuid references nonprofits(id) on delete cascade not null,
  date date not null,
  participant_count integer default 0,
  donation_count integer default 0,
  unique(nonprofit_id, date)
);

create index idx_nonprofits_user_id on nonprofits(user_id);
create index idx_nonprofits_ein on nonprofits(ein);
create index idx_np_approvals_nonprofit on np_event_approvals(nonprofit_id);
create index idx_np_approvals_status on np_event_approvals(status);
create index idx_np_donations_nonprofit on np_donations(nonprofit_id);
create index idx_np_activity_nonprofit on np_activity(nonprofit_id);
create index idx_np_engagement_nonprofit_date on np_engagement_daily(nonprofit_id, date);
