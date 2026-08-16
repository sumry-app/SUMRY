# SUMRY Production Deployment Guide

Complete guide for deploying SUMRY IEP Management System to production.

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Setup](#environment-setup)
- [Build Configuration](#build-configuration)
- [Deployment Options](#deployment-options)
- [Database Setup](#database-setup)
- [Security Considerations](#security-considerations)
- [Performance Optimization](#performance-optimization)
- [Monitoring](#monitoring)

## Pre-Deployment Checklist

### Code Quality

- [x] All tests passing (36+ unit tests)
- [x] No console errors in production build
- [x] Linting passes without errors
- [ ] Code reviewed by team
- [x] Security audit completed
- [x] Accessibility audit completed (WCAG 2.1)

### Performance

- [x] Bundle size optimized (main bundle: 67KB gzipped)
- [x] Code splitting implemented
- [x] Images optimized
- [x] Lazy loading implemented
- [x] PWA configured
- [x] Service worker registered

### Security

- [x] Environment variables configured
- [x] HTTPS enabled (Vercel + Supabase default to HTTPS)
- [x] Row Level Security policies enabled on all Supabase tables
- [x] Input validation implemented
- [x] XSS protection enabled

## Environment Setup

SUMRY has no self-hosted backend. There is exactly one set of environment variables, consumed by the Vite frontend build.

### Frontend Environment Variables

Set these in your Vercel project settings (or a local `.env.production` for a manual build) — both **must** be prefixed `VITE_` for Vite to inline them into the build:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

No `JWT_SECRET`, database credentials, `OPENAI_API_KEY`, or `CORS_ORIGIN` are needed — there is no backend process for them to configure. The Supabase anon key is safe to ship in the frontend bundle; Row Level Security policies (not the key) are what restrict data access.

## Build Configuration

### Build the Application

```bash
# Install dependencies
npm ci

# Run tests
npm test

# Build frontend
npm run build
```

### Optimize Build

The production build is automatically optimized:

- ✅ Code minification with Terser
- ✅ Dead code elimination
- ✅ Tree shaking
- ✅ Asset optimization
- ✅ Gzip compression
- ✅ Source maps disabled
- ✅ Console.log removal

### Bundle Analysis

```bash
# Analyze bundle size
npm run build
ls -lh dist/assets

# Expected output:
# - vendor-react: ~167KB (52KB gzipped)
# - vendor-charts: ~346KB (91KB gzipped)
# - main app: ~67KB (16KB gzipped)
```

## Deployment Options

### Option 1: Vercel (Recommended — this is how SUMRY is actually deployed)

**Pros**: Zero config, auto-deploy on push to `main`, CDN, free SSL

```bash
# Push to main, Vercel builds automatically (npm run build -> dist/)
git push origin main

# Or deploy manually
npm i -g vercel
vercel --prod

# Environment variables (set in Vercel dashboard → Project Settings → Environment Variables)
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
```

There is no separate backend deploy step — Supabase is a hosted service, not something SUMRY provisions or deploys.

**Configuration** (`vercel.json`):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Option 2: Netlify

**Pros**: Easy setup, form handling, serverless functions

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Build command: npm run build
# Publish directory: dist
```

### Option 3: AWS S3 + CloudFront

**Pros**: Scalable, cost-effective, full control

```bash
# Build
npm run build

# Sync to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

### Option 4: Docker

**Pros**: Portable, consistent environments

```dockerfile
# Dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build image
docker build -t sumry:latest .

# Run container
docker run -p 80:80 sumry:latest
```

## Database Setup

### Supabase Setup

The database is a hosted Supabase Postgres instance — there is no server to provision. Apply the schema directly to your production Supabase project:

1. Open the **SQL Editor** in your production Supabase project.
2. Run `supabase-schema.sql` from this repo — creates all 16 tables and enables Row Level Security.
3. Run each file under `supabase/migrations/` in order (currently `002_rls_hardening_and_storage.sql`).
4. Double-check RLS policies are enabled on every table (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`) before going live — a table with RLS enabled and no matching policy denies all access, while a table *without* RLS enabled is fully open to anyone with the anon key.

Use a **separate Supabase project** for production vs. development so schema experiments never touch production data.

### Backup Strategy

Supabase Pro and higher plans include automatic daily backups and point-in-time recovery, configurable in **Project Settings → Database → Backups**. For manual backups:

```bash
# Requires the Supabase CLI, linked to your project
supabase db dump -f backup-$(date +%Y%m%d).sql
```

## Security Considerations

### SSL/TLS

- ✅ Force HTTPS in production (Vercel and Supabase both enforce HTTPS by default)
- ✅ Certificates are provisioned automatically by Vercel

### Headers

There is no Express server to add Helmet.js middleware to. On Vercel, add security headers via `vercel.json` instead:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

### Secrets Management

- ❌ Never commit secrets to git
- ✅ Use environment variables
- ✅ Rotate secrets regularly
- ✅ Use secret management service (AWS Secrets Manager, Vault)

### Data Protection

- ✅ Encrypt sensitive data at rest
- ✅ Use HTTPS for data in transit
- ✅ Implement proper authentication
- ✅ Regular security audits
- ✅ GDPR/FERPA compliance for student data

## Performance Optimization

### Current Performance

- ✅ Lighthouse Score: 90+ (target)
- ✅ First Contentful Paint: < 1.5s
- ✅ Time to Interactive: < 3.5s
- ✅ Bundle size optimized

### CDN Configuration

Enable CDN for static assets:

```javascript
// vite.config.js
export default {
  build: {
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
}
```

### Caching Strategy

```nginx
# nginx.conf
location /assets/ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

location / {
  expires -1;
  add_header Cache-Control "no-store, no-cache, must-revalidate";
}
```

## Monitoring

### Application Monitoring

Recommended tools:

- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Google Analytics**: Usage analytics
- **Uptime Robot**: Availability monitoring

### Performance Monitoring

```javascript
// Example: Web Vitals tracking
import {getCLS, getFID, getFCP, getLCP, getTTFB} from 'web-vitals';

function sendToAnalytics({name, delta, id}) {
  // Send to analytics endpoint
  fetch('/analytics', {
    method: 'POST',
    body: JSON.stringify({metric: name, value: delta, id})
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Health Checks

There is no backend process to expose a `/health` endpoint from. Monitor availability at two levels instead:

- **Frontend**: use an uptime monitor (e.g. Uptime Robot) against the deployed Vercel URL.
- **Database**: use Supabase's built-in project health/status dashboard, or run a lightweight query (e.g. `select 1`) from a scheduled check against `VITE_SUPABASE_URL`'s REST endpoint.

## Post-Deployment

### Verification Checklist

- [ ] App loads without errors
- [ ] All pages accessible
- [ ] Forms submit correctly
- [ ] Data persists properly
- [ ] Mobile responsive
- [ ] PWA installs correctly
- [ ] SSL certificate valid
- [ ] Health check endpoint responds
- [ ] Monitoring alerts configured

### Rollback Plan

```bash
# Vercel
vercel rollback

# Docker
docker tag sumry:previous sumry:latest
docker push sumry:latest

# Manual
git revert HEAD
npm run build
./deploy.sh
```

## Support

For deployment issues:

1. Check Vercel build/deploy logs
2. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly in Vercel
3. Check the Supabase dashboard for database/auth errors and RLS policy issues
4. Review browser console for client-side errors

## Resources

- [Vercel Deployment Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Supabase Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Web.dev Performance](https://web.dev/performance/)
