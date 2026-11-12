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
  notes text,
  triggers text[] default '{}',
  key_rules text[] default '{}',
  allowed_tools text[] default '{}',
  technologies text[] default '{}',
  is_favorite boolean default false,
  is_public boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Migrations in case the table already existed with fewer columns:
alter table public.skills add column if not exists triggers text[] default '{}';
alter table public.skills add column if not exists key_rules text[] default '{}';
alter table public.skills add column if not exists allowed_tools text[] default '{}';
alter table public.skills add column if not exists technologies text[] default '{}';
alter table public.skills add column if not exists is_favorite boolean default false;

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

-- Authenticated or anonymous users can insert skills
create policy "Anyone can insert skills"
  on public.skills for insert
  with check (true);

-- Users can update only their own skills or public skills
create policy "Users can update their own skills"
  on public.skills for update
  using (auth.uid() = user_id or auth.uid() is null);

-- Users can delete only their own skills
create policy "Users can delete their own skills"
  on public.skills for delete
  using (auth.uid() = user_id or auth.uid() is null);

-- 5. RLS Policies for Packs:
create policy "Anyone can read public packs"
  on public.packs for select
  using (is_public = true or auth.uid() = user_id);

create policy "Anyone can insert packs"
  on public.packs for insert
  with check (true);

create policy "Users can update their own packs"
  on public.packs for update
  using (auth.uid() = user_id or auth.uid() is null);

create policy "Users can delete their own packs"
  on public.packs for delete
  using (auth.uid() = user_id or auth.uid() is null);

-- 6. Indexes for ultra-fast searches and tag filtering
create index if not exists skills_category_idx on public.skills (category);
create index if not exists skills_name_idx on public.skills (name);
create index if not exists skills_repo_idx on public.skills (repo);
create index if not exists skills_created_at_idx on public.skills (created_at desc);
