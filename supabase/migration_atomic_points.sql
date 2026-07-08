-- Atomic point updates (returns row count for floor-aware callers).
-- Run migration_floor_check.sql for deduction floor enforcement.
--
-- DROP is required when upgrading from the original void-returning RPC.

drop function if exists increment_user_points(uuid, integer);

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