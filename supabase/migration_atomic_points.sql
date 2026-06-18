-- Atomic point updates
--
-- Previously, awarding points was a read-modify-write in application code
-- (SELECT total_points -> UPDATE total_points + delta). Concurrent awards
-- (e.g. an admin approving a submission while the Telegram bot credits a
-- chat point) could read the same starting value and clobber each other,
-- losing points. These functions perform the increment in a single SQL
-- statement so Postgres handles it atomically.

-- Add a fixed delta to a user's points, identified by user id.
-- Used by submission approvals and manual admin grants.
create or replace function increment_user_points(p_user_id uuid, p_delta integer)
returns void
language sql
as $$
  update users
  set total_points = total_points + p_delta,
      monthly_points = monthly_points + p_delta
  where id = p_user_id;
$$;

-- Add a delta to a user's points by telegram_id and sync their chat count.
-- Used by the Telegram bot. No-ops safely if no user has linked this telegram_id.
create or replace function apply_telegram_points(p_telegram_id text, p_delta integer, p_chat_count integer)
returns void
language sql
as $$
  update users
  set total_points = total_points + p_delta,
      monthly_points = monthly_points + p_delta,
      telegram_chat_count = p_chat_count
  where telegram_id = p_telegram_id;
$$;
