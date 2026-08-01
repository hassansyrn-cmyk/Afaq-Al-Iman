import type { TafseerRecord } from '../../types';
import { load, save } from '../../services/storage';

const TAFSEER_ID_MUYASSAR = 1; // التفسير الميسر
const CACHE_KEY = 'tafsir:cache'; // { [sura:ayah:tafseerId]: TafseerRecord }
const REQUEST_TIMEOUT_MS = 8000;

type TafsirCache = Record<string, TafseerRecord>;

function cacheKey(sura: number, ayah: number, tafseerId: number): string {
  return `${sura}:${ayah}:${tafseerId}`;
}

export type TafsirFetchResult =
  | { status: 'ok'; record: TafseerRecord; fromCache: boolean }
  | { status: 'offline-cached'; record: TafseerRecord }
  | { status: 'error'; message: string };

/**
 * يجلب "التفسير الميسر" من Quran Tafseer API:
 * https://api.quran-tafseer.com/tafseer/1/{sura}/{ayah}
 *
 * - عرض اسم المصدر بوضوح (record.sourceName).
 * - لا يعدّل نص التفسير المُستلم.
 * - لا يولّد أي نص بديل بالذكاء الاصطناعي عند الفشل — إما نص المصدر، أو رسالة خطأ صريحة.
 * - Cache محلي بمفتاح sura+ayah+tafseerId، يُستخدم عند انقطاع الإنترنت.
 */
export class TafsirRepository {
  private getCache(): TafsirCache {
    return load<TafsirCache>(CACHE_KEY, {});
  }

  private setCacheEntry(record: TafseerRecord): void {
    const cache = this.getCache();
    cache[cacheKey(record.suraNumber, record.ayahNumber, record.tafseerId)] = record;
    save(CACHE_KEY, cache);
  }

  getCached(sura: number, ayah: number, tafseerId = TAFSEER_ID_MUYASSAR): TafseerRecord | null {
    return this.getCache()[cacheKey(sura, ayah, tafseerId)] ?? null;
  }

  async fetchTafseer(
    sura: number,
    ayah: number,
    { forceRefresh = false, tafseerId = TAFSEER_ID_MUYASSAR }: { forceRefresh?: boolean; tafseerId?: number } = {},
  ): Promise<TafsirFetchResult> {
    if (!forceRefresh) {
      const cached = this.getCached(sura, ayah, tafseerId);
      if (cached) return { status: 'ok', record: cached, fromCache: true };
    }

    try {
      const res = await fetch(`https://api.quran-tafseer.com/tafseer/${tafseerId}/${sura}/${ayah}`, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { text?: string; tafseer_id?: number; tafseer_name?: string };
      if (!data.text) throw new Error('استجابة فارغة من مصدر التفسير');

      const record: TafseerRecord = {
        suraNumber: sura,
        ayahNumber: ayah,
        tafseerId,
        text: data.text,
        sourceName: data.tafseer_name ?? 'التفسير الميسر',
        fetchedAt: new Date().toISOString(),
      };
      this.setCacheEntry(record);
      return { status: 'ok', record, fromCache: false };
    } catch (err) {
      const cached = this.getCached(sura, ayah, tafseerId);
      if (cached) return { status: 'offline-cached', record: cached };
      const message =
        err instanceof DOMException && err.name === 'TimeoutError'
          ? 'انتهت مهلة الاتصال بمصدر التفسير.'
          : 'تعذّر الوصول إلى مصدر التفسير. تحقق من اتصال الإنترنت.';
      return { status: 'error', message };
    }
  }
}

/**
 * سبب النزول منفصل تماماً عن التفسير، ولا يُعرض إلا من مصدر موثّق فعلياً.
 * لا يوجد حالياً مصدر أسباب نزول مربوط بالتطبيق، لذلك تُعاد دائماً هذه
 * الرسالة الصريحة بدل اختلاق نص.
 */
export function getAsbabAlNuzul(_sura: number, _ayah: number): string {
  return 'لا تتوفر حالياً معلومات موثقة لسبب نزول هذه الآية.';
}
