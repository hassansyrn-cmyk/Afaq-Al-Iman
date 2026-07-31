import { Preferences } from '@capacitor/preferences';

/**
 * Thin wrapper around Capacitor Preferences (persists to native SharedPreferences on
 * Android, and falls back gracefully in the browser during `vite dev`).
 * All values are stored as JSON strings so callers can pass any serializable value.
 */
export async function getPref<T = string>(key: string): Promise<T | null> {
  try {
    const { value } = await Preferences.get({ key });
    if (value === null || value === undefined) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  } catch {
    return null;
  }
}

export async function setPref(key: string, value: unknown): Promise<void> {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  try {
    await Preferences.set({ key, value: serialized });
  } catch {
    // ignore in unsupported environments
  }
}

export async function removePref(key: string): Promise<void> {
  try {
    await Preferences.remove({ key });
  } catch {
    // ignore
  }
}
