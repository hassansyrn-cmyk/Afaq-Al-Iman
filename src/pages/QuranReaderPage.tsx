import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { useI18n } from '../i18n';
import TopBar from '../components/TopBar';
import { SurahContent, getSurah, saveLastRead, getBookmarks, toggleBookmark, ReadingPosition } from '../services/quranApi';
import { getPref, setPref } from '../utils/storage';

const FONT_KEY = 'afaq.quran.fontSize';

const QuranReaderPage: React.FC = () => {
  const { t, lang } = useI18n();
  const { number } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const surahNumber = Number(number);

  const [content, setContent] = useState<SurahContent | null>(null);
  const [error, setError] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [fontSize, setFontSize] = useState(22);
  const [bookmarks, setBookmarks] = useState<ReadingPosition[]>([]);

  useEffect(() => {
    setContent(null);
    setError(false);
    getSurah(surahNumber).then(setContent).catch(() => setError(true));
    getBookmarks().then(setBookmarks);
    getPref<number>(FONT_KEY).then((v) => v && setFontSize(v));
  }, [surahNumber]);

  useEffect(() => {
    const ayahParam = params.get('ayah');
    if (content && ayahParam) {
      const el = document.getElementById(`ayah-${ayahParam}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [content, params]);

  useEffect(() => {
    if (content) void saveLastRead({ surah: surahNumber, ayah: 1, timestamp: Date.now() });
  }, [content, surahNumber]);

  const isBookmarked = (ayah: number) => bookmarks.some((b) => b.surah === surahNumber && b.ayah === ayah);

  const onBookmark = async (ayah: number) => {
    const updated = await toggleBookmark({ surah: surahNumber, ayah, timestamp: Date.now() });
    setBookmarks(updated);
    void saveLastRead({ surah: surahNumber, ayah, timestamp: Date.now() });
  };

  const changeFont = (delta: number) => {
    const next = Math.min(34, Math.max(16, fontSize + delta));
    setFontSize(next);
    void setPref(FONT_KEY, next);
  };

  const title = content ? (lang === 'ar' ? content.meta.name : content.meta.englishName) : '';

  return (
    <div className="page">
      <TopBar title={title || t.quran.title} right={<button className="chip" onClick={() => navigate('/quran')}>{t.common.back}</button>} />

      <div className="content">
        <div className="glass row" style={{ marginBottom: 12 }}>
          <div className="row" style={{ gap: 6 }}>
            <button className="btn btn-ghost" onClick={() => changeFont(-2)}>A-</button>
            <button className="btn btn-ghost" onClick={() => changeFont(2)}>A+</button>
          </div>
          <button className={`chip${showTranslation ? ' active' : ''}`} onClick={() => setShowTranslation((v) => !v)}>
            {lang === 'ar' ? 'EN' : t.quran.title}
          </button>
        </div>

        {error && <p className="hint">{t.quran.loadError}</p>}
        {!content && !error && <p className="hint">{t.common.loading}</p>}

        {content && (
          <div className="glass stack">
            {content.ayahs.map((ayah) => (
              <div key={ayah.numberInSurah} id={`ayah-${ayah.numberInSurah}`} className="stack" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
                <p className="quran-text" style={{ fontSize, margin: 0 }}>
                  {ayah.text}
                  <span className="chip" style={{ marginInlineStart: 8, fontSize: 11 }}>{ayah.numberInSurah}</span>
                </p>
                {showTranslation && ayah.translation && <p className="hint" style={{ fontStyle: 'italic' }}>{ayah.translation}</p>}
                <div className="row">
                  <span />
                  <button className="btn btn-ghost" onClick={() => onBookmark(ayah.numberInSurah)} aria-label="bookmark">
                    <span style={{ opacity: isBookmarked(ayah.numberInSurah) ? 1 : 0.4, display: 'inline-flex' }}>
                      <Bookmark size={16} />
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="hint" style={{ margin: '14px 4px 0' }}>{t.quran.sourceNotice}</p>
      </div>
    </div>
  );
};

export default QuranReaderPage;
