# 🚀 SUMRY Quick Setup Guide

This guide will get you up and running with SUMRY in minutes.

## Prerequisites Check

Before starting, ensure you have:

- ✅ Node.js 18+ installed (`node --version`)
- ✅ npm installed (`npm --version`)
- ✅ A [Supabase](https://supabase.com) account and project (free tier is fine)

SUMRY has no self-hosted backend — Supabase provides the Postgres database, authentication, and storage. There is no local database, no `server/` directory, and no separate backend process to run.

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project (or use an existing one).
2. In the project dashboard, go to **Settings → API** and copy:
   - **Project URL**
   - **anon / public key**

### Step 3: Set Up the Database Schema

1. Open the **SQL Editor** in your Supabase project.
2. Run the contents of `supabase-schema.sql` from this repo. This creates the 16 core tables (`user_profiles`, `students`, `goals`, `progress_logs`, etc.) and enables Row Level Security on all of them.
3. Run any files under `supabase/migrations/` in order (currently `002_rls_hardening_and_storage.sql`), which fills in RLS policies the initial schema left incomplete and sets up evidence file storage.

### Step 4: Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**These two `VITE_`-prefixed variables are the only environment variables the app needs.** The `VITE_` prefix is required — Vite only inlines environment variables into the frontend build if they start with `VITE_`.

You can find both values in your Supabase project under **Settings → API**.

### Step 5: Start the Application

```bash
npm run dev
```

You should see:
```
VITE ready in 234 ms
➜  Local:   http://localhost:5173/
```

That's it — one process, no backend to start separately.

### Step 6: Open the App

Visit **http://localhost:5173** in your browser!

---

## 🎉 First Steps

1. **Register an account** - Create a teacher/admin account
2. **Add a student** - Try adding a test student
3. **Log progress** - Record some progress data
4. **View analytics** - Check out the dashboard

> **Important — where your data actually goes.** The UI is not yet wired to
> Supabase. `App.jsx` still stores everything in browser `localStorage` and
> handles login locally, so the account and student you create above will
> **not** appear in your Supabase tables, and will only exist in that one
> browser. The Supabase schema, policies and service layer are all in place;
> connecting the UI to them is the main outstanding task.

> **Note**: AI-powered goal generation is not yet functional. The feature exists in the UI, but the backend call (`goalsAPI.generateAI()`) currently throws an error directing you to set up a Supabase Edge Function — the old OpenAI integration was part of the Express server that has been removed and hasn't been rebuilt yet.

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables" error

**Cause**: `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` is missing or misnamed in `.env`.

**Solution**:
1. Confirm `.env` exists in the project root (not inside `src/`).
2. Confirm both variable names start with `VITE_` exactly as shown above.
3. Restart `npm run dev` after editing `.env` — Vite only reads env files at startup.

### Supabase auth/login errors

**Error**: `Invalid login credentials`, `Email not confirmed`, or similar

**Solution**:
1. Check that email confirmation isn't blocking sign-in — in Supabase, go to **Authentication → Providers → Email** and disable "Confirm email" for local development if you want to skip it.
2. Verify the project URL/anon key in `.env` match the Supabase project where you created the account.

### Database errors ("permission denied for table ...")

**Cause**: Row Level Security is blocking the query — usually a missing policy or an issue applying the migration.

**Solution**:
1. Confirm you ran both `supabase-schema.sql` and everything in `supabase/migrations/`, in order.
2. Check the Supabase dashboard **Authentication** tab to confirm you're signed in as a user with a matching `user_profiles` row.

### Port Already in Use

**Error**: `Port 5173 is in use`

**Solution**: Vite will automatically try the next available port, or you can free it:
```bash
lsof -ti:5173 | xargs kill -9
```

### Module Not Found

**Error**: `Cannot find module 'xyz'`

**Solution**:
```bash
# Reinstall dependencies
npm install
```

---

## ✅ Verify Installation

```bash
# Check the frontend builds cleanly
npm run build

# Run the test suite
npm test
```

To verify the database, open the Supabase dashboard's **Table Editor** and confirm the tables from `supabase-schema.sql` exist, or run a query in the SQL Editor:
```sql
select count(*) from user_profiles;
```

---

## 🔧 Development Commands

```bash
npm run dev          # Start dev server
npm test             # Run tests
npm run build        # Production build
npm run lint         # Lint code
```

There is no backend `npm run dev`, `npm run migrate`, or `server/` directory to manage — schema changes are applied directly to your Supabase project via the SQL Editor or the Supabase CLI.

---

## 📚 Next Steps

- Read the [README.md](./README.md) for complete documentation
- Review the Supabase service layer in `src/services/` (`supabaseAuth.js`, `supabaseStudents.js`, `supabaseGoals.js`, `supabaseProgress.js`)
- Explore the database schema in `supabase-schema.sql` and `supabase/migrations/`
- Set up testing with `npm test`

---

## 💬 Need Help?

- 📖 Documentation: [README.md](./README.md)
- 🐛 Report issues: [GitHub Issues](https://github.com/yourusername/SUMRY/issues)
- ✉️ Email: support@sumry.app

---

**You're all set! Enjoy using SUMRY! 🎓**
