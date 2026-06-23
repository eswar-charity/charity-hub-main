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
