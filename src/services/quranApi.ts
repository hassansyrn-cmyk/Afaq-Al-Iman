import { getPref, setPref } from '../utils/storage';

/**
 * All Quran text comes from the AlQuran Cloud API (api.alquran.cloud), a widely used
 * public API serving the standard Uthmani/Hafs text plus vetted translations. Nothing
 * here is generated or edited — we fetch, cache locally (for offline reading after the
 * first successful fetch), and display the text and its source as-is.
 */

const BASE = 'https://api.alquran.cloud/v1';
const ARABIC_EDITION = 'quran-uthmani';
const ENGLISH_EDITION = 'en.sahih'; // Sahih International

export interface SurahMeta {
  number: number;
  name: string; // Arabic name
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number; // global ayah number
  numberInSurah: number;
  text: string;
  translation?: string;
  juz: number;
  hizbQuarter: number;
  page: number;
}

export interface SurahContent {
  meta: SurahMeta;
  ayahs: Ayah[];
}

const SURAH_LIST_CACHE_KEY = 'afaq.quran.surahList';
const surahCacheKey = (n: number) => `afaq.quran.surah.${n}`;

export async function getSurahList(): Promise<SurahMeta[]> {
  const cached = await getPref<SurahMeta[]>(SURAH_LIST_CACHE_KEY);
  try {
    const res = await fetch(`${BASE}/surah`);
    if (!res.ok) throw new Error('network');
    const json = await res.json();
    const list: SurahMeta[] = json.data;
    await setPref(SURAH_LIST_CACHE_KEY, list);
    return list;
  } catch {
    if (cached) return cached;
    throw new Error('offline-no-cache');
  }
}

export async function getSurah(number: number): Promise<SurahContent> {
  const key = surahCacheKey(number);
  try {
    const [arRes, enRes] = await Promise.all([
      fetch(`${BASE}/surah/${number}/${ARABIC_EDITION}`),
      fetch(`${BASE}/surah/${number}/${ENGLISH_EDITION}`)
    ]);
    if (!arRes.ok) throw new Error('network');
    const arJson = await arRes.json();
    const enJson = enRes.ok ? await enRes.json() : null;

    const meta: SurahMeta = {
      number: arJson.data.number,
      name: arJson.data.name,
      englishName: arJson.data.englishName,
      englishNameTranslation: arJson.data.englishNameTranslation,
      numberOfAyahs: arJson.data.numberOfAyahs,
      revelationType: arJson.data.revelationType
    };

    const ayahs: Ayah[] = arJson.data.ayahs.map((a: any, idx: number) => ({
      number: a.number,
      numberInSurah: a.numberInSurah,
      text: a.text,
      translation: enJson?.data?.ayahs?.[idx]?.text,
      juz: a.juz,
      hizbQuarter: a.hizbQuarter,
      page: a.page
    }));

    const content: SurahContent = { meta, ayahs };
    await setPref(key, content);
    return content;
  } catch {
    const cached = await getPref<SurahContent>(key);
    if (cached) return cached;
    throw new Error('offline-no-cache');
  }
}

export async function searchQuran(query: string): Promise<{ surah: SurahMeta; ayah: Ayah }[]> {
  try {
    const res = await fetch(`${BASE}/search/${encodeURIComponent(query)}/all/${ARABIC_EDITION}`);
    if (!res.ok) throw new Error('network');
    const json = await res.json();
    if (json.code !== 200) return [];
    return json.data.matches.map((m: any) => ({
      surah: {
        number: m.surah.number,
        name: m.surah.name,
        englishName: m.surah.englishName,
        englishNameTranslation: m.surah.englishNameTranslation,
        numberOfAyahs: m.surah.numberOfAyahs,
        revelationType: m.surah.revelationType
      },
      ayah: {
        number: m.number,
        numberInSurah: m.numberInSurah,
        text: m.text,
        juz: m.juz ?? 0,
        hizbQuarter: m.hizbQuarter ?? 0,
        page: m.page ?? 0
      }
    }));
  } catch {
    return [];
  }
}

// --- Last read / bookmarks / favorites (locally stored) ---

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
