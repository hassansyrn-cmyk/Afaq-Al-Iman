import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import TopBar from '../components/TopBar';
import { SurahMeta, getSurahList, ReadingPosition, getLastRead, getBookmarks } from '../services/quranApi';
import { SearchIcon, BookmarkIcon } from '../components/Icons';

const QuranListPage: React.FC = () => {
  const { t, lang } = useI18n();
  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');
  const [lastRead, setLastRead] = useState<ReadingPosition | null>(null);
  const [bookmarks, setBookmarks] = useState<ReadingPosition[]>([]);

  useEffect(() => {
    getSurahList().then(setSurahs).catch(() => setError(true));
    getLastRead().then(setLastRead);
    getBookmarks().then(setBookmarks);
  }, []);

  const filtered = surahs.filter((s) => {
    const q = query.trim();
    if (!q) return true;
    return s.name.includes(q) || s.englishName.toLowerCase().includes(q.toLowerCase()) || String(s.number) === q;
  });

  return (
    <div className="page">
      <TopBar
        title={t.quran.title}
        right={<Link to="/quran/khatma" className="chip">{t.khatma.title}</Link>}
      />

      <div className="card row" style={{ gap: 8 }}>
        <SearchIcon size={16} />
        <input type="text" placeholder={t.quran.search} value={query} onChange={(e) => setQuery(e.target.value)} style={{ border: 'none', padding: 0 }} />
      </div>

      {lastRead && (
        <Link to={`/quran/${lastRead.surah}?ayah=${lastRead.ayah}`} className="card row" style={{ marginTop: 12, textDecoration: 'none', color: 'var(--text-primary)' }}>
          <span>{t.quran.lastRead}</span>
          <span className="chip">{surahs.find((s) => s.number === lastRead.surah)?.name ?? lastRead.surah}</span>
        </Link>
      )}

      {bookmarks.length > 0 && (
        <>
          <div className="section-title row">
            <span>{t.quran.bookmarks}</span>
            <BookmarkIcon size={16} />
          </div>
          <div className="card stack">
            {bookmarks.map((b) => (
              <Link key={`${b.surah}-${b.ayah}`} to={`/quran/${b.surah}?ayah=${b.ayah}`} className="row" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
                <span>{surahs.find((s) => s.number === b.surah)?.name ?? b.surah}</span>
                <span className="hint">{t.quran.ayah} {b.ayah}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      <div className="section-title">{t.quran.surahs}</div>
      {error && <p className="hint">{t.quran.loadError}</p>}
      <div className="stack">
        {filtered.map((s) => (
          <Link key={s.number} to={`/quran/${s.number}`} className="card row" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
            <div className="row" style={{ gap: 10 }}>
              <span className="chip">{s.number}</span>
              <div>
                <div style={{ fontWeight: 700 }}>{lang === 'ar' ? s.name : s.englishName}</div>
                <div className="hint">{s.numberOfAyahs} {t.quran.ayah}</div>
              </div>
            </div>
            <span className="hint">{s.revelationType}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuranListPage;
