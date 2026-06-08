create table if not exists blog_posts (
  slug text primary key,
  title text not null,
  date date not null,
  category text,
  cover_image text not null default '',
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
