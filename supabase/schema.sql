-- Africa Monthly — Supabase Schema
-- Run this in your Supabase project SQL editor

-- Users
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  discord_id text unique not null,
  discord_username text not null,
  discord_avatar text,
  discord_email text,
  telegram_username text,
  telegram_chat_count integer not null default 0,
  twitter text,
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

-- Telegram events (for chat tracking)
create table if not exists telegram_events (
  id uuid primary key default gen_random_uuid(),
  telegram_username text unique not null,
  message_count integer not null default 0,
  points_awarded integer not null default 0,
  synced_at timestamptz not null default now()
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

-- Indexes
create index if not exists users_discord_id_idx on users(discord_id);
create index if not exists users_monthly_points_idx on users(monthly_points desc);
create index if not exists submissions_user_id_idx on submissions(user_id);
create index if not exists submissions_task_id_idx on submissions(task_id);
create index if not exists submissions_status_idx on submissions(status);
create index if not exists telegram_events_username_idx on telegram_events(telegram_username);
