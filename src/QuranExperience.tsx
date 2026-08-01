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
import { surahs } from "./surahs";

type Verse = { id: number; text: string };
type Chapter = {
  id: number;
  name: string;
  total_verses: number;
  verses: Verse[];
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
  const [font, setFont] = useState(() => load("quran-font", 30));
  const [marks, setMarks] = useState<Record<string, boolean>>(() =>
    load("bookmarks", {}),
  );
  const [lastRead, setLastRead] = useState<LastRead | null>(() =>
    load("quran-last-read", null),
  );
  const [query, setQuery] = useState("");
  const pinch = useRef<{ distance: number; font: number } | null>(null);
  const en = lang === "en";

  useEffect(() => {
    onReaderStateChange?.(!!chapter);
  }, [chapter, onReaderStateChange]);
  useEffect(() => {
    const back = () => setChapter((current) => (current ? null : current));
    window.addEventListener("afaq-quran-back", back);
    return () => window.removeEventListener("afaq-quran-back", back);
  }, []);

  async function openSura(id: number, ayah?: number) {
    const response = await fetch(`./quran/${id}.json`);
    if (!response.ok)
      throw new Error(
        en ? `Could not load chapter ${id}` : `تعذر تحميل السورة رقم ${id}`,
      );
    const data = (await response.json()) as Chapter;
    const info = surahs[id - 1];
    setChapter({ ...data, id, name: info.name, total_verses: info.verses });
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
    const next = chapter.id < 114 ? surahs[chapter.id] : null;
    const previous = chapter.id > 1 ? surahs[chapter.id - 2] : null;
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
            <h1>{chapter.name}</h1>
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
                {verse.text} <b>﴿{verse.id}﴾</b>
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
                <b>{previous.name}</b>
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
                <b>{next.name}</b>
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
    `${s.id} ${s.name}`.includes(query.trim()),
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
          <button key={s.id} onClick={() => void openSura(s.id)}>
            <b>{s.id}</b>
            <span>
              <strong>
                {en ? "Surah" : "سورة"} {s.name}
              </strong>
              <small>
                {s.verses} {en ? "verses" : "آية"}
              </small>
            </span>
            <ChevronLeft />
          </button>
        ))}
      </div>
    </>
  );
}
