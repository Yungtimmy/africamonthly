-- 3-day automatic task expiry
--
-- Every task gets an expires_at. Once the timestamp passes, the task is treated
-- as inactive: it disappears from public listing and the submission API rejects
-- new proofs. Admins can still see/toggle expired tasks in /admin/tasks.
--
-- EXISTING tasks: gets expires_at = created_at + 3 days so this migration is
-- backward-compatible. Admins can override per task via PATCH /api/tasks/[id].

alter table tasks
  add column if not exists expires_at timestamptz;

-- Backfill: any row where expires_at is null gets created_at + 3 days.
update tasks
  set expires_at = created_at + interval '3 days'
  where expires_at is null;

create index if not exists tasks_expires_at_idx on tasks(expires_at);
create index if not exists tasks_active_expires_idx on tasks(is_active, expires_at);

-- Optional NULL means "no expiry" — never auto-deactivate. The app layer
-- enforces this by passing expires_at = null on PATCH when an admin clears it.
-- (Default for new tasks is set in the application via creates_at + interval '3 days'.
--  We do NOT set a DB default so app code stays the source of truth.)
