import {
  Bookmark,
  BookmarkCheck,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Search,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { sanitizeQuranText } from "./quranText";

type Verse = { id: number; text: string; translation?: string; transliteration?: string };
type Chapter = {
  id: number;
  name: string;
  total_verses: number;
  verses: Verse[];
};
type SurahMeta = {
  id: number;
  name: string;
  transliteration: string;
  translation: string;
  type: "meccan" | "medinan";
  total_verses: number;
};
type LastRead = { sura: number; ayah: number; name: string };
type Props = {
  lang?: "ar" | "en";
  onReaderStateChange?: (open: boolean) => void;
};
const load = <T,>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) || "") as T;
  } catch {
    return fallback;
  }
};
const save = (key: string, value: unknown) =>
  localStorage.setItem(key, JSON.stringify(value));
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export default function QuranExperience({
  lang = "ar",
  onReaderStateChange,
}: Props) {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [font, setFont] = useState(() => load("quran-font", 30));
  const [marks, setMarks] = useState<Record<string, boolean>>(() =>
    load("bookmarks", {}),
  );
  const [lastRead, setLastRead] = useState<LastRead | null>(() =>
    load("quran-last-read", null),
  );
  const [query, setQuery] = useState("");
  const [showTranslation, setShowTranslation] = useState(() => load("quran-translation", false));
  const pinch = useRef<{ distance: number; font: number } | null>(null);
  const en = lang === "en";

  useEffect(() => {
    onReaderStateChange?.(!!chapter);
  }, [chapter, onReaderStateChange]);
  useEffect(() => {
    fetch("./quran/surahs-meta.json")
      .then((r) => r.json())
      .then((data: SurahMeta[]) => setSurahs(data))
      .catch(() => setSurahs([]));
  }, []);
  useEffect(() => {
    const back = () => setChapter((current) => (current ? null : current));
    window.addEventListener("afaq-quran-back", back);
    return () => window.removeEventListener("afaq-quran-back", back);
  }, []);

  async function openSura(id: number, ayah?: number) {
    const [arRes, enRes] = await Promise.all([
      fetch(`./quran/${id}.json`),
      fetch(`./quran/en/${id}.json`).catch(() => null),
    ]);
    if (!arRes.ok)
      throw new Error(
        en ? `Could not load chapter ${id}` : `تعذر تحميل السورة رقم ${id}`,
      );
    const arData = (await arRes.json()) as Chapter;
    let enData: Chapter | null = null;
    if (enRes && enRes.ok) {
      try { enData = (await enRes.json()) as Chapter; } catch {}
    }
    const info = surahs.find((s) => s.id === id);
    const merged: Chapter = {
      ...arData,
      id,
      name: info?.name ?? arData.name,
      total_verses: info?.total_verses ?? arData.total_verses,
      verses: arData.verses.map((v, i) => ({
        ...v,
        translation: enData?.verses?.[i]?.translation,
        transliteration: enData?.verses?.[i]?.transliteration,
      })),
    };
    setChapter(merged);
    window.setTimeout(() => {
      if (ayah)
        document
          .getElementById(`ayah-${id}-${ayah}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  }

  function changeFont(next: number) {
    const value = clamp(Math.round(next), 22, 48);
    setFont(value);
    save("quran-font", value);
  }
  function distance(touches: React.TouchList) {
    const a = touches[0],
      b = touches[1];
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  }
  function toggleBookmark(verse: Verse) {
    if (!chapter) return;
    const key = `${chapter.id}:${verse.id}`;
    const next = { ...marks, [key]: !marks[key] };
    setMarks(next);
    save("bookmarks", next);
    if (!marks[key]) {
      const progress = { sura: chapter.id, ayah: verse.id, name: chapter.name };
      setLastRead(progress);
      save("quran-last-read", progress);
    }
  }

  if (chapter) {
    const next = chapter.id < 114 ? surahs.find((s) => s.id === chapter.id + 1) : null;
    const previous = chapter.id > 1 ? surahs.find((s) => s.id === chapter.id - 1) : null;
    const current = surahs.find((s) => s.id === chapter.id);
    return (
      <>
        <div className="readerHead">
          <button
            onClick={() => setChapter(null)}
            aria-label={en ? "Chapter list" : "قائمة السور"}
          >
            ×
          </button>
          <div>
            <small>{en ? "Surah" : "سورة"}</small>
            <h1>{en && current ? current.transliteration : chapter.name}</h1>
            <span>
              {chapter.total_verses} {en ? "verses" : "آية"}
            </span>
          </div>
          <div className="readerZoom">
            <button onClick={() => changeFont(font - 2)}>
              <Minus />
            </button>
            <b>{font}</b>
            <button onClick={() => changeFont(font + 2)}>
              <Plus />
            </button>
          </div>
        </div>
        <div className="readerControls">
          <button className={showTranslation ? "on" : ""} onClick={() => { const v = !showTranslation; setShowTranslation(v); save("quran-translation", v); }}>
            {en ? "Translation" : "الترجمة"}
          </button>
        </div>
        <p className="pinchHint">
          {en
            ? "Pinch with two fingers to zoom"
            : "استخدم إصبعين للتكبير والتصغير"}
        </p>
        <section
          className="mushafPage"
          style={{ fontSize: font }}
          onTouchStart={(e) => {
            if (e.touches.length === 2)
              pinch.current = { distance: distance(e.touches), font };
          }}
          onTouchMove={(e) => {
            if (e.touches.length === 2 && pinch.current) {
              e.preventDefault();
              changeFont(
                (pinch.current.font * distance(e.touches)) /
                  pinch.current.distance,
              );
            }
          }}
          onTouchEnd={() => {
            pinch.current = null;
          }}
        >
          {chapter.verses.map((verse) => {
            const key = `${chapter.id}:${verse.id}`,
              marked = !!marks[key];
            return (
              <span
                className="verse"
                id={`ayah-${chapter.id}-${verse.id}`}
                key={verse.id}
              >
                {sanitizeQuranText(verse.text)} <b>﴿{verse.id}﴾</b>
                {showTranslation && verse.translation && (
                  <span className="verseTranslation">{verse.translation}</span>
                )}
                <button
                  className={marked ? "marked" : ""}
                  onClick={() => toggleBookmark(verse)}
                >
                  {marked ? <BookmarkCheck /> : <Bookmark />}
                </button>{" "}
              </span>
            );
          })}
        </section>
        <section className="surahNavigation">
          {previous ? (
            <button onClick={() => void openSura(previous.id)}>
              <ChevronRight />
              <span>
                <small>{en ? "Previous surah" : "السورة السابقة"}</small>
                <b>{en ? previous.transliteration : previous.name}</b>
              </span>
            </button>
          ) : (
            <span />
          )}
          {next ? (
            <button
              className="nextSurah"
              onClick={() => void openSura(next.id)}
            >
              <span>
                <small>{en ? "Next surah" : "السورة التالية"}</small>
                <b>{en ? next.transliteration : next.name}</b>
              </span>
              <ChevronLeft />
            </button>
          ) : (
            <div className="quranComplete">
              <BookOpen />
              <b>{en ? "Last surah completed" : "تمت قراءة آخر سورة"}</b>
            </div>
          )}
        </section>
      </>
    );
  }

  const filtered = surahs.filter((s) =>
    `${s.id} ${s.name} ${s.transliteration} ${s.translation}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  return (
    <>
      <section
        className="sectionHero quranHero"
        style={{
          backgroundImage:
            "linear-gradient(90deg,#021c17eb,#04312845),url('./images/quran/quran-hero.webp')",
        }}
      >
        <div>
          <h1>{en ? "The Holy Quran" : "القرآن الكريم"}</h1>
          <p>
            {en ? "114 surahs with correct names" : "114 سورة بأسمائها الصحيحة"}
          </p>
        </div>
      </section>
      {lastRead && (
        <section className="continueReadingCard">
          <div className="continueIcon">
            <BookmarkCheck />
          </div>
          <div>
            <small>{en ? "Last saved position" : "آخر موضع محفوظ"}</small>
            <h2>
              {en ? "Surah" : "سورة"} {lastRead.name}
            </h2>
            <p>
              {en ? "Verse" : "الآية"} {lastRead.ayah}
            </p>
          </div>
          <button onClick={() => void openSura(lastRead.sura, lastRead.ayah)}>
            {en ? "Continue reading" : "متابعة القراءة"} <ChevronLeft />
          </button>
        </section>
      )}
      <label className="search quranSearch">
        <Search />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            en ? "Search by name or number" : "ابحث باسم السورة أو رقمها"
          }
        />
      </label>
      <div className="suras">
        {filtered.map((s) => (
          <button key={s.id} className="suraRow" onClick={() => void openSura(s.id)}>
            <b>{s.id}</b>
            <span className="suraInfo">
              <strong>{s.name}</strong>
              <em>
                {s.transliteration} — {s.translation}
              </em>
              <small>
                <i className={`makkiBadge ${s.type}`}>
                  {s.type === "meccan"
                    ? en
                      ? "Meccan"
                      : "مكية"
                    : en
                      ? "Medinan"
                      : "مدنية"}
                </i>
                {s.total_verses} {en ? "verses" : "آية"}
              </small>
            </span>
            <ChevronLeft />
          </button>
        ))}
      </div>
    </>
  );
}
