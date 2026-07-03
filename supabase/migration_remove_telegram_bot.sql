-- Remove Telegram bot tracking (run once in Supabase SQL editor).
-- Stops any DB-side hooks the bot used; deploy code without bot/ after this.

drop function if exists apply_telegram_points(text, integer, integer);

drop table if exists telegram_events;

alter table users drop column if exists telegram_id;
alter table users drop column if exists telegram_username;
alter table users drop column if exists telegram_chat_count;
alter table users drop column if exists twitter;