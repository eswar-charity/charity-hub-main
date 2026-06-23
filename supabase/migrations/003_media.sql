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
