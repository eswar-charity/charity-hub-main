-- Add manual_review to the verification status enum
ALTER TYPE np_verification_status ADD VALUE IF NOT EXISTS 'manual_review';

-- Manual review queue for failed EIN checks, church path, and API errors
create table np_manual_reviews (
  id uuid primary key default gen_random_uuid(),
  nonprofit_id uuid references nonprofits(id) on delete cascade not null,
  review_type text not null
    check (review_type in ('ein_not_found', 'api_error', 'church_path', 'invalid_type', 'other')),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  admin_note text,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id)
);

create index idx_np_manual_reviews_nonprofit on np_manual_reviews(nonprofit_id);
create index idx_np_manual_reviews_status on np_manual_reviews(status);
create index idx_np_manual_reviews_type on np_manual_reviews(review_type);

alter table np_manual_reviews enable row level security;

-- Only service-role can read/write (admin panel uses service key)
-- No RLS policies for anon/user roles — all access goes through service-key endpoints
