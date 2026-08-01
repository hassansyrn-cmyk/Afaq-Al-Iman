import type { HadithRecord } from '../../types';

export interface HadithSearchQuery {
  text?: string; // بحث بالنص العربي أو الإنجليزي
  number?: string;
  bookName?: string;
  chapterName?: string;
  collection?: 'bukhari' | 'muslim';
  page?: number;
  pageSize?: number;
}

export interface HadithSearchResult {
  items: HadithRecord[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
}

export type ProviderAvailability =
  | { status: 'ready' }
  | { status: 'missing-credentials'; reason: string }
  | { status: 'offline' };

/**
 * أي مصدر بيانات لأحاديث الصحيحين (Sunnah.com API، Offline Dump، إلخ)
 * يجب أن يطبّق هذا الواجهة. هذا يسمح باستبدال المصدر لاحقاً دون تعديل
 * بقية التطبيق (HadithRepository / DailyHadithService / واجهات العرض).
 */
export interface HadithProvider {
  readonly id: string;
  readonly isFullLibrary: boolean; // false لمجموعة الاختبار، true لمصدر كامل موثق

  checkAvailability(): Promise<ProviderAvailability>;
  search(query: HadithSearchQuery): Promise<HadithSearchResult>;
  getById(id: string): Promise<HadithRecord | null>;
  /** يُستخدم لاختيار حديث عشوائي — يجب أن يعكس حجم المكتبة الفعلي المتاح. */
  getLibrarySize(): Promise<number>;
  getRandom(excludeIds: Set<string>): Promise<HadithRecord | null>;
}
