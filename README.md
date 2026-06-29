# Chinese Reader

A personal web app for reading Chinese PDF books with inline pinyin, translation, and a vocabulary dictionary. Built with Vite + React, backed by Supabase, and hosted on Vercel.

## Features

### PDF Library
- Upload Chinese PDF books via drag and drop or file picker
- Books are stored in Supabase and persist across sessions and devices
- Each book card shows a reading progress bar and your current page
- Click a book to open it; it resumes from where you left off
- Delete books from the library with the hover ✕ button

### PDF Reader
- Page-by-page PDF rendering with a selectable text layer
- Zoom in and out (50%–300%) using the − / + controls in the navigation bar
- Reading progress is saved automatically as you turn pages

### Pinyin & Translation Popup
- Highlight any Chinese text to open a popup showing:
  - Each character stacked with its pinyin (with tone marks) above it
  - The full pinyin string
  - An English translation (via Google Translate's free unofficial API)
- Click **Save to Dictionary** to add the word or phrase to your personal dictionary

### Saved Highlights
- Saved highlights appear as yellow overlays on the PDF page
- Hover over any highlight to see a tooltip with the text, pinyin, and translation — no re-highlighting needed
- Highlights persist across sessions and reloads

### Dictionary
- Accessible from the top nav bar
- Shows every unique word or phrase you've saved across all books
- Each entry displays the Chinese text, pinyin, English translation, and a count of how many times you've highlighted it
- Search by Chinese text, pinyin, or English translation
- Hover a card and click the ✎ button to edit the translation or add a personal note
  - Edited translations show your override with the original struck through beneath it
  - Notes appear in an amber badge on the card and in the reader tooltip when hovering a highlight
- Delete entries with the hover ✕ button (removes all highlights of that word)

### Authentication
- Email + password accounts via Supabase Auth
- Each user's library, highlights, and dictionary are fully private and isolated
- Sign up and sign in from the app's login page

### Login:
- Opening the app shows a sign in / sign up page
- Each account only sees its own books, highlights, and dictionary — fully isolated at the database level                                                        
- Your email shows in the top right with a "Sign out" button                                                                                                     
- When friends sign up, they'll get a confirmation email before they can log in (standard Supabase default)   
## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | Vite + React + TypeScript |
| Styling | Tailwind CSS |
| PDF rendering | react-pdf (pdf.js) |
| Pinyin conversion | pinyin-pro (client-side, no API) |
| Translation | Google Translate unofficial API (free) |
| Database + Auth | Supabase (Postgres + Storage) |
| Hosting | Vercel |

## Local Development

```bash
npm install
npm run dev
```

Create a `.env.local` file with your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Deploying to Vercel

1. Push the repo to GitHub
2. Import the project on [vercel.com](https://vercel.com)
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in the Vercel project settings
4. Deploy — Vercel detects Vite automatically

Before sharing with others, update the **Site URL** and **Redirect URLs** in Supabase under **Authentication → URL Configuration** to point to your Vercel URL.

## Supabase Setup

### Database tables

```sql
create table books (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  filename text not null,
  storage_path text not null,
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
  x float not null,
  y float not null,
  width float not null,
  height float not null,
  created_at timestamptz default now()
);
```

### RLS policies

```sql
alter table books enable row level security;
create policy "users manage own books" on books
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table highlights enable row level security;
create policy "users manage own highlights" on highlights
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

### Storage

Create a private bucket called `pdfs`, then add these policies:

```sql
create policy "allow upload" on storage.objects
  for insert with check (bucket_id = 'pdfs' and auth.uid() is not null);
create policy "allow read" on storage.objects
  for select using (bucket_id = 'pdfs' and auth.uid() is not null);
create policy "allow delete" on storage.objects
  for delete using (bucket_id = 'pdfs' and auth.uid() is not null);
```
