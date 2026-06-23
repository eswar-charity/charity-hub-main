alter table nonprofits enable row level security;
alter table np_event_approvals enable row level security;
alter table np_donations enable row level security;
alter table np_activity enable row level security;
alter table np_engagement_daily enable row level security;

create policy "NP own record" on nonprofits for all
  using (auth.uid() = user_id);

create policy "NP manage own approvals" on np_event_approvals for all
  using (nonprofit_id in (select id from nonprofits where user_id = auth.uid()));

create policy "NP read own donations" on np_donations for select
  using (nonprofit_id in (select id from nonprofits where user_id = auth.uid()));

create policy "NP read own activity" on np_activity for select
  using (nonprofit_id in (select id from nonprofits where user_id = auth.uid()));

create policy "NP read own engagement" on np_engagement_daily for select
  using (nonprofit_id in (select id from nonprofits where user_id = auth.uid()));
