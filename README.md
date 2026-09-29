# AI Video Templates

A web app where anyone turns a photo into a short, trending AI video. Each viral trend gets its own search page; the first video is free, and later ones will be paid with credits. The full plan is in `docs/AI_Video_Template_Business_Proposal.pdf`.

This is the weeks 1–2 build: Google sign-in, photo upload, one template (`/t/retro-80s-video`) that makes a video through fal.ai, and a results page.

## Stack

- **Next.js 16** (App Router) for the site and API routes
- **Supabase** for Google sign-in, the `generations` table and private photo storage
- **fal.ai** for video models (Wan 2.5 at 480p for free videos; Kling 2.5 Turbo Pro reserved for paid ones)

## Setup

1. **Install:** `npm install` (Node 20.9 or newer).
2. **Create a Supabase project** at [supabase.com](https://supabase.com).
3. **Create the database table and storage bucket:** open the SQL editor and run `supabase/migrations/0001_init.sql`. (Or run `supabase db push` with the Supabase CLI.)
4. **Turn on Google sign-in:**
   - In Google Cloud Console, create an OAuth client (type "Web application"). Add `https://<your-project>.supabase.co/auth/v1/callback` as an authorized redirect URI.
   - In Supabase, go to **Authentication → Sign In / Providers → Google**, and paste the client ID and secret.
   - In Supabase, go to **Authentication → URL Configuration**. Add `http://localhost:3000/auth/callback`, plus your production URL, to the redirect URLs.
5. **Get a fal.ai key** at [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys), and add a little credit.
6. **Set environment variables:** copy `.env.example` to `.env.local` and fill it in.
7. **Run:** `npm run dev`, then open http://localhost:3000.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (also type-checks) |
| `npm test` | Unit tests (Vitest) |
| `npm run typecheck` | TypeScript check only |

## How a video gets made

1. The template page (`src/app/t/[slug]`) uploads the photo from the browser to the private `uploads` bucket. Each file goes into the user's own folder, and storage policies block every other folder.
2. `POST /api/generate` checks the user and the photo path. It also checks the free allowance (`FREE_VIDEOS_PER_USER`; failed videos don't count). It then gives fal.ai a 1-hour signed link to the photo and queues the job.
3. The results page (`/videos/[id]`) polls `GET /api/generations/[id]` every 4 seconds. That route checks fal.ai once per call and saves the video link when the job finishes.

## Adding a template or changing a model

- **Templates** are records in `src/lib/templates.ts`: title, search copy, hidden prompt, and a model for each tier. A new trend page needs only a new record.
- **Models** are in `src/lib/video/models.ts`. To move a template to a cheaper model or another provider, change its model key. Only fal.ai is wired up so far; add another provider in `src/lib/video/provider.ts`.

## Not built yet

- **Weeks 3–4:** credits ledger, Stripe checkout, watermark on free videos, content moderation, and copying finished videos into our own storage. (fal.ai's links are not permanent.)
- **Weeks 5–6:** 20 trend pages, sitemap, share buttons and analytics.
