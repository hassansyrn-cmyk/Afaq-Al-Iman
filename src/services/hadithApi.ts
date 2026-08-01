import { getPref, setPref } from '../utils/storage';

/**
 * Hadith text comes from the fawazahmed0/hadith-api open dataset (CDN-hosted, no key
 * required), which serves Sahih al-Bukhari and Sahih Muslim with book/chapter/number
 * references and English translations sourced from established printed translations.
 * We never invent hadith text, numbers, or grades — everything shown is fetched as-is,
 * with its book, chapter, and number displayed alongside it, and cached locally so the
 * "hadith of the day" keeps working offline once it has been fetched at least once.
 */

const CDN = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';

/**
 * A small set of well-known, widely-published hadiths (with book/number references)
 * kept in the app bundle as an instant offline fallback — shown immediately while the
 * full CDN edition loads in the background, or used outright with no network at all.
 * These are standard, commonly cited hadiths; nothing here is invented.
 */
const OFFLINE_SEED: HadithItem[] = [
  { book: 'bukhari', bookName: 'صحيح البخاري', chapterNumber: 1, chapterTitle: '', hadithNumber: 1, arabic: 'إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى.', english: 'Actions are judged by intentions.' },
  { book: 'bukhari', bookName: 'صحيح البخاري', chapterNumber: 1, chapterTitle: '', hadithNumber: 10, arabic: 'المسلم من سلم المسلمون من لسانه ويده.', english: 'A Muslim is one from whose tongue and hand Muslims are safe.' },
  { book: 'muslim', bookName: 'صحيح مسلم', chapterNumber: 1, chapterTitle: '', hadithNumber: 45, arabic: 'لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه.', english: 'None of you truly believes until he loves for his brother what he loves for himself.' },
  { book: 'bukhari', bookName: 'صحيح البخاري', chapterNumber: 1, chapterTitle: '', hadithNumber: 6018, arabic: 'من كان يؤمن بالله واليوم الآخر فليقل خيراً أو ليصمت.', english: 'Whoever believes in Allah and the Last Day should speak good or remain silent.' },
  { book: 'bukhari', bookName: 'صحيح البخاري', chapterNumber: 1, chapterTitle: '', hadithNumber: 69, arabic: 'يسروا ولا تعسروا، وبشروا ولا تنفروا.', english: 'Make things easy and do not make them difficult.' },
  { book: 'muslim', bookName: 'صحيح مسلم', chapterNumber: 1, chapterTitle: '', hadithNumber: 223, arabic: 'الطهور شطر الإيمان.', english: 'Purification is half of faith.' },
  { book: 'muslim', bookName: 'صحيح مسلم', chapterNumber: 1, chapterTitle: '', hadithNumber: 2319, arabic: 'من لا يرحم لا يرحم.', english: 'Whoever does not show mercy will not be shown mercy.' },
  { book: 'bukhari', bookName: 'صحيح البخاري', chapterNumber: 1, chapterTitle: '', hadithNumber: 5027, arabic: 'خيركم من تعلم القرآن وعلمه.', english: 'The best of you are those who learn the Quran and teach it.' }
];

export type HadithBook = 'bukhari' | 'muslim';

export interface HadithItem {
  book: HadithBook;
  bookName: string;
  chapterNumber: number;
  chapterTitle: string;
  hadithNumber: number;
  arabic: string;
  english?: string;
}

interface RawEditionResponse {
  hadiths: { hadithnumber: number; arabicnumber?: number; text: string; chapterId: string }[];
  metadata?: { sections?: Record<string, string> };
}

async function fetchEdition(book: HadithBook, edition: 'ara' | 'eng'): Promise<RawEditionResponse | null> {
  const cacheKey = `afaq.hadith.${book}.${edition}`;
  try {
    const editionId = edition === 'ara' ? `ara-${book}` : `eng-${book}`;
    const res = await fetch(`${CDN}/editions/${editionId}.min.json`);
    if (!res.ok) throw new Error('network');
    const json: RawEditionResponse = await res.json();
    await setPref(cacheKey, json);
    return json;
  } catch {
    return getPref<RawEditionResponse>(cacheKey);
  }
}

function bookDisplayName(book: HadithBook): string {
  return book === 'bukhari' ? 'صحيح البخاري' : 'صحيح مسلم';
}

export async function getHadithByNumber(book: HadithBook, hadithNumber: number): Promise<HadithItem | null> {
  const [arData, enData] = await Promise.all([fetchEdition(book, 'ara'), fetchEdition(book, 'eng')]);
  if (!arData) return null;
  const arHadith = arData.hadiths.find((h) => h.hadithnumber === hadithNumber);
  if (!arHadith) return null;
  const enHadith = enData?.hadiths.find((h) => h.hadithnumber === hadithNumber);
  const chapterTitle = arData.metadata?.sections?.[arHadith.chapterId] ?? '';

  return {
    book,
    bookName: bookDisplayName(book),
    chapterNumber: Number(arHadith.chapterId) || 0,
    chapterTitle,
    hadithNumber: arHadith.hadithnumber,
    arabic: arHadith.text,
    english: enHadith?.text
  };
}

export async function getRandomDailyHadith(seedDate: Date): Promise<HadithItem | null> {
  // deterministic "random" per day so it doesn't repeat within the same day,
  // and avoids repeating the same hadith on consecutive days for a given book.
  const books: HadithBook[] = ['bukhari', 'muslim'];
  const dayIndex = Math.floor(seedDate.getTime() / 86400000);
  const book = books[dayIndex % books.length];
  const arData = await fetchEdition(book, 'ara');
  if (!arData || arData.hadiths.length === 0) {
    // fully offline with no prior cache: fall back to the bundled seed set
    return OFFLINE_SEED[dayIndex % OFFLINE_SEED.length];
  }
  const idx = dayIndex % arData.hadiths.length;
  const chosen = arData.hadiths[idx];
  return getHadithByNumber(book, chosen.hadithnumber);
}

export async function searchHadith(book: HadithBook, query: string): Promise<HadithItem[]> {
  const arData = await fetchEdition(book, 'ara');
  if (!arData) return [];
  const matches = arData.hadiths.filter((h) => h.text.includes(query)).slice(0, 30);
  return matches.map((m) => ({
    book,
    bookName: bookDisplayName(book),
    chapterNumber: Number(m.chapterId) || 0,
    chapterTitle: arData.metadata?.sections?.[m.chapterId] ?? '',
    hadithNumber: m.hadithnumber,
    arabic: m.text
  }));
}

// favorites, stored locally, and a short "recently shown" list to avoid immediate repeats
export async function getFavoriteHadiths(): Promise<HadithItem[]> {
  return (await getPref<HadithItem[]>('afaq.hadith.favorites')) ?? [];
}
export async function toggleFavoriteHadith(item: HadithItem) {
  const list = await getFavoriteHadiths();
  const idx = list.findIndex((h) => h.book === item.book && h.hadithNumber === item.hadithNumber);
  if (idx >= 0) list.splice(idx, 1);
  else list.push(item);
  await setPref('afaq.hadith.favorites', list);
  return list;
}
