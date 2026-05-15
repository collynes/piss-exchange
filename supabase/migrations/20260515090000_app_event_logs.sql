create table if not exists app_event_logs (
  id uuid primary key default uuid_generate_v4(),
  distinct_id text,
  event text not null,
  properties jsonb not null default '{}'::jsonb,
  level text not null default 'info' check (level in ('info', 'warning', 'error')),
  source text not null default 'server',
  created_at timestamptz not null default now()
);

create index if not exists app_event_logs_created_at_idx on app_event_logs(created_at desc);
create index if not exists app_event_logs_event_idx on app_event_logs(event);
create index if not exists app_event_logs_level_idx on app_event_logs(level);

alter table app_event_logs enable row level security;

drop policy if exists "app_event_logs_admin_read" on app_event_logs;

create policy "app_event_logs_admin_read" on app_event_logs
  for select
  using (is_admin());
