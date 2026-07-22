-- SID Form — Phase 0 schema
-- Run this in Supabase Dashboard → SQL Editor

create extension if not exists "pgcrypto";

-- Users (filled in Phase 1 via NextAuth Google OAuth)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  email_domain text not null,
  name text,
  avatar_url text,
  role text not null default 'creator' check (role in ('admin', 'creator')),
  created_at timestamptz not null default now()
);

-- Forms
create table if not exists forms (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  owner_id uuid references users(id) on delete set null,
  title text not null,
  description text default '',
  schema jsonb not null default '{"components": []}',
  status text not null default 'draft' check (status in ('draft', 'published', 'closed')),
  require_login boolean not null default true,
  schema_version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Schema snapshots per publish (submissions reference the version they answered)
create table if not exists form_versions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references forms(id) on delete cascade,
  version int not null,
  schema jsonb not null,
  published_at timestamptz not null default now(),
  unique (form_id, version)
);

-- Submissions
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references forms(id) on delete cascade,
  schema_version int not null default 1,
  data jsonb not null,
  submitted_by uuid references users(id) on delete set null,
  submitter_email text,
  ip_hash text,
  created_at timestamptz not null default now()
);

-- Uploaded files metadata (binary lives in Supabase Storage)
create table if not exists files (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  field_key text not null,
  storage_path text not null,
  filename text not null,
  size bigint,
  mime text,
  created_at timestamptz not null default now()
);

create index if not exists idx_forms_owner on forms(owner_id);
create index if not exists idx_forms_slug on forms(slug);
create index if not exists idx_submissions_form on submissions(form_id);

-- RLS: deny-all by default. The app accesses the DB exclusively through
-- the server-side service key (which bypasses RLS), so no public policies.
alter table users enable row level security;
alter table forms enable row level security;
alter table form_versions enable row level security;
alter table submissions enable row level security;
alter table files enable row level security;
