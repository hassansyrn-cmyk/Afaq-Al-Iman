import type { HadithRepository } from './HadithRepository';
import type { HadithRecord } from '../../types';
import { load, save } from '../../services/storage';

const HISTORY_KEY = 'hadith:daily-history'; // [{id, date}]
const TODAY_CACHE_KEY = 'hadith:daily-today';

interface DailyHistoryEntry {
  id: string;
  date: string; // YYYY-MM-DD
}

interface TodayCache {
  date: string;
  hadithId: string;
  isFullLibrary: boolean;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * يختار "حديث اليوم" مرة واحدة في اليوم من كامل المكتبة المتاحة فعلياً
 * (عبر HadithRepository الذي يعرف إن كانت المكتبة كاملة أم مجموعة اختبار)،
 * ويمنع تكرار نفس الحديث خلال آخر 30 يوماً، ويعيد دورة الاختيار عند
 * استهلاك المكتبة بالكامل.
 */
export class DailyHadithService {
  constructor(private readonly repo: HadithRepository) {}

  private getHistory(): DailyHistoryEntry[] {
    return load<DailyHistoryEntry[]>(HISTORY_KEY, []);
  }

  private pushHistory(entry: DailyHistoryEntry): void {
    const history = this.getHistory();
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const trimmed = history.filter((h) => new Date(h.date).getTime() >= cutoff);
    trimmed.push(entry);
    save(HISTORY_KEY, trimmed);
  }

  private recentlyUsedIds(): Set<string> {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return new Set(
      this.getHistory()
        .filter((h) => new Date(h.date).getTime() >= cutoff)
        .map((h) => h.id),
    );
  }

  /** يُرجع {hadith, isFullLibrary} — isFullLibrary يحدد صحة عبارة "من كامل الصحيحين" في الواجهة. */
  async getTodayHadith(): Promise<{ hadith: HadithRecord | null; isFullLibrary: boolean }> {
    const cached = load<TodayCache | null>(TODAY_CACHE_KEY, null);
    if (cached && cached.date === todayStr()) {
      const hadith = await this.repo.getById(cached.hadithId);
      return { hadith, isFullLibrary: cached.isFullLibrary };
    }

    const provider = await this.repo.getActiveProviderForRandom();
    const exclude = this.recentlyUsedIds();
    const hadith = await provider.getRandom(exclude);

    if (hadith) {
      save<TodayCache>(TODAY_CACHE_KEY, {
        date: todayStr(),
        hadithId: hadith.id,
        isFullLibrary: provider.isFullLibrary,
      });
      this.pushHistory({ id: hadith.id, date: todayStr() });
    }

    return { hadith, isFullLibrary: provider.isFullLibrary };
  }
}
