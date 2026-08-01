// أنواع مشتركة عبر التطبيق

export type Tab = 'home' | 'quran' | 'plan' | 'hadith' | 'qibla' | 'settings';

export interface Ayah {
  id: number;
  text: string;
  transliteration?: string;
}

export interface Chapter {
  id: number;
  name: string;
  transliteration: string;
  type?: 'meccan' | 'medinan';
  total_verses: number;
  verses: Ayah[];
}

export interface ChapterMeta {
  id: number;
  name: string;
  transliteration: string;
  type?: 'meccan' | 'medinan';
  total_verses: number;
}

export interface BookmarkEntry {
  id: string; // `${sura}:${ayah}` — يمنع التكرار
  sura: number;
  ayah: number;
  suraName: string;
  savedAt: string; // ISO date
  page?: number;
}

export interface LastRead {
  sura: number;
  ayah: number;
  suraName: string;
  scrollOffset?: number;
  updatedAt: string;
}

export interface TafseerRecord {
  suraNumber: number;
  ayahNumber: number;
  tafseerId: number;
  text: string;
  sourceName: string;
  fetchedAt: string;
}

export interface HadithRecord {
  id: string; // معرف فريد ثابت: `${collection}:${number}`
  collection: 'bukhari' | 'muslim' | 'test-set';
  collectionName: string;
  book?: string;
  chapter?: string;
  number: string;
  textAr: string;
  textEn?: string;
  source: string; // نص العزو الكامل، مثال: "صحيح البخاري 1"
}

export interface KhatmaDayRecord {
  date: string; // YYYY-MM-DD — يمنع أكثر من سجل لليوم نفسه
  pagesRead: number;
  startPage: number;
  endPage: number;
}

export interface KhatmaPlan {
  totalDays: number;
  startDate: string;
  endDateTarget: string;
  pagesPerDay: number;
  history: KhatmaDayRecord[];
  postponedDates: string[];
}

export interface NotificationPrefs {
  prayer: boolean;
  adhkarMorning: boolean;
  adhkarEvening: boolean;
  wird: boolean;
  wirdIncomplete: boolean;
  dailyHadith: boolean;
}

export type NotificationChannelId = 'prayer' | 'adhkar' | 'quran-reminders' | 'daily-hadith';

export interface QuranReaderSettings {
  fontSizePx: number;
  navigationMode: 'vertical' | 'horizontal';
}
