import type { BookmarkEntry, LastRead, QuranReaderSettings } from '../../types';
import { load, save, debouncedSave } from '../../services/storage';

const BOOKMARKS_KEY = 'quran:bookmarks';
const LAST_READ_KEY = 'quran:last-read';
const READER_SETTINGS_KEY = 'quran:reader-settings';

const DEFAULT_SETTINGS: QuranReaderSettings = { fontSizePx: 24, navigationMode: 'vertical' };
export const MIN_FONT_SIZE = 16;
export const MAX_FONT_SIZE = 40;

const saveLastReadDebounced = debouncedSave<LastRead>(LAST_READ_KEY, 800);

export class QuranBookmarkRepository {
  getAll(): BookmarkEntry[] {
    return load<BookmarkEntry[]>(BOOKMARKS_KEY, []);
  }

  isBookmarked(sura: number, ayah: number): boolean {
    return this.getAll().some((b) => b.sura === sura && b.ayah === ayah);
  }

  toggle(entry: Omit<BookmarkEntry, 'id' | 'savedAt'>): BookmarkEntry[] {
    const id = `${entry.sura}:${entry.ayah}`;
    const current = this.getAll();
    const exists = current.some((b) => b.id === id);
    const next = exists
      ? current.filter((b) => b.id !== id) // منع التكرار: إن وُجدت، الضغط يزيلها بدل تكرارها
      : [...current, { ...entry, id, savedAt: new Date().toISOString() }];
    save(BOOKMARKS_KEY, next);
    return next;
  }

  remove(id: string): BookmarkEntry[] {
    const next = this.getAll().filter((b) => b.id !== id);
    save(BOOKMARKS_KEY, next);
    return next;
  }
}

export function getLastRead(): LastRead | null {
  return load<LastRead | null>(LAST_READ_KEY, null);
}

/** حفظ مُخفَّف — لا يكتب إلى التخزين عند كل حدث تمرير. */
export function saveLastReadThrottled(entry: LastRead): void {
  saveLastReadDebounced(entry);
}

export function saveLastReadImmediate(entry: LastRead): void {
  save(LAST_READ_KEY, entry);
}

export function getReaderSettings(): QuranReaderSettings {
  return load<QuranReaderSettings>(READER_SETTINGS_KEY, DEFAULT_SETTINGS);
}

export function saveReaderSettings(settings: QuranReaderSettings): void {
  save(READER_SETTINGS_KEY, settings);
}

export function resetReaderSettings(): QuranReaderSettings {
  save(READER_SETTINGS_KEY, DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}

export function clampFontSize(px: number): number {
  return Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, px));
}
