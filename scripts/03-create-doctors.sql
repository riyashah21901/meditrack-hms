-- Doctors table with minimal fields: first_name, last_name, email, phone

create table if not exists public.doctors (
  id text primary key,
  first_name text not null,
  last_name text not null,
  email text unique,
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Useful indexes
create index if not exists doctors_first_last_idx on public.doctors (first_name, last_name);
create index if not exists doctors_email_idx on public.doctors (email);

-- Enable RLS (Row Level Security)
alter table public.doctors enable row level security;

-- Create permissive demo policies only if they don't already exist.
-- NOTE: Replace these with secure, authenticated policies for production.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'doctors' and policyname = 'doctors_select_all'
  ) then
    create policy "doctors_select_all" on public.doctors for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'doctors' and policyname = 'doctors_insert_all'
  ) then
    create policy "doctors_insert_all" on public.doctors for insert with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'doctors' and policyname = 'doctors_update_all'
  ) then
    create policy "doctors_update_all" on public.doctors for update using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'doctors' and policyname = 'doctors_delete_all'
  ) then
    create policy "doctors_delete_all" on public.doctors for delete using (true);
  end if;
end$$;

-- Seed sample rows only if table is empty
insert into public.doctors (id, first_name, last_name, email, phone)
select * from (values
  ('D001','Jane','Doe','jane.doe@hospital.test','+1 555 101 0001'),
  ('D002','John','Smith','john.smith@hospital.test','+1 555 101 0002'),
  ('D003','Amelia','Brown','amelia.brown@hospital.test','+1 555 101 0003'),
  ('D004','Noah','Johnson','noah.johnson@hospital.test','+1 555 101 0004'),
  ('D005','Olivia','Davis','olivia.davis@hospital.test','+1 555 101 0005'),
  ('D006','Liam','Wilson','liam.wilson@hospital.test','+1 555 101 0006')
) as t(id, first_name, last_name, email, phone)
where not exists (select 1 from public.doctors);
