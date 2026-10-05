-- Dev Tasks section for the admin portal: idea backlog, kanban board, partnerships.

create table dev_ideas (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  priority smallint not null default 1 check (priority in (0, 1, 2)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table dev_tasks (
  id bigint generated always as identity primary key,
  title text not null,
  notes text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  owner text check (owner in ('Jack', 'Izayah', 'Alec')),
  due_date date,
  image_url text,
  sort_order integer not null default 0,
  is_recurring boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Weekly recurring tasks (e.g. "post to social", "reach out to businesses")
-- don't move through the todo/in_progress/done columns — completing one for
-- the week just logs a row here, and it shows as outstanding again once a new
-- week starts, with no cron job needed.
create table dev_task_completions (
  id bigint generated always as identity primary key,
  task_id bigint not null references dev_tasks(id) on delete cascade,
  week_start date not null,
  completed_at timestamptz not null default now(),
  unique (task_id, week_start)
);

create table partnerships (
  id bigint generated always as identity primary key,
  name text not null,
  contact_info text,
  stage text not null default 'researching'
    check (stage in ('researching', 'contacted', 'in_talks', 'partnered', 'declined')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table partnership_messages (
  id bigint generated always as identity primary key,
  partnership_id bigint not null references partnerships(id) on delete cascade,
  message text not null,
  sent_at timestamptz not null default now()
);

create index dev_tasks_status_idx on dev_tasks (status, sort_order);
create index partnership_messages_partnership_id_idx on partnership_messages (partnership_id);
create index dev_task_completions_task_id_idx on dev_task_completions (task_id);

insert into storage.buckets (id, name, public)
values ('dev-task-images', 'dev-task-images', true)
on conflict (id) do nothing;

create policy "Public read access for dev-task-images"
  on storage.objects for select
  using (bucket_id = 'dev-task-images');

create policy "Service role can manage dev-task-images"
  on storage.objects for all
  using (bucket_id = 'dev-task-images' and auth.role() = 'service_role')
  with check (bucket_id = 'dev-task-images' and auth.role() = 'service_role');
