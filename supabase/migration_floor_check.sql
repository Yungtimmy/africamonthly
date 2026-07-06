-- Atomic floor enforcement for point adjustments
--
-- Previously the admin POST /api/users/[id]/points route did:
--   1. SELECT current balances
--   2. JS check (would monthly + delta < 0 OR total + delta < 0?)
--   3. RPC update
-- Two concurrent deductions on a user near zero could both pass step 2 and
-- then both run step 3, pushing monthly_points / total_points below 0.
--
-- This migration moves the floor check into the RPC so step 2+3 are atomic
-- at the SQL level. Grants (delta >= 0) always succeed; deductions require
-- sufficient balance on BOTH monthly_points and total_points.
--
-- The function now returns the row count so the caller can distinguish
-- success (1) from floor violation / missing user (0). For grants a 0
-- means "user not found"; for deductions a 0 means "floor would be hit".
-- Caller is expected to have validated the user exists before calling.

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
      -- Grants always succeed; deductions must keep both balances non-negative.
      and (p_delta >= 0
           or (monthly_points + p_delta >= 0
               and total_points + p_delta >= 0));
  get diagnostics affected = row_count;
  return affected;
end;
$$;
