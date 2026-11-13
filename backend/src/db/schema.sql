-- Safe to run more than once.
create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  password_hash text not null,
  created_at    timestamptz not null default now()
);

create table if not exists profiles (
  user_id       uuid primary key references users(id) on delete cascade,
  full_name     text not null,
  phone         text,
  active_mode   text not null default 'customer'
                check (active_mode in ('customer', 'trader')),
  purpose       text check (purpose in ('find', 'offer', 'both')),
  trader_status text not null default 'none'
                check (trader_status in ('none', 'draft', 'pending', 'approved', 'rejected')),
  created_at    timestamptz not null default now()
);
