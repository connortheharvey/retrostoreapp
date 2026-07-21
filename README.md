# RetroFind

A directory + review site for retro video game stores — arcades, cartridge shops, repair counters.
Built with Next.js (frontend + API) and Supabase (database + photo storage).

## What's new in this version
- Full redesign (arcade marquee / chrome look)
- Real seed data: 12 actual New Hampshire retro game stores with coordinates
- "Find stores near me" — uses your browser location to sort by distance
- One-tap links to open any store directly in Google Maps or Apple Maps
- Every store has its own page with a photo gallery and an upload button

## Setup — if this is your first time
Follow the steps in the previous version of this README: create a Supabase project, run `supabase/schema.sql`
in the SQL Editor, then deploy to Vercel with the four environment variables
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`).

## Setup — if you already had the app running
You only need to do one more thing: run the new migration.
1. Go to your Supabase project → **SQL Editor** → **New query**
2. Open `supabase/update-v2.sql` from this project, copy its entire contents, paste it in
3. Click **Run**

This adds:
- Location columns on stores (for "near me" sorting)
- A `photos` table
- A public Storage bucket called `store-photos` for uploaded images
- Real New Hampshire store listings (and removes the 3 placeholder ones from before)

Then push your updated code to GitHub as usual and let Vercel redeploy — no new environment variables needed.

## A security note on photo uploads
Right now, anyone visiting the site can upload a photo to any store — there's no login system yet.
This is fine for an early prototype, but before a public launch you'll want to add at least one of:
- A simple upload rate limit
- Basic image moderation (the `/admin` page doesn't currently cover photos — only reviews)
- A "report photo" button, mirroring the one reviews already have

Happy to build any of those next if you want to keep going.

## Costs at this stage
- Supabase free tier: $0 (includes 1GB of file storage — plenty of photos before you'd need to pay)
- Vercel free tier: $0
- Domain name: ~$12/year, optional
