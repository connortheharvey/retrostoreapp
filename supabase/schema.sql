-- RetroStorePortal database schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query > paste > Run)

create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  description text default '',
  specialties text[] default '{}',
  website text,
  created_at timestamptz default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references stores(id) on delete cascade,
  reviewer_name text default 'Anonymous Collector',
  rating int not null check (rating between 1 and 5),
  comment text not null,
  flagged boolean default false,
  created_at timestamptz default now()
);

alter table stores enable row level security;
alter table reviews enable row level security;

create policy "Public can read stores" on stores
  for select using (true);

create policy "Public can add stores" on stores
  for insert with check (true);

create policy "Public can read reviews" on reviews
  for select using (true);

create policy "Public can add reviews" on reviews
  for insert with check (true);

-- Seed data (optional — delete later from the Table Editor once you have real listings)
insert into stores (name, address, description, specialties, website) values
  ('Video Game Vault', '221 W 8th St, New York, NY', 'Packed floor-to-ceiling with loose carts, CIB classics, and a back room of arcade cabinets under repair.', array['NES/SNES','Arcade Cabinets','Repairs'], null),
  ('Pixel Pusher Retro', '48 Ludlow St, New York, NY', 'Small but mighty — strong on Game Boy and import Japanese titles, fair trade-in prices.', array['Game Boy','Imports','Trade-Ins'], null),
  ('Insert Coin Arcade & Games', '900 Broadway, Brooklyn, NY', 'Half arcade, half store. Play a cabinet before you decide whether to buy one.', array['Arcade Cabinets','Playable Demos','PS1/PS2'], null);
