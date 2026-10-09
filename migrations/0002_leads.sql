create table if not exists leads (
  id text primary key,
  created_at timestamptz not null default now(),
  mode text not null check (mode in ('voice', 'manual')),
  status text not null default 'draft' check (status in ('draft', 'submitted', 'confirmed')),
  name text,
  phone text,
  email text,
  school_name text,
  raw_transcript text,
  bullet_requirements jsonb,
  callback_date date,
  callback_slot text,
  objective text,
  email_sent boolean not null default false,
  edit_token text not null,
  client_key text unique
);

create index if not exists leads_created_at_idx on leads (created_at desc);

create table if not exists booth_settings (
  id integer primary key,
  pin_hash text,
  updated_at timestamptz not null default now()
);

insert into booth_settings (id)
values (1)
on conflict (id) do nothing;
