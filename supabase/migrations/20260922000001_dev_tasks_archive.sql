-- Add archive functionality to dev_tasks.
-- Archived tasks are hidden from the main board but can be viewed/restored.

alter table dev_tasks add column is_archived boolean not null default false;

create index dev_tasks_archived_idx on dev_tasks (is_archived, status, sort_order);
