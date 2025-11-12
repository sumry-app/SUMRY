# SUMRY Deployment Guide

## Deploy to Vercel (Recommended)

### One-Click Deploy

1. **Visit Vercel and Import Your Repository:**
   - Go to https://vercel.com/new
   - Sign in with your GitHub account
   - Click "Import Project"
   - Select the `sumry-app/SUMRY` repository

2. **Configure the Project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - No environment variables needed for basic functionality

3. **Deploy:**
   - Click "Deploy"
   - Wait ~1-2 minutes for the build to complete
   - Your app will be live at `https://your-project-name.vercel.app`

### Auto-Deploy from GitHub

Once connected to Vercel:
- Every push to your `main` branch automatically deploys
- Pull requests create preview deployments
- Rollback to any previous deployment anytime

## Features Available Without Backend

SUMRY works fully without a backend server because it uses:
- **localStorage** for data persistence (browser-based)
- **Client-side authentication** (demo mode)
- **Export/Import** for data backup

### To Enable Full AI Features (Optional)

1. Add environment variable in Vercel dashboard:
   - `OPENAI_API_KEY` = your OpenAI API key
2. Deploy the backend to Railway or Render
3. Add `VITE_API_URL` environment variable pointing to your backend

## Alternative Hosting Options

### Netlify
```bash
npm run build
# Drag and drop the 'dist' folder to Netlify
```

### GitHub Pages
```bash
# Update vite.config.js base to '/SUMRY/'
npm run build
gh-pages -d dist
```

### Cloudflare Pages
1. Connect your GitHub repository
2. Build command: `npm run build`
3. Output directory: `dist`

## Local Development

```bash
# Frontend
npm run dev

# Backend (optional)
cd server
npm run dev
```

## Production URLs

- **Frontend:** https://sumry.vercel.app (will be your actual URL)
- **Backend:** (Optional) Deploy separately to Railway/Render

---

**Built with:** React + Vite + Tailwind CSS + shadcn/ui
