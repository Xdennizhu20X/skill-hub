-- Schema for SkillsHub (Multi-user and Shared Skills)
-- Run this in your Supabase SQL Editor

-- 1. Create skills table
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  title text not null,
  repo text not null,
  repo_url text not null,
  skill_path text,
  description text not null,
  category text not null default 'other',
  tags text[] default '{}',
  author text not null,
  install_command text not null,
  raw_content text,
  is_public boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create packs table (bundles of skills for 1-click install)
create table if not exists public.packs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  skill_ids text[] default '{}',
  icon text default '✨',
  category text not null default 'other',
  is_public boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Row Level Security (RLS)
alter table public.skills enable row level security;
alter table public.packs enable row level security;

-- 4. RLS Policies for Skills:
-- Anyone can view public skills
create policy "Anyone can read public skills"
  on public.skills for select
  using (is_public = true or auth.uid() = user_id);

-- Authenticated users can insert their own skills
create policy "Authenticated users can create skills"
  on public.skills for insert
  with check (auth.uid() = user_id or auth.uid() is null);

-- Users can update only their own skills
create policy "Users can update their own skills"
  on public.skills for update
  using (auth.uid() = user_id);

-- Users can delete only their own skills
create policy "Users can delete their own skills"
  on public.skills for delete
  using (auth.uid() = user_id);

-- 5. RLS Policies for Packs:
create policy "Anyone can read public packs"
  on public.packs for select
  using (is_public = true or auth.uid() = user_id);

create policy "Authenticated users can create packs"
  on public.packs for insert
  with check (auth.uid() = user_id or auth.uid() is null);

create policy "Users can update their own packs"
  on public.packs for update
  using (auth.uid() = user_id);

create policy "Users can delete their own packs"
  on public.packs for delete
  using (auth.uid() = user_id);

-- 6. Indexes for ultra-fast searches and tag filtering
create index if not exists skills_category_idx on public.skills (category);
create index if not exists skills_name_idx on public.skills (name);
create index if not exists skills_repo_idx on public.skills (repo);
create index if not exists skills_created_at_idx on public.skills (created_at desc);
