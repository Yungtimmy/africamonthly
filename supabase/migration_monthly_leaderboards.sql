-- Closed-month leaderboard archives.
-- Run this once in the Supabase SQL editor (existing projects).
-- Safe to re-run: tables use IF NOT EXISTS, functions are replaced, and the
-- backfill will not overwrite a month that was already archived at reset.
--
-- What it does
-- 1. Stores every scored finisher for a closed month (name and avatar are copied).
--    The site highlights the top 3 and can still open the full ranking.
-- 2. Backfills earlier UTC months from approved submissions + point grants.
--    The current UTC month is left out. Nobody is invented: a month with no
--    positive total is stored only when an admin later closes it.
--    Re-running adds any missing reconstructed finishers. Reset archives are kept.
-- 3. Adds snapshot_monthly_leaderboard(), which the admin "Reset Month" action
--    calls. That saves everyone with monthly points, then sets those points to 0.
--    A month already closed by reset is left unchanged and points are not wiped.

create table if not exists monthly_leaderboards (
  month_key text primary key,
  label text not null,
  closed_at timestamptz not null default now(),
  source text not null check (source in ('reset', 'reconstructed')),
  constraint monthly_leaderboards_month_key_fmt check (month_key ~ '^\d{4}-(0[1-9]|1[0-2])$')
);

create table if not exists monthly_leaderboard_entries (
  month_key text not null references monthly_leaderboards(month_key) on delete cascade,
  rank smallint not null check (rank >= 1),
  user_id uuid references users(id) on delete set null,
  display_name text not null,
  avatar_url text,
  points integer not null check (points > 0),
  primary key (month_key, rank)
);

-- Widen an older top-3-only check if this migration is re-run.
alter table monthly_leaderboard_entries drop constraint if exists monthly_leaderboard_entries_rank_check;
alter table monthly_leaderboard_entries add constraint monthly_leaderboard_entries_rank_check check (rank >= 1);

create index if not exists monthly_leaderboard_entries_user_idx
  on monthly_leaderboard_entries(user_id);

create index if not exists submissions_reviewed_at_idx on submissions (reviewed_at);
create index if not exists point_grants_created_at_idx on point_grants (created_at);
create index if not exists point_grants_user_id_idx on point_grants (user_id);

alter table monthly_leaderboards enable row level security;
alter table monthly_leaderboard_entries enable row level security;

-- Archive the standings currently stored on users.monthly_points.
-- p_month_key is chosen by the admin (current or previous UTC month).
create or replace function snapshot_monthly_leaderboard(p_month_key text, p_label text)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  existing_source text;
  finisher_count integer := 0;
begin
  if p_month_key !~ '^\d{4}-(0[1-9]|1[0-2])$' then
    raise exception 'invalid month key';
  end if;

  perform pg_advisory_xact_lock(hashtext('snapshot_monthly_leaderboard')::bigint);

  select source into existing_source
  from monthly_leaderboards
  where month_key = p_month_key
  for update;

  if existing_source = 'reset' then
    return jsonb_build_object(
      'archived', false,
      'reason', 'already_closed',
      'month_key', p_month_key,
      'finishers', 0
    );
  end if;

  if existing_source = 'reconstructed' then
    delete from monthly_leaderboards where month_key = p_month_key;
  end if;

  insert into monthly_leaderboards (month_key, label, source)
  values (p_month_key, coalesce(nullif(btrim(p_label), ''), p_month_key), 'reset');

  insert into monthly_leaderboard_entries (month_key, rank, user_id, display_name, avatar_url, points)
  select
    p_month_key,
    ranked.rank::smallint,
    ranked.id,
    ranked.discord_username,
    ranked.discord_avatar,
    ranked.monthly_points
  from (
    select
      id,
      discord_username,
      discord_avatar,
      monthly_points,
      row_number() over (order by monthly_points desc, total_points desc, id) as rank
    from users
    where monthly_points > 0
  ) ranked;

  get diagnostics finisher_count = row_count;

  update users
  set monthly_points = 0
  where monthly_points <> 0;

  return jsonb_build_object(
    'archived', true,
    'reason', 'closed',
    'month_key', p_month_key,
    'finishers', finisher_count
  );
end;
$$;

-- One-time (re-runnable) history from point events. Skips months already archived.
create or replace function backfill_monthly_leaderboards()
returns integer
language plpgsql
set search_path = public
as $$
declare
  inserted_entries integer := 0;
begin
  with events as (
    select
      user_id,
      points_awarded as points,
      (coalesce(reviewed_at, created_at) at time zone 'utc') as occurred_at
    from submissions
    where status = 'approved'
      and points_awarded is not null
      and points_awarded <> 0
      and coalesce(reviewed_at, created_at) is not null
    union all
    select
      user_id,
      points,
      (created_at at time zone 'utc')
    from point_grants
    where points <> 0
  ),
  totals as (
    select
      user_id,
      to_char(date_trunc('month', occurred_at), 'YYYY-MM') as month_key,
      sum(points)::integer as points
    from events
    where date_trunc('month', occurred_at) < date_trunc('month', (now() at time zone 'utc'))
    group by user_id, date_trunc('month', occurred_at)
    having sum(points) > 0
  ),
  ranked as (
    select
      t.month_key,
      t.user_id,
      t.points,
      u.discord_username,
      u.discord_avatar,
      row_number() over (
        partition by t.month_key
        order by t.points desc, u.discord_username asc, u.id asc
      ) as rank
    from totals t
    join users u on u.id = t.user_id
  ),
  inserted_months as (
    insert into monthly_leaderboards (month_key, label, source)
    select distinct
      month_key,
      (array['January','February','March','April','May','June','July','August','September','October','November','December'])[
        extract(month from to_date(month_key || '-01', 'YYYY-MM-DD'))::int
      ] || ' ' || split_part(month_key, '-', 1),
      'reconstructed'
    from ranked r
    where not exists (
      select 1 from monthly_leaderboards m where m.month_key = r.month_key
    )
    returning month_key
  )
  insert into monthly_leaderboard_entries (month_key, rank, user_id, display_name, avatar_url, points)
  select t.month_key, t.rank::smallint, t.user_id, t.discord_username, t.discord_avatar, t.points
  from ranked t
  where (
    exists (
      select 1 from monthly_leaderboards m
      where m.month_key = t.month_key and m.source = 'reconstructed'
    )
    or exists (
      select 1 from inserted_months im where im.month_key = t.month_key
    )
  )
  and not exists (
    select 1 from monthly_leaderboard_entries e
    where e.month_key = t.month_key
      and (e.rank = t.rank or e.user_id = t.user_id)
  );

  get diagnostics inserted_entries = row_count;
  return inserted_entries;
end;
$$;

revoke all on function snapshot_monthly_leaderboard(text, text) from public;
revoke all on function backfill_monthly_leaderboards() from public;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on function snapshot_monthly_leaderboard(text, text) from anon;
    revoke all on function backfill_monthly_leaderboards() from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on function snapshot_monthly_leaderboard(text, text) from authenticated;
    revoke all on function backfill_monthly_leaderboards() from authenticated;
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function snapshot_monthly_leaderboard(text, text) to service_role;
    grant execute on function backfill_monthly_leaderboards() to service_role;
    grant select, insert, update, delete on monthly_leaderboards to service_role;
    grant select, insert, update, delete on monthly_leaderboard_entries to service_role;
  end if;
end $$;

select backfill_monthly_leaderboards();
