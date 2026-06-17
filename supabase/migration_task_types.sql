alter table tasks add column if not exists task_type text not null default 'other_event' check (task_type in ('x_post', 'other_event'));
alter table tasks add column if not exists x_post_url text;
alter table tasks add column if not exists x_action text check (x_action in ('like', 'reply', 'retweet', 'quote'));
