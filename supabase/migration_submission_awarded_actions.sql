-- Per-submission awarded actions
--
-- When admin reviews an X-post submission, they can toggle which required
-- actions the user actually completed (like, reply, repost) and award only
-- those. This column stores the subset that was actually awarded.
--
-- For non-X tasks or pre-feature submissions, this stays NULL and the
-- history display falls back to the task's full `x_actions` list.
--
-- type matches the existing `tasks.x_actions` text[] pattern.

alter table submissions
  add column if not exists awarded_actions text[];
