-- Africa Monthly — Supabase Schema
-- Run this in your Supabase project SQL editor

-- Users
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  discord_id text unique not null,
  discord_username text not null,
  discord_avatar text,
  discord_email text,
  wallet_address text,
  total_points integer not null default 0,
  monthly_points integer not null default 0,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tasks
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  points integer not null default 0,
  is_active boolean not null default true,
  created_by uuid references users(id),
  created_at timestamptz not null default now()
);

-- Submissions
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  task_id uuid not null references tasks(id),
  proof_url text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  points_awarded integer,
  awarded_actions text[],
  reviewed_by uuid references users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Point grants (manual admin awards)
create table if not exists point_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  points integer not null,
  reason text not null,
  granted_by uuid not null references users(id),
  created_at timestamptz not null default now()
);

-- Auto-update updated_at on users
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at
  before update on users
  for each row execute function update_updated_at();

-- Atomic point increment (submission approvals + manual grants/deductions).
-- Returns the row count: 1 on success, 0 if the user is missing OR a deduction
-- would push either balance below 0. Floor check is enforced atomically inside
-- the UPDATE; grants (p_delta >= 0) bypass it.
create or replace function increment_user_points(p_user_id uuid, p_delta integer)
returns integer
language plpgsql
as $$
declare
  affected integer;
begin
  update users
    set total_points = total_points + p_delta,
        monthly_points = monthly_points + p_delta
    where id = p_user_id
      and (p_delta >= 0
           or (monthly_points + p_delta >= 0
               and total_points + p_delta >= 0));
  get diagnostics affected = row_count;
  return affected;
end;
$$;

-- Indexes
create index if not exists users_discord_id_idx on users(discord_id);
create index if not exists users_monthly_points_idx on users(monthly_points desc);
create index if not exists submissions_user_id_idx on submissions(user_id);
create index if not exists submissions_task_id_idx on submissions(task_id);
create index if not exists submissions_status_idx on submissions(status);
create index if not exists submissions_reviewed_at_idx on submissions (reviewed_at);
create index if not exists point_grants_created_at_idx on point_grants (created_at);
create index if not exists point_grants_user_id_idx on point_grants (user_id);

-- Closed-month archives (full standings). See migration_monthly_leaderboards.sql.
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

create index if not exists monthly_leaderboard_entries_user_idx
  on monthly_leaderboard_entries(user_id);

alter table monthly_leaderboards enable row level security;
alter table monthly_leaderboard_entries enable row level security;

-- snapshot_monthly_leaderboard() and backfill_monthly_leaderboards() are created
-- by supabase/migration_monthly_leaderboards.sql. Run that file as well.