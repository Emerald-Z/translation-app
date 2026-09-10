# LingoMous

A personal web app for reading foreign-language PDF books with inline phonetics,
translation, and a saved-card vocabulary system. Vite + React on the front end,
Supabase for auth, data and storage, hosted on Vercel.

The interface follows the LingoMous design file (Figma → *Language Editor*):
a navy sidebar, cream reading-room palette, Playfair Display headings and
DM Sans body copy.

## Screens

| Route | Screen |
|---|---|
| `/` (signed out) | Intro — the illustrated reading room with Login / Sign Up |
| `/login`, `/signup` | Email + password auth |
| `/account` | Account customization: photo, username, primary language |
| `/` | Home — stats, Continue Reading, Recent Activity shelf, Pinned Cards rail |
| `/library` | Favourites shelf plus a sortable All Titles list |
| `/add` | Two-step Add a Book: upload, then details and reading mode |
| `/read` | Pick a book to open |
| `/read/:bookId` | The reader |
| `/cards` | Card Directory, with All Cards, By Language, By Book and Collections |

## The reader

Three reading modes, remembered per book:

- **Highlight** — the original page. Select text to see phonetics and a
  translation, and save it as a card. Saved cards paint as highlights you can
  hover for a tooltip.
- **Side-by-side** — the original page next to a live translation of the same page.
- **Translated** — the translated text on its own.

The floating toolbar carries the pronunciation toggle, page navigation and
settings. Settings covers font size, brightness, page size, theme
(light / sepia / dark), single-page or continuous layout, highlight colour and
the progress bar. The notebook button opens the book's details and every card
saved from it.

Translations run through Google Translate's free unofficial endpoint and are
cached in memory per page.

**Language support**

| Language | Phonetics |
|---|---|
| Chinese | Full pinyin with tone marks (`pinyin-pro`) |
| Japanese | Romaji for hiragana/katakana; kanji unannotated (`wanakana`) |
| Korean | Revised Romanization per syllable block |
| English, Spanish, French, German, Portuguese, Russian, Arabic | Translation only |

Phonetics are computed client-side with no API calls. `src/lib/phonetics.ts` is
written so the whole layer can be swapped for a single API call without touching
the rest of the app.

## Cards

Selecting text in the reader and saving it creates a card holding the original
text, its phonetics, the translation, the book and the page. Cards can be
pinned to Home, searched and filtered on All Cards, browsed by language or by
book, and grouped into named collections.

## Tech stack

| Layer | Tool |
|---|---|
| Frontend | Vite + React + TypeScript |
| Routing | React Router |
| Styling | Tailwind CSS (design tokens in `tailwind.config.js`) |
| PDF rendering | react-pdf (pdf.js) |
| Phonetics | pinyin-pro, wanakana (client-side) |
| Translation | Google Translate unofficial endpoint |
| Database, auth, storage | Supabase |
| Hosting | Vercel |

## Local development

```bash
npm install
npm run dev
```

Create a `.env.local` with your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

`public/pdfjs/` holds the pdf.js cmaps and standard fonts, copied from
`pdfjs-dist`. They are required for CJK and standard-font PDFs to render.

## Supabase setup

### Base tables

```sql
create table books (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  filename text not null,
  storage_path text not null,
  language text not null,
  total_pages int,
  last_page int default 1,
  created_at timestamptz default now()
);

create table highlights (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  book_id uuid references books(id) on delete cascade,
  page_number int not null,
  text text not null,
  pinyin text not null,
  translation text not null,
  translation_override text,
  notes text,
  x float not null,
  y float not null,
  width float not null,
  height float not null,
  created_at timestamptz default now()
);

alter table books enable row level security;
create policy "users manage own books" on books
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table highlights enable row level security;
create policy "users manage own highlights" on highlights
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

### Redesign migration

Run `supabase/migrations/0001_lingomous_redesign.sql` against your project. It
adds book titles, authors, translation language, reading mode and favourites;
pinned cards; the `profiles` table; the `collections` and `collection_cards`
tables; and a public `covers` storage bucket.

The app degrades rather than breaking if the migration has not run: book titles
fall back to file names, the profile falls back to the email handle stored
locally, and pinning and collections quietly no-op. Run the migration to get
those features.

### Storage

Create a private bucket called `pdfs`:

```sql
create policy "allow upload" on storage.objects
  for insert with check (bucket_id = 'pdfs' and auth.uid() is not null);
create policy "allow read" on storage.objects
  for select using (bucket_id = 'pdfs' and auth.uid() is not null);
create policy "allow delete" on storage.objects
  for delete using (bucket_id = 'pdfs' and auth.uid() is not null);
```

The migration creates the public `covers` bucket used for generated book covers
and profile photos, along with its read, upload and delete policies.

## Deploying to Vercel

1. Push the repo to GitHub.
2. Import the project on [vercel.com](https://vercel.com).
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the project settings.
4. Deploy — Vercel detects Vite automatically.

The app uses client-side routing, so add a rewrite so deep links resolve:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

Save that as `vercel.json` at the repo root. Also update the **Site URL** and
**Redirect URLs** in Supabase under **Authentication → URL Configuration**.
