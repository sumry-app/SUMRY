# SUMRY Deployment Guide

## Current state (read this first)

SUMRY deploys as a **static Vite/React site on Cloudflare Pages**. There is no
backend server to deploy — the old Node/Express `server/` directory has been
removed.

The UI is wired to Supabase. Since commit `d39c368`, `App.jsx` reads and writes
through `useSupabaseStore` (optimistic writes, rolled back on failure) and signs
in through Supabase Auth (`useSupabaseAuth`), so:

- Data lives in Postgres, scoped by Row Level Security — it syncs across
  devices and is backed up server-side.
- `src/lib/supabase.js` and the `supabase*.js` services are reachable from the
  app entry point.
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are required; without them
  the app renders a configuration screen instead of data. The deploy workflow
  reads them from repository secrets, so they must be set in GitHub *and* in the
  Pages project if you use the dashboard build.

---

## Deploy to Cloudflare Pages

Cloudflare Pages serves the app from the root of the domain, so
`VITE_BASE_PATH` stays at its `/` default. It also gives every pull request its
own preview URL, which is the capability GitHub Pages does not have.

### First-time setup

Either path works. The workflow is the recommended one because the build is
reproducible from the repository and identical to CI.

**Option A — GitHub Actions workflow (recommended)**

1. Create an API token at **Cloudflare dashboard → My Profile → API Tokens**,
   using the **"Edit Cloudflare Workers"** template or a custom token with the
   **Cloudflare Pages: Edit** permission.
2. Find the **Account ID** under **Workers & Pages → Account ID**.
3. Add four repository secrets (Settings → Secrets and variables → Actions):

   | Secret | Value |
   |--------|-------|
   | `CLOUDFLARE_API_TOKEN` | the token from step 1 |
   | `CLOUDFLARE_ACCOUNT_ID` | the account ID from step 2 |
   | `VITE_SUPABASE_URL` | your Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | your Supabase anon/public key |

4. Push to `main`. `.github/workflows/deploy-cloudflare.yml` runs the tests,
   builds with the two `VITE_` variables and `VITE_BASE_PATH=/`, and deploys
   `dist/` with `wrangler pages deploy`. The first run creates the `sumry`
   project if it does not exist.

**Option B — Cloudflare dashboard Git integration**

1. **Workers & Pages → Create → Pages → Connect to Git**, pick `sumry-app/SUMRY`.
2. Build command `npm run build`, output directory `dist`.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables
   for Production *and* Preview.
4. Every branch and pull request then gets its own preview URL automatically.

Do not run both. If the Git integration is connected, disable the workflow, or
you will get two deploys per push.

### Configuration in the repository

| File | Purpose |
|------|---------|
| `wrangler.toml` | Pages project name and `dist` as the build output |
| `public/_redirects` | Serves the app for every path instead of a host 404 |
| `public/_headers` | Immutable caching for fingerprinted assets, revalidation for `index.html`, `nosniff` and referrer policy |
| `.github/workflows/deploy-cloudflare.yml` | Test → build → deploy, with PR previews |

> **The `VITE_` prefix is mandatory.** Vite only exposes variables that start
> with `VITE_` to client code. Names like `SUPABASE_URL` are silently ignored by
> this project.

The anon key is designed to be public and is safe in a frontend bundle — Row
Level Security policies, not key secrecy, are what protect the data. Never add
the `service_role` key to a frontend project.

---

## Database setup

The Pages project only serves the frontend. The database is managed separately
in Supabase. Against a fresh Supabase project, run these in the SQL Editor in
order:

1. `supabase-schema.sql` — tables, indexes, triggers, initial policies
2. `supabase/migrations/002_rls_hardening_and_storage.sql` — RLS fixes and the
   private `evidence` storage bucket
3. `supabase/migrations/003_progress_measurement.sql` — how each goal is
   measured, and the raw value, setting, evidence and accommodation recorded
   with each observation

Then optionally run `supabase/tests/rls_verification.sql` to confirm the access
policies behave correctly. It rolls back and leaves no data behind.

---

## Troubleshooting

**The deployed site is blank and the console shows 404s for `/assets/...`**
The build was made for the wrong base path. Cloudflare Pages serves from the
domain root, so `VITE_BASE_PATH` must be `/` (or unset). `/SUMRY/` is the GitHub
Pages value and belongs only in `.github/workflows/deploy.yml`.

**Site loads blank, console shows `Cannot access 'X' before initialization`**
A chunk-splitting problem. `vite.config.js` deliberately keeps
`build.rollupOptions.output.manualChunks` minimal — splitting a library away
from its transitive dependencies (this previously happened with `recharts` and
its `d3-*` packages) creates a circular chunk-initialization order that crashes
at load. Don't reintroduce fine-grained manual chunks without testing a
production build.

**The app renders the "Almost configured" screen after deploying**
`VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` was missing at build time. The
screen lists which one. They are inlined by Vite, so the build must be redone
after adding them.

**Environment variable changes appear to have no effect**
Vite inlines `VITE_*` values at build time, so a rebuild is required, not just a
restart or a redeploy of the previous build.

**A Vercel check fails on pull requests**
Vercel is no longer the host and `vercel.json` has been removed. The remaining
failure is the Vercel GitHub app refusing a deployment because the commit author
is not a member of the Vercel team. A team admin should unlink the project under
Vercel → Project → Settings → Git, which removes the check.

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
SPA rewrite to `/index.html`, except GitHub Pages, which needs the subpath base
instead.

- **GitHub Pages** — `.github/workflows/deploy.yml` builds and publishes the
  site. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as repository
  secrets and set Pages to deploy from GitHub Actions. It builds with
  `VITE_BASE_PATH=/SUMRY/`, so asset URLs resolve under
  `https://<owner>.github.io/SUMRY/`. Copy `public/_headers` semantics yourself;
  Pages ignores it.
- **Netlify** — build `npm run build`, publish `dist`, add an SPA redirect rule
- **Vercel** — build `npm run build`, output `dist`, add a rewrite to
  `/index.html`. Recreate `vercel.json` if you move back.
- **Render / Firebase Hosting / S3 + CloudFront** — same shape: serve `dist/`,
  rewrite unknown paths to `/index.html`.

Remember to set both `VITE_` variables in whichever host you use.

---

## Still to do

- **AI goal generation** — `goalsAPI.generateAI()` currently returns a hardcoded
  template table behind a fake delay, so nothing in the app calls an AI service.
  It needs to be reimplemented as a Supabase Edge Function calling a model, with
  no key in the browser bundle.

---

**Built with:** React + Vite + Tailwind CSS + Supabase
