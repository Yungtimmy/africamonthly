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