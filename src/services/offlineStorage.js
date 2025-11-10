import localforage from 'localforage';

/**
 * OfflineStorage - Feature #5: Offline-First Data Logging
 *
 * Robust offline storage using IndexedDB (with localStorage/WebSQL fallback)
 * Enables paras to collect data without internet connectivity
 * Auto-syncs when connection is restored
 */

// Configure localforage instances
const dataStore = localforage.createInstance({
  name: 'SUMRY',
  storeName: 'data',
  description: 'Main application data'
});

const syncQueue = localforage.createInstance({
  name: 'SUMRY',
  storeName: 'syncQueue',
  description: 'Pending sync operations'
});

const offlineQueue = localforage.createInstance({
  name: 'SUMRY',
  storeName: 'offlineQueue',
  description: 'Offline data entries'
});

// Storage keys
const KEYS = {
  STUDENTS: 'students',
  GOALS: 'goals',
  LOGS: 'logs',
  USERS: 'users',
  ASSIGNMENTS: 'assignments',
  REMINDERS: 'reminders',
  AUDIT_LOG: 'auditLog',
  INTEGRITY_ALERTS: 'integrityAlerts',
  PARA_ACCOUNTS: 'paraAccounts',
  LAST_SYNC: 'lastSync',
  IS_ONLINE: 'isOnline'
};

/**
 * Save data to offline storage
 */
export async function saveData(key, value) {
  try {
    await dataStore.setItem(key, {
      data: value,
      timestamp: Date.now(),
      version: 1
    });
    return { success: true };
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Load data from offline storage
 */
export async function loadData(key, defaultValue = null) {
  try {
    const stored = await dataStore.getItem(key);
    if (!stored) return defaultValue;
    return stored.data;
  } catch (error) {
    console.error(`Error loading ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Save entire app state
 */
export async function saveAppState(state) {
  try {
    const promises = Object.entries(state).map(([key, value]) =>
      saveData(key, value)
    );
    await Promise.all(promises);
    await saveData(KEYS.LAST_SYNC, Date.now());
    return { success: true };
  } catch (error) {
    console.error('Error saving app state:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Load entire app state
 */
export async function loadAppState() {
  try {
    const [
      students,
      goals,
      logs,
      users,
      assignments,
      reminders,
      auditLog,
      integrityAlerts,
      paraAccounts,
      lastSync
    ] = await Promise.all([
      loadData(KEYS.STUDENTS, []),
      loadData(KEYS.GOALS, []),
      loadData(KEYS.LOGS, []),
      loadData(KEYS.USERS, []),
      loadData(KEYS.ASSIGNMENTS, []),
      loadData(KEYS.REMINDERS, []),
      loadData(KEYS.AUDIT_LOG, []),
      loadData(KEYS.INTEGRITY_ALERTS, []),
      loadData(KEYS.PARA_ACCOUNTS, []),
      loadData(KEYS.LAST_SYNC, null)
    ]);

    return {
      students,
      goals,
      logs,
      users,
      assignments,
      reminders,
      auditLog,
      integrityAlerts,
      paraAccounts,
      lastSync
    };
  } catch (error) {
    console.error('Error loading app state:', error);
    return null;
  }
}

/**
 * Add item to sync queue (for offline operations)
 */
export async function addToSyncQueue(operation) {
  try {
    const queue = await syncQueue.getItem('queue') || [];
    queue.push({
      ...operation,
      id: `sync_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      attempts: 0,
      status: 'pending'
    });
    await syncQueue.setItem('queue', queue);
    return { success: true };
  } catch (error) {
    console.error('Error adding to sync queue:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get pending sync operations
 */
export async function getSyncQueue() {
  try {
    const queue = await syncQueue.getItem('queue') || [];
    return queue.filter(op => op.status === 'pending');
  } catch (error) {
    console.error('Error getting sync queue:', error);
    return [];
  }
}

/**
 * Mark sync operation as completed
 */
export async function markSyncComplete(operationId) {
  try {
    const queue = await syncQueue.getItem('queue') || [];
    const updated = queue.map(op =>
      op.id === operationId
        ? { ...op, status: 'completed', completedAt: Date.now() }
        : op
    );
    await syncQueue.setItem('queue', updated);
    return { success: true };
  } catch (error) {
    console.error('Error marking sync complete:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Clear completed sync operations
 */
export async function clearCompletedSync() {
  try {
    const queue = await syncQueue.getItem('queue') || [];
    const pending = queue.filter(op => op.status !== 'completed');
    await syncQueue.setItem('queue', pending);
    return { success: true, cleared: queue.length - pending.length };
  } catch (error) {
    console.error('Error clearing sync queue:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Save offline data entry (for when completely offline)
 */
export async function saveOfflineEntry(entry) {
  try {
    const queue = await offlineQueue.getItem('entries') || [];
    queue.push({
      ...entry,
      offlineId: `offline_${Date.now()}_${Math.random()}`,
      savedAt: Date.now()
    });
    await offlineQueue.setItem('entries', queue);
    return { success: true, offlineId: queue[queue.length - 1].offlineId };
  } catch (error) {
    console.error('Error saving offline entry:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all offline entries
 */
export async function getOfflineEntries() {
  try {
    return await offlineQueue.getItem('entries') || [];
  } catch (error) {
    console.error('Error getting offline entries:', error);
    return [];
  }
}

/**
 * Clear offline entries after successful sync
 */
export async function clearOfflineEntries() {
  try {
    await offlineQueue.setItem('entries', []);
    return { success: true };
  } catch (error) {
    console.error('Error clearing offline entries:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get storage statistics
 */
export async function getStorageStats() {
  try {
    const keys = await dataStore.keys();
    let totalSize = 0;
    const items = {};

    for (const key of keys) {
      const item = await dataStore.getItem(key);
      const size = JSON.stringify(item).length;
      totalSize += size;
      items[key] = {
        size,
        timestamp: item?.timestamp,
        recordCount: Array.isArray(item?.data) ? item.data.length : 1
      };
    }

    const syncQueueSize = await syncQueue.getItem('queue');
    const offlineQueueSize = await offlineQueue.getItem('entries');

    return {
      totalSize,
      totalSizeKB: Math.round(totalSize / 1024),
      items,
      pendingSync: syncQueueSize?.length || 0,
      offlineEntries: offlineQueueSize?.length || 0
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return null;
  }
}

/**
 * Clear all storage (use with caution!)
 */
export async function clearAllStorage() {
  try {
    await dataStore.clear();
    await syncQueue.clear();
    await offlineQueue.clear();
    return { success: true };
  } catch (error) {
    console.error('Error clearing storage:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Export all data as JSON
 */
export async function exportAllData() {
  try {
    const state = await loadAppState();
    const syncQueueData = await syncQueue.getItem('queue');
    const offlineData = await offlineQueue.getItem('entries');
    const stats = await getStorageStats();

    return {
      exportDate: new Date().toISOString(),
      version: '1.0',
      data: state,
      syncQueue: syncQueueData,
      offlineQueue: offlineData,
      stats
    };
  } catch (error) {
    console.error('Error exporting data:', error);
    return null;
  }
}

/**
 * Import data from JSON
 */
export async function importData(importedData) {
  try {
    if (!importedData || !importedData.data) {
      throw new Error('Invalid import data format');
    }

    await saveAppState(importedData.data);

    if (importedData.syncQueue) {
      await syncQueue.setItem('queue', importedData.syncQueue);
    }

    if (importedData.offlineQueue) {
      await offlineQueue.setItem('entries', importedData.offlineQueue);
    }

    return { success: true };
  } catch (error) {
    console.error('Error importing data:', error);
    return { success: false, error: error.message };
  }
}

// Export all storage keys for use in app
export { KEYS };

// Default export
export default {
  saveData,
  loadData,
  saveAppState,
  loadAppState,
  addToSyncQueue,
  getSyncQueue,
  markSyncComplete,
  clearCompletedSync,
  saveOfflineEntry,
  getOfflineEntries,
  clearOfflineEntries,
  getStorageStats,
  clearAllStorage,
  exportAllData,
  importData,
  KEYS
};
