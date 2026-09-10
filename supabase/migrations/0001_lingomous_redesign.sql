-- LingoMous redesign — schema additions.
-- Safe to re-run: every statement is guarded.
-- The app degrades gracefully if this has not been applied yet, but titles,
-- authors, favourites, pinned cards and collections need these columns/tables.

-- ── books ────────────────────────────────────────────────────────────────
alter table public.books add column if not exists title text;
alter table public.books add column if not exists author text;
alter table public.books add column if not exists translation_language text default 'en';
alter table public.books add column if not exists reading_mode text default 'highlight';
alter table public.books add column if not exists favorite boolean default false;
alter table public.books add column if not exists cover_path text;
alter table public.books add column if not exists last_opened_at timestamptz;

-- ── highlights (saved cards) ─────────────────────────────────────────────
alter table public.highlights add column if not exists pinned boolean default false;

-- ── profiles ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text,
  primary_language text default 'en',
  avatar_path text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

do $$ begin
  create policy "profiles are self-service" on public.profiles
    for all using (auth.uid() = id) with check (auth.uid() = id);
exception when duplicate_object then null; end $$;

-- ── card collections ─────────────────────────────────────────────────────
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

create table if not exists public.collection_cards (
  collection_id uuid not null references public.collections (id) on delete cascade,
  highlight_id uuid not null references public.highlights (id) on delete cascade,
  added_at timestamptz default now(),
  primary key (collection_id, highlight_id)
);

alter table public.collections enable row level security;
alter table public.collection_cards enable row level security;

do $$ begin
  create policy "collections are self-service" on public.collections
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "collection cards follow their collection" on public.collection_cards
    for all using (
      exists (select 1 from public.collections c
              where c.id = collection_id and c.user_id = auth.uid())
    ) with check (
      exists (select 1 from public.collections c
              where c.id = collection_id and c.user_id = auth.uid())
    );
exception when duplicate_object then null; end $$;

-- ── storage bucket for book covers and profile photos ────────────────────
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

-- The bucket is public, so reads are served straight from the public URL.
-- Writes still need policies for signed-in users.
do $$ begin
  create policy "covers upload" on storage.objects
    for insert with check (bucket_id = 'covers' and auth.uid() is not null);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "covers read" on storage.objects
    for select using (bucket_id = 'covers');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "covers delete" on storage.objects
    for delete using (bucket_id = 'covers' and auth.uid() is not null);
exception when duplicate_object then null; end $$;
