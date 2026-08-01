import type { HadithProvider, HadithSearchQuery, HadithSearchResult } from './HadithProvider';
import type { HadithRecord } from '../../types';
import { load, save } from '../../services/storage';

const FAVORITES_KEY = 'hadith:favorites';
const LAST_READ_KEY = 'hadith:last-read';
const PROVIDER_PICK_TTL_MS = 60_000;

export interface HadithLibraryStatus {
  isFullLibrary: boolean;
  providerId: string;
  size: number;
}

/**
 * واجهة موحّدة تستخدمها الشاشات: تُجرَّب المزوّدات بالترتيب المُعطى (الأفضل أولاً)،
 * وأول واحد يُبلغ عن جاهزيته فعلياً (checkAvailability -> 'ready') هو من يُستخدم.
 * آخر مزوّد في القائمة يجب أن يكون دائماً محلياً وجاهزاً بلا إنترنت (LocalHadithCache)
 * ليكون شبكة أمان نهائية. الحالة الفعلية (isFullLibrary/providerId) تُعرض دائماً للواجهة
 * حتى لا تُقدَّم مجموعة اختبار على أنها المكتبة الكاملة.
 */
export class HadithRepository {
  private pickedProvider: HadithProvider | null = null;
  private pickedAt = 0;

  constructor(private readonly providers: HadithProvider[]) {
    if (providers.length === 0) throw new Error('HadithRepository يحتاج مزوّداً واحداً على الأقل');
  }

  private async pickActiveProvider(): Promise<HadithProvider> {
    const now = Date.now();
    if (this.pickedProvider && now - this.pickedAt < PROVIDER_PICK_TTL_MS) {
      return this.pickedProvider;
    }

    for (const provider of this.providers) {
      try {
        const availability = await provider.checkAvailability();
        if (availability.status === 'ready') {
          this.pickedProvider = provider;
          this.pickedAt = now;
          return provider;
        }
      } catch {
        // جرّب المزوّد التالي
      }
    }

    // شبكة الأمان: آخر مزوّد بالقائمة (يُفترض أنه محلي دائماً جاهز)
    const fallback = this.providers[this.providers.length - 1];
    this.pickedProvider = fallback;
    this.pickedAt = now;
    return fallback;
  }

  async getStatus(): Promise<HadithLibraryStatus> {
    const active = await this.pickActiveProvider();
    const size = await active.getLibrarySize();
    return { isFullLibrary: active.isFullLibrary, providerId: active.id, size };
  }

  async search(query: HadithSearchQuery): Promise<HadithSearchResult> {
    const active = await this.pickActiveProvider();
    return active.search(query);
  }

  async getById(id: string): Promise<HadithRecord | null> {
    const active = await this.pickActiveProvider();
    return active.getById(id);
  }

  async getActiveProviderForRandom(): Promise<HadithProvider> {
    return this.pickActiveProvider();
  }

  // ---- المفضلة (محلية دائماً، بغض النظر عن المزوّد) ----

  getFavorites(): string[] {
    return load<string[]>(FAVORITES_KEY, []);
  }

  isFavorite(id: string): boolean {
    return this.getFavorites().includes(id);
  }

  toggleFavorite(id: string): string[] {
    const current = this.getFavorites();
    const next = current.includes(id)
      ? current.filter((f) => f !== id)
      : [...current, id];
    save(FAVORITES_KEY, next);
    return next;
  }

  // ---- سجل آخر قراءة ----

  getLastRead(): string | null {
    return load<string | null>(LAST_READ_KEY, null);
  }

  setLastRead(id: string): void {
    save(LAST_READ_KEY, id);
  }
}
