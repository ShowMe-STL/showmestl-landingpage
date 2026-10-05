-- Ideas live on the Kanban board itself now (as low-context "todo" cards with
-- a priority badge) instead of a separate tab/table.

alter table dev_tasks add column priority smallint check (priority in (0, 1, 2));

with base as (
  select coalesce(max(sort_order), -1) as max_sort from dev_tasks where status = 'todo'
)
insert into dev_tasks (title, notes, status, priority, sort_order)
select
  di.title,
  di.description,
  'todo',
  di.priority,
  base.max_sort + row_number() over (order by di.priority, di.created_at desc)
from dev_ideas di, base;

-- dev_ideas itself is intentionally left in place (unused going forward) —
-- dropping tables is treated as a destructive action and blocked here; a
-- human can `drop table dev_ideas;` later if they want it gone.
