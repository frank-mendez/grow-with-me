-- pregnancy_weeks: static reference table — read-only public data
create table pregnancy_weeks (
  id          uuid primary key default gen_random_uuid(),
  week_number int  unique not null,
  title       text,
  description text
);

alter table pregnancy_weeks enable row level security;

create policy "Anyone can read pregnancy weeks"
  on pregnancy_weeks for select
  using (true);

-- voice_entries
create table voice_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  week_id    uuid references pregnancy_weeks(id) on delete cascade not null,
  audio_url  text not null,
  created_at timestamptz default now() not null
);

-- kick_logs
create table kick_logs (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date    date not null,
  count   int  default 0 not null check (count >= 0)
);

-- mood_entries
create table mood_entries (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date    date not null,
  mood    text check (mood in ('HAPPY', 'NEUTRAL', 'STRESSED', 'SAD')) not null
);

-- Indexes for common user+date lookups
create index on kick_logs  (user_id, date);
create index on mood_entries (user_id, date);

-- Row Level Security
alter table voice_entries enable row level security;
alter table kick_logs     enable row level security;
alter table mood_entries  enable row level security;

-- Policies: users can only read/write their own rows
create policy "Users can manage their own voice entries"
  on voice_entries for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own kick logs"
  on kick_logs for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own mood entries"
  on mood_entries for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
