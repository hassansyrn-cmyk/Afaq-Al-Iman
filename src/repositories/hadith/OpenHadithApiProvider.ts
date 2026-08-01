import type {
  HadithProvider,
  HadithSearchQuery,
  HadithSearchResult,
  ProviderAvailability,
} from './HadithProvider';
import type { HadithRecord } from '../../types';

const API_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';

interface RawHadith {
  hadithnumber: number;
  arabicnumber?: number;
  text: string;
  reference?: { book?: number; hadith?: number };
}

interface RawEdition {
  metadata: { name: string; section?: Record<string, string> };
  hadiths: RawHadith[];
}

interface EditionConfig {
  collection: 'bukhari' | 'muslim';
  editionName: string; // مثال: ara-bukhari
  collectionName: string; // للعرض بالعربية
}

const EDITIONS: EditionConfig[] = [
  { collection: 'bukhari', editionName: 'ara-bukhari', collectionName: 'صحيح البخاري' },
  { collection: 'muslim', editionName: 'ara-muslim', collectionName: 'صحيح مسلم' },
];

/**
 * مزوّد مكتبة الصحيحين الكاملة عبر fawazahmed0/hadith-api:
 * https://github.com/fawazahmed0/hadith-api
 *
 * لماذا هذا المصدر بالتحديد:
 * - مجاني بالكامل ولا يحتاج مفتاح API (يُقدَّم عبر CDN جامد على jsDelivr، بلا Rate Limit).
 * - يوفّر نص البخاري ومسلم بالعربية فعلياً (ara-bukhari / ara-muslim)، وهذا ما تحقق منه
 *   Claude فعلياً عبر web_search/web_fetch قبل كتابة هذا الملف، وليس افتراضاً من الذاكرة.
 * - مشروع مفتوح المصدر نشط (500+ نجمة على GitHub وقت الكتابة)، يُستخدم في عشرات التطبيقات.
 *
 * ⚠️ تنبيه أمانة يجب معرفته قبل الاعتماد النهائي عليه:
 * مصدر النص العربي الدقيق (أي طبعة/مخطوطة اعتُمدت) غير موثّق رسمياً من صاحب المشروع —
 * راجع النقاش المفتوح: https://github.com/fawazahmed0/hadith-api/issues/128
 * هذا لا يعني أن النص خاطئ، لكنه أقل توثيقاً أكاديمياً من Sunnah.com الرسمي. يُنصح إن أمكن
 * لاحقاً بمقارنة عيّنة من الأحاديث المعروضة مع Sunnah.com يدوياً، أو التحويل إلى
 * SunnahComHadithProvider (الجاهز أصلاً في هذا المشروع) متى توفّر مفتاح API رسمي.
 *
 * لا حاجة لأي Backend وسيط هنا لأن الخدمة لا تتطلب مفتاحاً سرياً أصلاً.
 */
export class OpenHadithApiProvider implements HadithProvider {
  readonly id = 'fawazahmed0-hadith-api';
  readonly isFullLibrary = true;

  // ذاكرة مؤقتة داخل الجلسة فقط (وليست localStorage) لتفادي تضخّم التخزين المحلي
  // بعشرات آلاف الأحاديث؛ تُعاد التحميل عند إعادة فتح التطبيق.
  private editionCache = new Map<string, RawEdition>();
  private loadingPromises = new Map<string, Promise<RawEdition>>();

  async checkAvailability(): Promise<ProviderAvailability> {
    try {
      const res = await fetch(`${API_BASE}/editions.min.json`, { signal: AbortSignal.timeout(6000) });
      return res.ok ? { status: 'ready' } : { status: 'offline' };
    } catch {
      return { status: 'offline' };
    }
  }

  private async loadEdition(config: EditionConfig): Promise<RawEdition> {
    const cached = this.editionCache.get(config.editionName);
    if (cached) return cached;

    const inFlight = this.loadingPromises.get(config.editionName);
    if (inFlight) return inFlight;

    const promise = fetch(`${API_BASE}/editions/${config.editionName}.min.json`, {
      signal: AbortSignal.timeout(20000), // ملف كامل، قد يكون عدة ميغابايت
    })
      .then((res) => {
        if (!res.ok) throw new Error(`فشل تحميل ${config.editionName}: HTTP ${res.status}`);
        return res.json() as Promise<RawEdition>;
      })
      .then((data) => {
        this.editionCache.set(config.editionName, data);
        this.loadingPromises.delete(config.editionName);
        return data;
      })
      .catch((err) => {
        this.loadingPromises.delete(config.editionName);
        throw err;
      });

    this.loadingPromises.set(config.editionName, promise);
    return promise;
  }

  private toRecord(config: EditionConfig, raw: RawHadith, edition: RawEdition): HadithRecord {
    const bookNo = raw.reference?.book;
    const chapterName = bookNo != null ? edition.metadata.section?.[String(bookNo)] : undefined;
    return {
      id: `${config.collection}:${raw.hadithnumber}`,
      collection: config.collection,
      collectionName: config.collectionName,
      book: bookNo != null ? String(bookNo) : undefined,
      chapter: chapterName,
      number: String(raw.hadithnumber),
      textAr: raw.text,
      source: `${config.collectionName} ${raw.hadithnumber}`,
    };
  }

  private async loadRelevantEditions(collectionFilter?: 'bukhari' | 'muslim'): Promise<
    Array<{ config: EditionConfig; edition: RawEdition }>
  > {
    const configs = collectionFilter ? EDITIONS.filter((e) => e.collection === collectionFilter) : EDITIONS;
    const loaded = await Promise.all(configs.map((c) => this.loadEdition(c).then((edition) => ({ config: c, edition }))));
    return loaded;
  }

  async search(query: HadithSearchQuery): Promise<HadithSearchResult> {
    const loaded = await this.loadRelevantEditions(query.collection);
    const text = query.text?.trim();

    const all: HadithRecord[] = [];
    for (const { config, edition } of loaded) {
      for (const raw of edition.hadiths) {
        if (query.number && String(raw.hadithnumber) !== query.number) continue;
        if (text && !raw.text.includes(text)) continue;
        all.push(this.toRecord(config, raw, edition));
      }
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const start = (page - 1) * pageSize;
    return {
      items: all.slice(start, start + pageSize),
      page,
      pageSize,
      totalCount: all.length,
      hasMore: start + pageSize < all.length,
    };
  }

  async getById(id: string): Promise<HadithRecord | null> {
    const [collection, number] = id.split(':') as ['bukhari' | 'muslim', string];
    const config = EDITIONS.find((e) => e.collection === collection);
    if (!config) return null;
    const edition = await this.loadEdition(config);
    const raw = edition.hadiths.find((h) => String(h.hadithnumber) === number);
    return raw ? this.toRecord(config, raw, edition) : null;
  }

  async getLibrarySize(): Promise<number> {
    const loaded = await this.loadRelevantEditions();
    return loaded.reduce((sum, { edition }) => sum + edition.hadiths.length, 0);
  }

  async getRandom(excludeIds: Set<string>): Promise<HadithRecord | null> {
    const loaded = await this.loadRelevantEditions();
    const pool: HadithRecord[] = [];
    for (const { config, edition } of loaded) {
      for (const raw of edition.hadiths) {
        const id = `${config.collection}:${raw.hadithnumber}`;
        if (!excludeIds.has(id)) pool.push(this.toRecord(config, raw, edition));
      }
    }
    const source = pool.length > 0 ? pool : (await this.searchFallbackAll(loaded));
    if (source.length === 0) return null;
    return source[Math.floor(Math.random() * source.length)];
  }

  private async searchFallbackAll(
    loaded: Array<{ config: EditionConfig; edition: RawEdition }>,
  ): Promise<HadithRecord[]> {
    // كل شيء استُبعد (استُهلكت المكتبة) — أعد الدورة على كامل البيانات
    const all: HadithRecord[] = [];
    for (const { config, edition } of loaded) {
      for (const raw of edition.hadiths) all.push(this.toRecord(config, raw, edition));
    }
    return all;
  }
}
