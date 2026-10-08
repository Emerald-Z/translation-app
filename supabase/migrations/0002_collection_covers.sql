-- Collections gained a cover image in the October designs.
-- Safe to re-run.

alter table public.collections add column if not exists cover_path text;
