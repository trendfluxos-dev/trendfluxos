
create table if not exists public.telegram_support_sessions (
  chat_id bigint primary key,
  step text not null default 'awaiting_name',
  name text,
  issue text,
  username text,
  premium boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.telegram_support_sessions enable row level security;

create policy "no client access" on public.telegram_support_sessions for select using (false);
