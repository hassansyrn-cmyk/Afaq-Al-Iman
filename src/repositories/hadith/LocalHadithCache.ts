import type {
  HadithProvider,
  HadithSearchQuery,
  HadithSearchResult,
  ProviderAvailability,
} from './HadithProvider';
import type { HadithRecord } from '../../types';
import { hadithTestSet } from '../../data/hadith-test-set';

/**
 * مزوّد محلي يعمل دون إنترنت، مبني على مجموعة الاختبار المرفقة مع التطبيق
 * (15 حديثاً — راجع src/data/hadith-test-set.ts). `isFullLibrary = false` دائماً،
 * حتى لا يظن أي كود آخر أن هذا هو الصحيحان كاملين.
 */
export class LocalHadithCache implements HadithProvider {
  readonly id = 'local-test-set';
  readonly isFullLibrary = false;

  private readonly all: HadithRecord[] = hadithTestSet;

  async checkAvailability(): Promise<ProviderAvailability> {
    return { status: 'ready' };
  }

  async search(query: HadithSearchQuery): Promise<HadithSearchResult> {
    const text = query.text?.trim().toLowerCase();
    const filtered = this.all.filter((h) => {
      if (text) {
        const haystack = `${h.textAr} ${h.textEn ?? ''} ${h.source}`.toLowerCase();
        if (!haystack.includes(text)) return false;
      }
      if (query.number && h.number !== query.number) return false;
      return true;
    });

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return {
      items,
      page,
      pageSize,
      totalCount: filtered.length,
      hasMore: start + pageSize < filtered.length,
    };
  }

  async getById(id: string): Promise<HadithRecord | null> {
    return this.all.find((h) => h.id === id) ?? null;
  }

  async getLibrarySize(): Promise<number> {
    return this.all.length;
  }

  async getRandom(excludeIds: Set<string>): Promise<HadithRecord | null> {
    const pool = this.all.filter((h) => !excludeIds.has(h.id));
    const source = pool.length > 0 ? pool : this.all; // إذا استُهلكت المجموعة كاملة أعد الدورة
    if (source.length === 0) return null;
    return source[Math.floor(Math.random() * source.length)];
  }
}
