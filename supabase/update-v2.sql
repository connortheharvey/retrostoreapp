-- RetroFind v2 migration
-- Run this AFTER the original schema.sql. Safe to run once on your existing project.
-- Go to Supabase Dashboard > SQL Editor > New query > paste all of this > Run.

-- 1. Add coordinates so we can calculate distance / "near me" sorting
alter table stores add column if not exists latitude double precision;
alter table stores add column if not exists longitude double precision;

-- 2. Photos table
create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references stores(id) on delete cascade,
  url text not null,
  created_at timestamptz default now()
);
alter table photos enable row level security;

create policy "Public can read photos" on photos
  for select using (true);
create policy "Public can add photos" on photos
  for insert with check (true);

-- 3. Storage bucket for uploaded photos (public read, public upload —
--    fine for an early prototype; revisit before wide public launch,
--    see note in README about tightening this later)
insert into storage.buckets (id, name, public)
values ('store-photos', 'store-photos', true)
on conflict (id) do nothing;

create policy "Public can read store photos" on storage.objects
  for select using (bucket_id = 'store-photos');
create policy "Public can upload store photos" on storage.objects
  for insert with check (bucket_id = 'store-photos');

-- 4. Clear out the placeholder seed stores from before (safe to skip if you
--    already deleted them yourself, this just won't match anything)
delete from stores where name in (
  'Video Game Vault', 'Pixel Pusher Retro', 'Insert Coin Arcade & Games'
);

-- 5. Real New Hampshire retro game stores, with coordinates for "near me" sorting.
--    Sourced from public map listings — double check hours/details before relying on them,
--    and feel free to edit any of this later from the Table Editor.
insert into stores (name, address, description, specialties, website, latitude, longitude) values
  ('Bazaar Game Trading', '650 Amherst St Unit 8, Nashua, NH 03063', 'Well-regarded retro and modern game shop also carrying Magic and Pokemon singles.', array['Retro Consoles','Trade-Ins','Pokemon/MTG'], null, 42.8028492, -71.5426284),
  ('Level UP Gaming', '679 Mast Rd, Manchester, NH 03102', 'Strong GameCube and Wii U selection, plus imported Super Famicom titles.', array['Retro Consoles','Imports','Trade-Ins'], null, 42.9941411, -71.5065658),
  ('Retro Video Game World', '155 Front St, Exeter, NH 03833', 'Seacoast-area shop packed with consoles, cartridges, and collectible figures.', array['Retro Consoles','Collectibles','Trade-Ins'], null, 42.9789986, -70.9612299),
  ('Core Gaming (Nashua)', '345 Amherst St #6, Nashua, NH 03063', 'Cozy shop covering retro and modern games alongside Pokemon and Magic cards.', array['Retro Consoles','Pokemon/MTG','Trade-Ins'], null, 42.7834360, -71.5028092),
  ('Core Gaming (Manchester)', '1525 S Willow St #7, Manchester, NH 03103', 'Manchester location of the Core Gaming chain — retro and modern, plus anime merch.', array['Retro Consoles','Anime/Collectibles','Trade-Ins'], null, 42.9536862, -71.4403109),
  ('Gorilla Games', '59-61 NH-27, Raymond, NH 03077', 'Highly rated retro specialist known for classic Atari hardware and console repairs.', array['Retro Consoles','Repairs','Atari'], null, 43.0402765, -71.1646602),
  ('Core Gaming (Salem)', '221 N Broadway, Salem, NH 03079', 'Busy Salem location with a broad Nintendo and trading card selection.', array['Retro Consoles','Pokemon/MTG','Trade-Ins'], null, 42.7885531, -71.2347145),
  ('Collec-tiques', '56 N Main St, Rochester, NH 03867', 'Retro toys and consoles alongside a candy and ice cream counter in back.', array['Retro Consoles','Toys/Collectibles'], null, 43.3045031, -70.9777126),
  ('Diversity Gaming', '1328 Hooksett Rd, Hooksett, NH 03106', 'Community game store with tabletop space plus a retro and card game selection.', array['Retro Consoles','Tabletop/TCG'], null, 43.0553000, -71.4437595),
  ('Gen X Gaming', '599 Lafayette Rd #7, Portsmouth, NH 03801', 'Portsmouth shop known for its retro console displays and Pokemon card selection.', array['Retro Consoles','Pokemon/MTG'], null, 43.0555116, -70.7689857),
  ('Vintage Arcade at Dole Mill', '1249 New Hampshire Rte 175, Campton, NH 03223', 'Playable vintage arcade cabinets alongside mini golf and an old-fashioned candy shop.', array['Arcade Cabinets','Playable Demos'], null, 43.8598632, -71.6318969),
  ('8-Bit Gaming', '11 E Broadway, Derry, NH 03038', 'Well-reviewed retro trade-in shop with a knowledgeable staff.', array['Retro Consoles','Trade-Ins'], null, 42.8809188, -71.3256505)
on conflict do nothing;
