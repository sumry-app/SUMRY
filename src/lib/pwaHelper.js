/**
 * PWA Helper - Service Worker Registration and Install Prompt
 */

let deferredPrompt;
let swRegistration = null;

/**
 * Register service worker
 */
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      swRegistration = registration;
      console.log('PWA: Service Worker registered successfully');
      
      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000); // Check every hour
      
      // Listen for service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available, prompt user to refresh
            if (confirm('New version available! Reload to update?')) {
              window.location.reload();
            }
          }
        });
      });
      
      return registration;
    } catch (error) {
      console.error('PWA: Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
}

/**
 * Unregister service worker (for development/debugging)
 */
export async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.unregister();
      console.log('PWA: Service Worker unregistered');
    }
  }
}

/**
 * Check if app is running in standalone mode (installed PWA)
 */
export function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

/**
 * Setup install prompt
 */
export function setupInstallPrompt(callback) {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent default browser install prompt
    e.preventDefault();
    deferredPrompt = e;
    
    // Notify callback that install is available
    if (callback) {
      callback(true);
    }
  });
  
  window.addEventListener('appinstalled', () => {
    console.log('PWA: App installed successfully');
    deferredPrompt = null;
    
    if (callback) {
      callback(false);
    }
  });
}

/**
 * Show install prompt
 */
export async function showInstallPrompt() {
  if (!deferredPrompt) {
    return { outcome: 'not-available', platform: null };
  }
  
  // Show the install prompt
  deferredPrompt.prompt();
  
  // Wait for the user's response
  const choiceResult = await deferredPrompt.userChoice;
  
  console.log(`PWA: User ${choiceResult.outcome} the install prompt`);
  
  // Clear the deferred prompt
  deferredPrompt = null;
  
  return choiceResult;
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return 'not-supported';
  }
  
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }
  
  return Notification.permission;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications() {
  if (!swRegistration) {
    console.error('PWA: Service Worker not registered');
    return null;
  }
  
  try {
    const subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        // Replace with your VAPID public key
        'YOUR_VAPID_PUBLIC_KEY'
      )
    });
    
    console.log('PWA: Push subscription successful');
    return subscription;
  } catch (error) {
    console.error('PWA: Push subscription failed:', error);
    return null;
  }
}

/**
 * Check if browser supports PWA features
 */
export function getPWASupport() {
  return {
    serviceWorker: 'serviceWorker' in navigator,
    notification: 'Notification' in window,
    pushManager: 'PushManager' in window,
    sync: 'SyncManager' in window,
    standalone: isStandalone()
  };
}

/**
 * Get install status and platform
 */
export function getInstallInfo() {
  const isInstalled = isStandalone();
  const canInstall = !!deferredPrompt;
  
  // Detect platform
  const ua = navigator.userAgent;
  let platform = 'desktop';
  
  if (/android/i.test(ua)) {
    platform = 'android';
  } else if (/iPad|iPhone|iPod/.test(ua)) {
    platform = 'ios';
  }
  
  return {
    isInstalled,
    canInstall,
    platform,
    support: getPWASupport()
  };
}

/**
 * Request persistent storage (prevents data eviction)
 */
export async function requestPersistentStorage() {
  if (navigator.storage && navigator.storage.persist) {
    const isPersisted = await navigator.storage.persist();
    console.log(`PWA: Persistent storage ${isPersisted ? 'granted' : 'denied'}`);
    return isPersisted;
  }
  return false;
}

/**
 * Check storage quota
 */
export async function checkStorageQuota() {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    const percentUsed = (estimate.usage / estimate.quota) * 100;
    
    return {
      usage: estimate.usage,
      quota: estimate.quota,
      percentUsed: percentUsed.toFixed(2),
      usageInMB: (estimate.usage / (1024 * 1024)).toFixed(2),
      quotaInMB: (estimate.quota / (1024 * 1024)).toFixed(2)
    };
  }
  return null;
}

// Helper function for push notifications
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

/**
 * Show a local notification
 */
export async function showNotification(title, options = {}) {
  if (!swRegistration) {
    console.error('PWA: Service Worker not registered');
    return;
  }
  
  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    console.log('PWA: Notification permission denied');
    return;
  }
  
  const defaultOptions = {
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'sumry-notification'
  };
  
  await swRegistration.showNotification(title, {
    ...defaultOptions,
    ...options
  });
}
