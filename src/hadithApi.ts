import { hadiths as offlineSeed } from "./hadith";

/**
 * Full hadith text comes from the fawazahmed0/hadith-api open dataset (CDN-hosted, no
 * key required), which serves Sahih al-Bukhari and Sahih Muslim with book/chapter/number
 * references and an established English translation. Nothing is invented: every hadith
 * shown is fetched as-is, with its book and number displayed alongside it. The full
 * collections require a first-time fetch per book (then cached in localStorage for
 * offline reuse); the small bundled `hadith.ts` list is used only as an instant
 * fallback for "hadith of the day" when there is no network and nothing cached yet.
 */

const CDN = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1";

export type HadithBook = "bukhari" | "muslim";

export type HadithResult = {
  book: HadithBook;
  bookName: string;
  hadithNumber: number;
  arabic: string;
  english?: string;
};

type RawEdition = {
  hadiths: { hadithnumber: number; text: string }[];
};

const load = <T,>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) || "") as T;
  } catch {
    return fallback;
  }
};
const save = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable — ignore, caching is best-effort */
  }
};

function bookName(book: HadithBook, en: boolean): string {
  if (book === "bukhari") return en ? "Sahih al-Bukhari" : "صحيح البخاري";
  return en ? "Sahih Muslim" : "صحيح مسلم";
}

async function fetchEdition(
  book: HadithBook,
  edition: "ara" | "eng",
): Promise<RawEdition | null> {
  const cacheKey = `hadith-edition-${book}-${edition}`;
  try {
    const res = await fetch(`${CDN}/editions/${edition}-${book}.min.json`);
    if (!res.ok) throw new Error("network");
    const json = (await res.json()) as RawEdition;
    save(cacheKey, json);
    return json;
  } catch {
    return load<RawEdition | null>(cacheKey, null);
  }
}

export async function getHadithByNumber(
  book: HadithBook,
  hadithNumber: number,
  en: boolean,
): Promise<HadithResult | null> {
  const arData = await fetchEdition(book, "ara");
  if (!arData) return null;
  const arHadith = arData.hadiths.find((h) => h.hadithnumber === hadithNumber);
  if (!arHadith) return null;
  const enData = await fetchEdition(book, "eng");
  const enHadith = enData?.hadiths.find(
    (h) => h.hadithnumber === hadithNumber,
  );
  return {
    book,
    bookName: bookName(book, en),
    hadithNumber,
    arabic: arHadith.text,
    english: enHadith?.text,
  };
}

export async function getRandomDailyHadith(
  seedDate: Date,
  en: boolean,
): Promise<HadithResult> {
  const books: HadithBook[] = ["bukhari", "muslim"];
  const dayIndex = Math.floor(seedDate.getTime() / 86400000);
  const book = books[dayIndex % books.length];
  const arData = await fetchEdition(book, "ara");
  if (!arData || arData.hadiths.length === 0) {
    // fully offline with nothing cached yet: fall back to the bundled seed set
    const item = offlineSeed[dayIndex % offlineSeed.length];
    return {
      book: "bukhari",
      bookName: bookName("bukhari", en),
      hadithNumber: 0,
      arabic: item[0],
      english: item[1],
    };
  }
  const idx = dayIndex % arData.hadiths.length;
  const chosen = arData.hadiths[idx];
  const full = await getHadithByNumber(book, chosen.hadithnumber, en);
  return (
    full ?? {
      book,
      bookName: bookName(book, en),
      hadithNumber: chosen.hadithnumber,
      arabic: chosen.text,
    }
  );
}

export async function searchHadithLibrary(
  book: HadithBook,
  query: string,
  en: boolean,
): Promise<HadithResult[]> {
  const q = query.trim();
  if (!q) return [];
  const [arData, enData] = await Promise.all([
    fetchEdition(book, "ara"),
    fetchEdition(book, "eng"),
  ]);
  if (!arData) return [];
  const matches = arData.hadiths
    .filter((h) => h.text.includes(q))
    .slice(0, 40);
  return matches.map((m) => ({
    book,
    bookName: bookName(book, en),
    hadithNumber: m.hadithnumber,
    arabic: m.text,
    english: enData?.hadiths.find((h) => h.hadithnumber === m.hadithnumber)
      ?.text,
  }));
}

// --- Favorites (persisted locally) ---

const FAVORITES_KEY = "hadith-favorites";

export function getFavorites(): HadithResult[] {
  return load<HadithResult[]>(FAVORITES_KEY, []);
}

export function isFavorite(item: HadithResult, favorites: HadithResult[]) {
  return favorites.some(
    (f) => f.book === item.book && f.hadithNumber === item.hadithNumber,
  );
}

export function toggleFavorite(item: HadithResult): HadithResult[] {
  const list = getFavorites();
  const idx = list.findIndex(
    (f) => f.book === item.book && f.hadithNumber === item.hadithNumber,
  );
  if (idx >= 0) list.splice(idx, 1);
  else list.unshift(item);
  save(FAVORITES_KEY, list);
  return list;
}
