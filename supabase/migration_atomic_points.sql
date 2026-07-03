-- Atomic point updates
--
-- Awarding points via read-modify-write can lose updates under concurrency.
-- increment_user_points performs the increment in a single SQL statement.

create or replace function increment_user_points(p_user_id uuid, p_delta integer)
returns void
language sql
as $$
  update users
  set total_points = total_points + p_delta,
      monthly_points = monthly_points + p_delta
  where id = p_user_id;
$$;