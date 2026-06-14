import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  WORKOUTS: 'fittrack_workouts',
  PROFILE: 'fittrack_profile',
  SETTINGS: 'fittrack_settings',
  OFFLINE_QUEUE: 'fittrack_offline_queue',
  CACHE_TIMESTAMP: 'fittrack_cache_ts',
} as const;

// Generic typed get/set helpers

async function get<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

async function set<T>(key: string, value: T): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

async function remove(key: string): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

// ─── Domain-specific helpers ─────────────────────────────────────────────────

export const storageService = {
  KEYS,

  getWorkouts: () => get(KEYS.WORKOUTS),
  setWorkouts: (data: unknown) => set(KEYS.WORKOUTS, data),

  getProfile: () => get(KEYS.PROFILE),
  setProfile: (data: unknown) => set(KEYS.PROFILE, data),

  getSettings: () => get(KEYS.SETTINGS),
  setSettings: (data: unknown) => set(KEYS.SETTINGS, data),

  // Offline queue — operations done without internet that need syncing later
  getOfflineQueue: () => get<unknown[]>(KEYS.OFFLINE_QUEUE),
  addToOfflineQueue: async (operation: unknown) => {
    const queue = (await get<unknown[]>(KEYS.OFFLINE_QUEUE)) ?? [];
    return set(KEYS.OFFLINE_QUEUE, [...queue, operation]);
  },
  clearOfflineQueue: () => remove(KEYS.OFFLINE_QUEUE),

  setCacheTimestamp: () => set(KEYS.CACHE_TIMESTAMP, new Date().toISOString()),
  getCacheTimestamp: () => get<string>(KEYS.CACHE_TIMESTAMP),

  clearAll: async () => {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  },
};
