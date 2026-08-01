import { getPref, setPref } from '../utils/storage';

/**
 * The Quran text here is the standard, widely-used "quran-json" dataset (Tanzil-based
 * Uthmani text, with the Sahih International-style English rendering bundled per verse)
 * shipped inside the app under /quran/*.json and /quran/en/*.json. Because these files are
 * bundled with the app itself (not fetched from a remote server), reading and the khatma
 * plan work fully offline from first launch — nothing here is edited, reworded, or
 * AI-generated. The source and its license are noted in Settings → About.
 */

export interface SurahMeta {
  number: number;
  name: string; // Arabic name
  englishName: string; // transliteration
  englishNameTranslation: string; // English chapter meaning, when available
  numberOfAyahs: number;
  revelationType: string; // 'meccan' | 'medinan'
}

export interface Ayah {
  number: number; // global-ish id, we use numberInSurah as the stable key here
  numberInSurah: number;
  text: string;
  translation?: string;
}

export interface SurahContent {
  meta: SurahMeta;
  ayahs: Ayah[];
}

interface RawIndexEntry {
  id: number; name: string; transliteration: string; type: string; total_verses: number;
}

interface RawChapter {
  id: number; name: string; transliteration: string; translation?: string; type: string;
  total_verses: number;
  verses: { id: number; text: string; translation?: string }[];
}

let indexCache: SurahMeta[] | null = null;

export async function getSurahList(): Promise<SurahMeta[]> {
  if (indexCache) return indexCache;
  const res = await fetch('/quran/index.json');
  const raw: RawIndexEntry[] = await res.json();
  indexCache = raw.map((s) => ({
    number: s.id,
    name: s.name,
    englishName: s.transliteration,
    englishNameTranslation: s.transliteration,
    numberOfAyahs: s.total_verses,
    revelationType: s.type
  }));
  return indexCache;
}

const surahCache = new Map<number, SurahContent>();

export async function getSurah(number: number): Promise<SurahContent> {
  if (surahCache.has(number)) return surahCache.get(number)!;

  const [arRes, enRes] = await Promise.all([
    fetch(`/quran/${number}.json`),
    fetch(`/quran/en/${number}.json`)
  ]);
  const ar: RawChapter = await arRes.json();
  const en: RawChapter | null = enRes.ok ? await enRes.json() : null;

  const meta: SurahMeta = {
    number: ar.id,
    name: ar.name,
    englishName: ar.transliteration,
    englishNameTranslation: en?.translation ?? ar.transliteration,
    numberOfAyahs: ar.total_verses,
    revelationType: ar.type
  };

  const ayahs: Ayah[] = ar.verses.map((v, idx) => ({
    number: v.id,
    numberInSurah: v.id,
    text: v.text,
    translation: en?.verses?.[idx]?.translation
  }));

  const content: SurahContent = { meta, ayahs };
  surahCache.set(number, content);
  return content;
}

export async function searchQuran(query: string): Promise<{ surah: SurahMeta; ayah: Ayah }[]> {
  const q = query.trim();
  if (!q) return [];
  const list = await getSurahList();
  const results: { surah: SurahMeta; ayah: Ayah }[] = [];
  for (const s of list) {
    const content = await getSurah(s.number);
    for (const a of content.ayahs) {
      if (a.text.includes(q)) results.push({ surah: s, ayah: a });
      if (results.length >= 50) return results;
    }
  }
  return results;
}

// --- Last read / bookmarks (locally stored) ---

export interface ReadingPosition { surah: number; ayah: number; timestamp: number }

export async function saveLastRead(pos: ReadingPosition) {
  await setPref('afaq.quran.lastRead', pos);
}
export async function getLastRead(): Promise<ReadingPosition | null> {
  return getPref<ReadingPosition>('afaq.quran.lastRead');
}

export async function getBookmarks(): Promise<ReadingPosition[]> {
  return (await getPref<ReadingPosition[]>('afaq.quran.bookmarks')) ?? [];
}
export async function toggleBookmark(pos: ReadingPosition) {
  const list = await getBookmarks();
  const idx = list.findIndex((b) => b.surah === pos.surah && b.ayah === pos.ayah);
  if (idx >= 0) list.splice(idx, 1);
  else list.push(pos);
  await setPref('afaq.quran.bookmarks', list);
  return list;
}
