-- ====================================================================
-- LifeFolder Complete Supabase Database & Storage Migration
-- ====================================================================

-- 1. Create Deadlines Table
create table if not exists public.deadlines (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text,
  deadline_date date not null,
  identifier text,
  reminder integer default 0,
  file_path text,
  file_name text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. Enable Row Level Security (RLS)
alter table public.deadlines enable row level security;

-- 3. Strict Owner Policies (Only owner can read, insert, update, or delete)
create policy "Users can view their own deadlines"
  on public.deadlines for select
  using (auth.uid() = user_id);

create policy "Users can insert their own deadlines"
  on public.deadlines for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own deadlines"
  on public.deadlines for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own deadlines"
  on public.deadlines for delete
  using (auth.uid() = user_id);

-- 4. Create Private Storage Bucket for Document Attachments
insert into storage.buckets (id, name, public)
values ('deadline-attachments', 'deadline-attachments', false)
on conflict (id) do nothing;

-- 5. Storage Policies (Files stored as: {user_id}/{unique_filename})
create policy "Users can upload their own attachments"
  on storage.objects for insert
  with check (
    bucket_id = 'deadline-attachments' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view and download their own attachments"
  on storage.objects for select
  using (
    bucket_id = 'deadline-attachments' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own attachments"
  on storage.objects for update
  using (
    bucket_id = 'deadline-attachments' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own attachments"
  on storage.objects for delete
  using (
    bucket_id = 'deadline-attachments' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
