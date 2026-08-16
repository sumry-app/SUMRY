# SUMRY Deployment Guide

## Current state (read this first)

SUMRY deploys as a **static Vite/React site on Vercel**. There is no backend
server to deploy — the old Node/Express `server/` directory has been removed.

A Supabase backend has been provisioned and a full service layer exists under
`src/services/`, **but the UI is not wired to it yet**. As of today `App.jsx`
still persists everything to browser `localStorage`, which means:

- Data lives only in the browser it was entered in — it is not synced,
  shared between users, or backed up server-side.
- `src/lib/supabase.js` and the `supabase*.js` services are not yet reachable
  from the app entry point, so they are tree-shaken out of the production
  bundle.
- Consequently the `VITE_SUPABASE_*` variables are not strictly required for
  the current build to succeed. **Set them anyway** — they become required the
  moment the UI is connected, and a missing value then fails at load.

See the "Still to do" section at the end.

---

## Deploy to Vercel

### First-time setup

1. **Import the repository**
   - Go to <https://vercel.com/new>
   - Sign in with GitHub and select the `sumry-app/SUMRY` repository

2. **Build settings** (Vercel usually auto-detects these from `vercel.json`)
   - Framework Preset: **Vite**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Environment variables** — add both, for Production, Preview *and*
   Development:

   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | your Supabase project URL, e.g. `https://<project-ref>.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | your Supabase anon/public key |

   Find both under **Supabase → Project Settings → API**.

   > **The `VITE_` prefix is mandatory.** Vite only exposes variables that start
   > with `VITE_` to client code. Names like `SUPABASE_URL` or
   > `NEXT_PUBLIC_SUPABASE_ANON_KEY` are silently ignored by this project.

   The anon key is designed to be public and is safe in a frontend bundle —
   Row Level Security policies, not key secrecy, are what protect the data.
   Never add the `service_role` key to a frontend project.

4. **Deploy** and wait ~1–2 minutes.

### Auto-deploy

- Every push to `main` deploys to production
- Pull requests get their own preview deployment
- Any previous deployment can be promoted/rolled back from the dashboard

---

## Database setup

The Vercel project only serves the frontend. The database is managed separately
in Supabase. Against a fresh Supabase project, run these in the SQL Editor in
order:

1. `supabase-schema.sql` — tables, indexes, triggers, initial policies
2. `supabase/migrations/002_rls_hardening_and_storage.sql` — RLS fixes and the
   private `evidence` storage bucket

Then optionally run `supabase/tests/rls_verification.sql` to confirm the access
policies behave correctly. It rolls back and leaves no data behind.

---

## Troubleshooting

**Build fails with "Provisioning integrations failed"**
A stale Vercel↔Supabase marketplace integration. Remove it under
**Settings → Integrations** (or the **Storage** tab). The app connects to
Supabase directly through the two `VITE_` variables and does not need it.

**Site loads blank, console shows `Cannot access 'X' before initialization`**
A chunk-splitting problem. `vite.config.js` deliberately keeps
`build.rollupOptions.output.manualChunks` minimal — splitting a library away
from its transitive dependencies (this previously happened with `recharts` and
its `d3-*` packages) creates a circular chunk-initialization order that crashes
at load. Don't reintroduce fine-grained manual chunks without testing a
production build.

**Environment variable changes appear to have no effect**
Vite inlines `VITE_*` values at build time, so a rebuild is required. Redeploy
with **"Use existing Build Cache" unchecked**.

---

## Local development

```bash
npm install

# .env in the project root
# VITE_SUPABASE_URL=https://<project-ref>.supabase.co
# VITE_SUPABASE_ANON_KEY=<your-anon-key>

npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve the built output locally
```

`.env` is gitignored — never commit real keys.

---

## Alternative hosts

Any static host works, since the build output is just `dist/`. Each needs an
SPA rewrite (all routes → `/index.html`); `vercel.json` already does this for
Vercel.

- **Netlify** — build `npm run build`, publish `dist`, add an SPA redirect rule
- **Cloudflare Pages** — build `npm run build`, output `dist`
- **GitHub Pages** — set `base: '/SUMRY/'` in `vite.config.js`, then
  `npm run build && gh-pages -d dist`

Remember to set both `VITE_` variables in whichever host you use.

---

## Still to do

- **Connect the UI to Supabase** — replace the `localStorage` persistence in
  `App.jsx` (`usePersistentStore`) and the local `sumry_users_v1` login scheme
  with the existing `authAPI`/`studentsAPI`/`goalsAPI`/`progressAPI` service
  layer and real Supabase Auth sessions. Until this is done, the Supabase
  backend is provisioned but unused.
- **AI goal generation** — `goalsAPI.generateAI()` currently throws. It needs to
  be reimplemented as a Supabase Edge Function calling the OpenAI API. The old
  server-side implementation is recoverable from git history at
  `server/src/services/openai.service.js` (commit `77a51aa`).

---

**Built with:** React + Vite + Tailwind CSS + Supabase
