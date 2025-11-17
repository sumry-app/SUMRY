# SUMRY Progressive Web App (PWA) Guide

SUMRY is a fully-featured Progressive Web App that can be installed on any device and works offline.

## Features

### ✅ Installable
- Can be installed on desktop and mobile devices
- Runs in standalone mode (fullscreen, no browser UI)
- Appears in app drawer/home screen

### ✅ Offline Support
- Works without internet connection
- Data cached locally
- Automatic sync when online

### ✅ Fast Performance
- Instant loading with service worker caching
- Optimized bundle size (67KB main, 16KB gzipped)
- Code splitting for faster initial load

### ✅ Native-like Experience
- Smooth animations
- App-like navigation
- System notifications (optional)

## Installation

### Desktop

1. Visit SUMRY in Chrome, Edge, or Safari
2. Click the install icon in the address bar (or "Install App" button)
3. Confirm installation
4. App will open in standalone window

### Mobile (iOS)

1. Open SUMRY in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"
4. Tap "Add"
5. App icon appears on home screen

### Mobile (Android)

1. Open SUMRY in Chrome
2. Tap "Add SUMRY to Home screen" banner (or menu > "Install app")
3. Tap "Install"
4. App icon appears in app drawer

## Technical Details

### Manifest

```json
{
  "name": "SUMRY - IEP Management System",
  "short_name": "SUMRY",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6"
}
```

### Service Worker

**Caching Strategy**: Network-first with cache fallback

- Critical assets cached on install
- API responses cached on first request
- Stale-while-revalidate for optimal UX

### Storage

- **localStorage**: App settings and preferences
- **IndexedDB**: Large datasets (planned)
- **Service Worker Cache**: Static assets and API responses

### Offline Functionality

When offline, SUMRY can:

- ✅ View existing students and goals
- ✅ View progress logs
- ✅ View reports
- ⏳ Add new entries (synced when online)
- ⏳ Edit existing data (synced when online)

## Development

### Testing PWA Features

```bash
# Build for production
npm run build

# Serve with service worker
npm run preview

# Or use a local server
npx serve dist
```

### Service Worker Development

```javascript
// Register service worker (main.jsx)
if (import.meta.env.PROD) {
  registerServiceWorker();
}

// PWA helpers available
import {
  registerServiceWorker,
  setupInstallPrompt,
  showInstallPrompt,
  isStandalone,
  getPWASupport
} from './lib/pwaHelper.js';
```

### Custom Install Prompt

```javascript
import { setupInstallPrompt, showInstallPrompt } from './lib/pwaHelper.js';

// Listen for install availability
setupInstallPrompt((canInstall) => {
  if (canInstall) {
    // Show custom install button
    setShowInstallButton(true);
  }
});

// Trigger install
async function handleInstall() {
  const result = await showInstallPrompt();
  if (result.outcome === 'accepted') {
    console.log('App installed!');
  }
}
```

## PWA Best Practices

### ✅ Implemented

- Fast loading (< 3s on 3G)
- Works offline
- Installable
- Mobile responsive
- HTTPS only
- Proper meta tags
- Service worker registered
- Manifest configured

### 🔄 Planned

- Background sync
- Push notifications
- Periodic background sync
- Share target API

## Browser Support

| Feature | Chrome | Safari | Firefox | Edge |
|---------|--------|--------|---------|------|
| Install | ✅ | ✅ | 🔄 | ✅ |
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| Offline | ✅ | ✅ | ✅ | ✅ |
| Notifications | ✅ | ⚠️ | ✅ | ✅ |
| Background Sync | ✅ | ❌ | ❌ | ✅ |

✅ Supported | ⚠️ Partial | ❌ Not Supported | 🔄 Planned

## Performance

### Lighthouse Scores (Target)

- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+
- PWA: 100

### Bundle Size

- Main bundle: 67.83 KB (16.07 KB gzipped)
- React vendor: 167.64 KB (52.26 KB gzipped)
- Charts vendor: 346.37 KB (91.62 KB gzipped)
- Icons: 5.95 KB (2.48 KB gzipped)
- UI utilities: 22.02 KB (7.21 KB gzipped)

**Total**: ~610 KB (~170 KB gzipped)

### Optimization Techniques

- Code splitting by vendor
- Dynamic imports
- Tree shaking
- Minification
- Asset compression
- Service worker caching
- Resource hints

## Troubleshooting

### Service Worker Not Updating

```javascript
// Force update
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.update());
});

// Or unregister
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});
```

### Install Prompt Not Showing

- Only works on HTTPS
- User must engage with site first
- Only shows if not already installed
- Some browsers don't support install prompt

### Offline Not Working

1. Check service worker registered:
   ```javascript
   navigator.serviceWorker.getRegistrations()
   ```

2. Check cache:
   ```javascript
   caches.keys().then(console.log)
   ```

3. Check network tab in DevTools

## Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker Guide](https://developers.google.com/web/fundamentals/primers/service-workers)
- [Web App Manifest](https://web.dev/add-manifest/)
- [Workbox](https://developers.google.com/web/tools/workbox)
