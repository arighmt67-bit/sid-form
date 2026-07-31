-- SID Form — Phase 1 & 2
-- Jalankan di Supabase Dashboard → SQL Editor SETELAH 001_init.sql
--
-- Menambahkan: generator slug, kolom publish, dan indeks pendukung.

-- ── 1. Slug otomatis untuk URL form publik ───────────────────────────────
-- Contoh hasil: "form-pengajuan-cuti-a3f9"
create or replace function slugify(txt text)
returns text
language sql
immutable
as $$
  select trim(both '-' from
    regexp_replace(
      regexp_replace(lower(coalesce(txt, '')), '[^a-z0-9]+', '-', 'g'),
      '-{2,}', '-', 'g'
    )
  );
$$;

-- ── 2. Kolom tambahan pada forms ─────────────────────────────────────────
alter table forms add column if not exists published_at timestamptz;
alter table forms add column if not exists submission_count int not null default 0;

-- ── 3. Submissions: simpan versi schema yang dijawab ─────────────────────
-- (kolom schema_version sudah ada di 001_init.sql; pastikan indeksnya ada)
create index if not exists idx_submissions_created
  on submissions(form_id, created_at desc);

create index if not exists idx_form_versions_form
  on form_versions(form_id, version desc);

-- ── 4. Counter submission otomatis ───────────────────────────────────────
create or replace function bump_submission_count()
returns trigger
language plpgsql
as $$
begin
  update forms
     set submission_count = submission_count + 1
   where id = new.form_id;
  return new;
end;
$$;

drop trigger if exists trg_bump_submission_count on submissions;
create trigger trg_bump_submission_count
  after insert on submissions
  for each row
  execute function bump_submission_count();

-- ── 5. Jaga updated_at tetap akurat ──────────────────────────────────────
create or replace function touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_forms on forms;
create trigger trg_touch_forms
  before update on forms
  for each row
  execute function touch_updated_at();
