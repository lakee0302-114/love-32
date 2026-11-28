// Real-Time Cloud Auto-Update Engine for Love32 Ultra
export const CURRENT_APP_VERSION = '1.0.6';
export const CURRENT_BUILD_NUMBER = 106;

let updateCheckInterval = null;

export async function checkForAppUpdate(onUpdateAvailable) {
  try {
    const res = await fetch(`/version.json?_t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
    });
    if (!res.ok) return false;
    const data = await res.json();
    
    if (data.version && data.version !== CURRENT_APP_VERSION) {
      if (typeof onUpdateAvailable === 'function') {
        onUpdateAvailable(data);
      }
      return data;
    }
    return false;
  } catch (err) {
    console.debug('[AutoUpdater] Check failed (offline or network error):', err);
    return false;
  }
}

export function startAutoUpdateWatcher(onUpdateAvailable, intervalMs = 60000) {
  // Check immediately on load
  checkForAppUpdate(onUpdateAvailable);

  // Check periodically
  if (updateCheckInterval) clearInterval(updateCheckInterval);
  updateCheckInterval = setInterval(() => {
    checkForAppUpdate(onUpdateAvailable);
  }, intervalMs);

  // Also check whenever user returns to the app
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      checkForAppUpdate(onUpdateAvailable);
    }
  };
  window.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    if (updateCheckInterval) clearInterval(updateCheckInterval);
    window.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}

export async function applyUpdateNow() {
  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
  } catch (e) {
    console.debug('Failed to clear cache storage', e);
  }
  // Hard reload to latest deployment
  window.location.reload(true);
}
