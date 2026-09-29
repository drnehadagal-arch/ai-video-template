-- Weeks 1–2: video generations and private photo uploads.

create table public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  template_slug text not null,
  model_key text not null,
  tier text not null default 'free' check (tier in ('free', 'paid')),
  input_path text not null,
  provider_request_id text,
  status text not null default 'queued' check (status in ('queued', 'processing', 'succeeded', 'failed')),
  video_url text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index generations_user_id_created_at on public.generations (user_id, created_at desc);

-- Users can read their own generations. All writes go through the server with the service role.
alter table public.generations enable row level security;

create policy "Users read own generations"
  on public.generations for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Private bucket for uploaded photos; each user may only touch their own folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('uploads', 'uploads', false, 10485760, array['image/jpeg', 'image/png', 'image/webp']);

create policy "Users upload to own folder"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'uploads' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users read own uploads"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'uploads' and (storage.foldername(name))[1] = (select auth.uid())::text);
