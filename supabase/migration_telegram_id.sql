-- Add telegram_id to users for tracking by Telegram user ID
alter table users add column if not exists telegram_id text unique;

-- Update telegram_events to track by telegram_id instead of username
alter table telegram_events add column if not exists telegram_id text;
alter table telegram_events add column if not exists display_name text;

-- Make telegram_id unique index on telegram_events
create unique index if not exists telegram_events_telegram_id_idx on telegram_events(telegram_id);
