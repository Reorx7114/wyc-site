-- V1.3 phase 1: service requests and private request attachments.
-- Review and run this migration in Supabase SQL Editor before testing Preview writes.

create table if not exists service_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  address text not null default '',
  category text not null check (category in (
    '社區問題',
    '長照協助',
    '急難救助',
    '基金會服務',
    '活動合作',
    '其他'
  )),
  content text not null,
  image_paths text[] not null default '{}',
  status text not null default '新案件' check (status in (
    '新案件',
    '已聯繫',
    '追蹤中',
    '已完成',
    '結案'
  )),
  admin_notes text not null default '',
  is_test boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table service_requests add column if not exists image_paths text[] not null default '{}';
alter table service_requests add column if not exists admin_notes text not null default '';
alter table service_requests add column if not exists is_test boolean not null default false;
alter table service_requests add column if not exists updated_at timestamptz not null default now();

-- Personal contact information is only accessed by server-side service role APIs.
alter table service_requests enable row level security;

create or replace function set_service_requests_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists service_requests_set_updated_at on service_requests;
create trigger service_requests_set_updated_at
before update on service_requests
for each row
execute function set_service_requests_updated_at();

create index if not exists service_requests_status_idx
on service_requests (status);

create index if not exists service_requests_created_at_idx
on service_requests (created_at desc);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'service-request-images',
  'service-request-images',
  false,
  5242880,
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
