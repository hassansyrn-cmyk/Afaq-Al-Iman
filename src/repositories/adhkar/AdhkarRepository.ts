import { load, save } from '../../services/storage';

const KEY = 'adhkar:counters';

interface StoredCounters {
  date: string; // YYYY-MM-DD — تُصفَّر كل العدادات تلقائياً عند تغيّر اليوم
  counts: Record<string, number>;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function readState(): StoredCounters {
  const stored = load<StoredCounters | null>(KEY, null);
  if (!stored || stored.date !== todayStr()) {
    // يوم جديد — إعادة تصفير تلقائية لكل العدادات
    const fresh: StoredCounters = { date: todayStr(), counts: {} };
    save(KEY, fresh);
    return fresh;
  }
  return stored;
}

export class AdhkarRepository {
  getCount(itemId: string): number {
    return readState().counts[itemId] ?? 0;
  }

  getAllCounts(): Record<string, number> {
    return readState().counts;
  }

  increment(itemId: string): number {
    const state = readState();
    const next = (state.counts[itemId] ?? 0) + 1;
    state.counts[itemId] = next;
    save(KEY, state);
    return next;
  }

  resetItem(itemId: string): void {
    const state = readState();
    delete state.counts[itemId];
    save(KEY, state);
  }

  resetCategory(itemIds: string[]): void {
    const state = readState();
    for (const id of itemIds) delete state.counts[id];
    save(KEY, state);
  }
}
