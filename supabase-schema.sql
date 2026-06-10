create table if not exists blog_posts (
  slug text primary key,
  title text not null,
  date date not null,
  category text,
  cover_image text not null default '',
  end_images text[] not null default '{}',
  excerpt text not null default '',
  content text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists events (
  slug text primary key,
  title text not null,
  date date not null,
  location text,
  cover_image text not null default '',
  end_images text[] not null default '{}',
  excerpt text not null default '',
  content text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists videos (
  slug text primary key,
  title text not null,
  description text not null default '',
  category text not null,
  type text not null check (type in ('youtube', 'mp4')),
  src text not null,
  date date not null,
  updated_at timestamptz not null default now()
);

-- V1.2.2: ordered images shown after the article body. Existing rows remain valid.
alter table blog_posts add column if not exists end_images text[] not null default '{}';
alter table events add column if not exists end_images text[] not null default '{}';

-- Blog / Event content attachments. Writes and deletes use the server-side service role key.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'content-images',
  'content-images',
  true,
  5242880,
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
