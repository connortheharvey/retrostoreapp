# RetroStorePortal

A directory + review site for retro video game stores — arcades, cartridge shops, repair counters.
Built with Next.js (frontend + API) and Supabase (database).

## What's in this folder
- `app/` — the website (pages + API routes)
- `supabase/schema.sql` — the database structure. Run this once in Supabase.
- `.env.example` — copy to `.env.local` and fill in your own keys (see below)

## Run it on your own computer (optional, for testing)
```
npm install
npm run dev
```
Then open http://localhost:3000 — but it won't load any data until you've set up Supabase (next section).

## Get it live on the internet — step by step

### 1. Create a Supabase project (free) — this is your database
1. Go to https://supabase.com and sign up
2. Click "New Project", give it any name, choose a region near you, set a database password (save it somewhere)
3. Once it's created, go to the SQL Editor tab, paste in the entire contents of `supabase/schema.sql`, and click Run
4. Go to Settings > API — you'll need three values from this page in step 3 below:
   - Project URL
   - anon public key
   - service_role secret key (keep this one truly secret — never put it in frontend code)

### 2. Create a GitHub account and upload this project (free)
1. Go to https://github.com and sign up if you don't have an account
2. Create a new repository (e.g. retrostoreportal)
3. Upload this whole folder to it (GitHub's website lets you drag-and-drop files, or use GitHub Desktop if you prefer a normal app instead of the command line)

### 3. Deploy to Vercel (free) — this is your hosting
1. Go to https://vercel.com and sign up (you can sign up directly with your GitHub account)
2. Click "Add New Project" and select the GitHub repo you just created
3. Before clicking Deploy, open "Environment Variables" and add these four:
   - NEXT_PUBLIC_SUPABASE_URL -> your Project URL from Supabase
   - NEXT_PUBLIC_SUPABASE_ANON_KEY -> your anon public key
   - SUPABASE_SERVICE_ROLE_KEY -> your service role secret key
   - ADMIN_PASSWORD -> make up a strong password — this is what YOU will use to log into /admin to moderate reviews
4. Click Deploy. In a minute or two, Vercel gives you a live link like retrostoreportal.vercel.app

That link is a real, working website anyone can visit.

### 4. Moderating reviews
Go to yourdomain.com/admin and log in with the ADMIN_PASSWORD you set. Any review a visitor "Reports" shows up here, and you can restore it or delete it permanently.

### 5. (Later) A custom domain
Buy a domain (e.g. from Namecheap or directly through Vercel) and connect it under your Vercel project's Settings > Domains tab. This costs roughly $10-15/year.

## Costs at this stage
- Supabase free tier: $0 (plenty for a new app)
- Vercel free tier: $0 (plenty for a new app)
- Domain name: ~$12/year, optional at first (the .vercel.app link works fine for testing)

Total to get a real, live, working app: $0 to start.
