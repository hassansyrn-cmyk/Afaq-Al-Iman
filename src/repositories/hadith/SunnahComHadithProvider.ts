import type {
  HadithProvider,
  HadithSearchQuery,
  HadithSearchResult,
  ProviderAvailability,
} from './HadithProvider';
import type { HadithRecord } from '../../types';

/**
 * مزوّد مكتبة الصحيحين الكاملة عبر Sunnah.com.
 *
 * Sunnah.com API يتطلب مفتاحاً سرياً. لا يجوز تضمين هذا المفتاح داخل الـ APK
 * (يمكن استخراجه بسهولة من أي تطبيق أندرويد)، لذلك هذا المزوّد لا يستدعي
 * Sunnah.com مباشرة من الهاتف، بل يستدعي نقطة نهاية Backend خاصة بنا
 * (Cloudflare Worker / Vercel Function / إلخ) تحتفظ بالمفتاح كـ GitHub Secret /
 * متغيّر بيئة على الخادم، وتُمرّر الطلب إلى Sunnah.com نيابة عن التطبيق.
 *
 * حالياً `backendBaseUrl` غير مُعرَّف (لا يوجد Backend منشور بعد)، لذلك
 * `checkAvailability()` تُرجع 'missing-credentials' بصدق، ولا يوجد أي محاولة
 * لتزييف نجاح الاتصال أو اختراع بيانات.
 */
export class SunnahComHadithProvider implements HadithProvider {
  readonly id = 'sunnah.com';
  readonly isFullLibrary = true;

  constructor(private readonly backendBaseUrl: string | null = null) {}

  async checkAvailability(): Promise<ProviderAvailability> {
    if (!this.backendBaseUrl) {
      return {
        status: 'missing-credentials',
        reason:
          'لم يتم نشر Backend وسيط يحمل مفتاح Sunnah.com بعد. راجع README قسم "مكتبة الأحاديث".',
      };
    }
    try {
      const res = await fetch(`${this.backendBaseUrl}/health`, {
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) return { status: 'offline' };
      return { status: 'ready' };
    } catch {
      return { status: 'offline' };
    }
  }

  private assertConfigured() {
    if (!this.backendBaseUrl) {
      throw new Error(
        'SunnahComHadithProvider غير مُهيّأ: لا يوجد backendBaseUrl. لا يمكن جلب بيانات حقيقية.',
      );
    }
  }

  async search(query: HadithSearchQuery): Promise<HadithSearchResult> {
    this.assertConfigured();
    const params = new URLSearchParams();
    if (query.text) params.set('q', query.text);
    if (query.number) params.set('number', query.number);
    if (query.bookName) params.set('book', query.bookName);
    if (query.chapterName) params.set('chapter', query.chapterName);
    if (query.collection) params.set('collection', query.collection);
    params.set('page', String(query.page ?? 1));
    params.set('pageSize', String(query.pageSize ?? 20));

    const res = await fetch(`${this.backendBaseUrl}/hadith/search?${params}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`فشل البحث: ${res.status}`);
    return (await res.json()) as HadithSearchResult;
  }

  async getById(id: string): Promise<HadithRecord | null> {
    this.assertConfigured();
    const res = await fetch(`${this.backendBaseUrl}/hadith/${encodeURIComponent(id)}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`فشل الجلب: ${res.status}`);
    return (await res.json()) as HadithRecord;
  }

  async getLibrarySize(): Promise<number> {
    this.assertConfigured();
    const res = await fetch(`${this.backendBaseUrl}/hadith/count`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`فشل جلب عدد الأحاديث: ${res.status}`);
    const data = (await res.json()) as { count: number };
    return data.count;
  }

  async getRandom(excludeIds: Set<string>): Promise<HadithRecord | null> {
    this.assertConfigured();
    const res = await fetch(`${this.backendBaseUrl}/hadith/random`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ excludeIds: Array.from(excludeIds) }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`فشل الاختيار العشوائي: ${res.status}`);
    return (await res.json()) as HadithRecord;
  }
}
