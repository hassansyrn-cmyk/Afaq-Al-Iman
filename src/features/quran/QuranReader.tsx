import { useEffect, useMemo, useRef, useState } from 'react';
import { Bookmark, BookmarkCheck, BookOpen, Share2, Minus, Plus, ArrowRight } from 'lucide-react';
import type { Chapter } from '../../types';
import {
  QuranBookmarkRepository,
  getLastRead,
  saveLastReadThrottled,
  saveLastReadImmediate,
  getReaderSettings,
  saveReaderSettings,
  clampFontSize,
  MIN_FONT_SIZE,
  MAX_FONT_SIZE,
} from '../../repositories/quran/BookmarkRepository';
import { TafsirSheet } from './TafsirSheet';

const bookmarkRepo = new QuranBookmarkRepository();

interface Props {
  chapter: Chapter;
  onBack: () => void;
  onOpenBookmarksList: () => void;
  tafsirTarget: number | null;
  onOpenTafsir: (ayah: number) => void;
  onCloseTafsir: () => void;
}

export function QuranReader({ chapter, onBack, tafsirTarget, onOpenTafsir, onCloseTafsir }: Props) {
  const [settings, setSettings] = useState(getReaderSettings());
  const [activeAyah, setActiveAyah] = useState<number | null>(null);
  const [, forceRerender] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const restoredRef = useRef(false);

  const showBasmala = chapter.id !== 9;
  const basmalaIsFirstVerse = chapter.id === 1;

  // استعادة موضع التمرير عند فتح نفس السورة التي كانت مفتوحة آخر مرة
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    const last = getLastRead();
    if (last && last.sura === chapter.id && last.scrollOffset && scrollRef.current) {
      scrollRef.current.scrollTop = last.scrollOffset;
    }
  }, [chapter.id]);

  function handleScroll() {
    if (!scrollRef.current) return;
    saveLastReadThrottled({
      sura: chapter.id,
      ayah: activeAyah ?? 1,
      suraName: chapter.name,
      scrollOffset: scrollRef.current.scrollTop,
      updatedAt: new Date().toISOString(),
    });
  }

  function changeFontSize(delta: number) {
    const next = { ...settings, fontSizePx: clampFontSize(settings.fontSizePx + delta) };
    setSettings(next);
    saveReaderSettings(next);
  }

  function setNavigationMode(mode: 'vertical' | 'horizontal') {
    const next = { ...settings, navigationMode: mode };
    setSettings(next);
    saveReaderSettings(next);
  }

  function toggleBookmark(ayahId: number) {
    bookmarkRepo.toggle({ sura: chapter.id, ayah: ayahId, suraName: chapter.name });
    forceRerender((n) => n + 1);
  }

  function markAyahRead(ayahId: number) {
    saveLastReadImmediate({
      sura: chapter.id,
      ayah: ayahId,
      suraName: chapter.name,
      scrollOffset: scrollRef.current?.scrollTop,
      updatedAt: new Date().toISOString(),
    });
  }

  async function shareAyah(ayahId: number, text: string) {
    const payload = `${text}\n— سورة ${chapter.name}، الآية ${ayahId}`;
    try {
      if (navigator.share) {
        await navigator.share({ text: payload });
      } else {
        await navigator.clipboard.writeText(payload);
      }
    } catch {
      /* المستخدم ألغى المشاركة — لا حاجة لمعالجة */
    }
  }

  const juzLabel = useMemo(() => estimateJuz(chapter.id), [chapter.id]);

  return (
    <div className={`quran-reader nav-${settings.navigationMode}`}>
      <div className="reader-toolbar">
        <button className="round" onClick={onBack} aria-label="رجوع">
          <ArrowRight size={18} />
        </button>
        <div className="reader-title">
          <b>{chapter.name}</b>
          <span className="muted"> ‏~الجزء {juzLabel} · {chapter.total_verses} آية</span>
        </div>
        <div className="font-size-controls">
          <button className="round" onClick={() => changeFontSize(-2)} aria-label="تصغير الخط" disabled={settings.fontSizePx <= MIN_FONT_SIZE}>
            <Minus size={16} />
          </button>
          <span className="font-size-value">{settings.fontSizePx}</span>
          <button className="round" onClick={() => changeFontSize(2)} aria-label="تكبير الخط" disabled={settings.fontSizePx >= MAX_FONT_SIZE}>
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="nav-mode-toggle">
        <button className={settings.navigationMode === 'vertical' ? 'active' : ''} onClick={() => setNavigationMode('vertical')}>
          تمرير رأسي
        </button>
        <button className={settings.navigationMode === 'horizontal' ? 'active' : ''} onClick={() => setNavigationMode('horizontal')}>
          تقليب أفقي
        </button>
      </div>

      <div className="quran-page" ref={scrollRef} onScroll={handleScroll} style={{ fontSize: settings.fontSizePx }}>
        {showBasmala && !basmalaIsFirstVerse && (
          <p className="basmala">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
        )}

        <p className="quran-flow" dir="rtl">
          {chapter.verses.map((v) => (
            <span
              key={v.id}
              className={`ayah-run ${activeAyah === v.id ? 'active' : ''}`}
              onClick={() => {
                setActiveAyah(v.id);
                markAyahRead(v.id);
              }}
            >
              {v.text}
              <span className="ayah-number" aria-label={`نهاية الآية ${v.id}`}>
                {toArabicDigits(v.id)}
              </span>{' '}
            </span>
          ))}
        </p>
      </div>

      {activeAyah != null && (
        <div className="ayah-actions-bar">
          <span className="muted">الآية {toArabicDigits(activeAyah)}</span>
          <button
            className="icon-btn"
            onClick={() => toggleBookmark(activeAyah)}
            aria-label="حفظ الآية"
            title="حفظ"
          >
            {bookmarkRepo.isBookmarked(chapter.id, activeAyah) ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
          </button>
          <button className="icon-btn" onClick={() => onOpenTafsir(activeAyah)} aria-label="شرح الآية" title="التفسير">
            <BookOpen size={20} />
          </button>
          <button
            className="icon-btn"
            onClick={() => {
              const v = chapter.verses.find((x) => x.id === activeAyah);
              if (v) shareAyah(activeAyah, v.text);
            }}
            aria-label="مشاركة الآية"
            title="مشاركة"
          >
            <Share2 size={20} />
          </button>
        </div>
      )}

      {tafsirTarget != null && (
        <TafsirSheet
          sura={chapter.id}
          ayah={tafsirTarget}
          suraName={chapter.name}
          ayahText={chapter.verses.find((v) => v.id === tafsirTarget)?.text ?? ''}
          onClose={onCloseTafsir}
        />
      )}
    </div>
  );
}

function toArabicDigits(n: number): string {
  const digits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(n)
    .split('')
    .map((d) => digits[Number(d)] ?? d)
    .join('');
}

/** تقدير مبسّط لرقم الجزء بناءً على رقم السورة (تقريبي، وليس بديلاً عن بيانات صفحات رسمية). */
function estimateJuz(suraId: number): number {
  const approxJuzStarts = [1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 21, 23, 26, 28, 30, 32, 34, 37, 41, 45, 51, 58, 63, 67, 78, 88, 96, 110];
  let juz = 1;
  for (let i = 0; i < approxJuzStarts.length; i++) {
    if (suraId >= approxJuzStarts[i]) juz = i + 1;
  }
  return juz;
}
