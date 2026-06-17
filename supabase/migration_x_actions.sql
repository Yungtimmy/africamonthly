-- Migrate x_action (single) to x_actions (array) for multi-action X tasks
alter table tasks add column if not exists x_actions text[];

-- Copy existing single action into array
update tasks set x_actions = array[x_action] where x_action is not null and x_actions is null;
