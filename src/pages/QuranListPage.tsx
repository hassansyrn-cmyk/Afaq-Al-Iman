import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bookmark, ChevronLeft, CalendarDays } from 'lucide-react';
import { useI18n } from '../i18n';
import SectionHero from '../components/SectionHero';
import { SurahMeta, getSurahList, ReadingPosition, getLastRead, getBookmarks } from '../services/quranApi';

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
      <SectionHero
        image="/images/quran/quran-hero.webp"
        title={t.quran.title}
        subtitle={t.quran.offlineNotice}
        topRight={<Link to="/quran/khatma" className="chip" style={{ background: 'rgba(255,255,255,0.14)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}><CalendarDays size={13} /> {t.khatma.title}</Link>}
      />

      <div className="content">
        <div className="glass search-field">
          <Search size={17} />
          <input type="text" placeholder={t.quran.search} value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        {lastRead && (
          <Link to={`/quran/${lastRead.surah}?ayah=${lastRead.ayah}`} className="list-row" style={{ marginBottom: 14 }}>
            <b className="badge"><Bookmark size={15} /></b>
            <span style={{ fontWeight: 700 }}>{t.quran.lastRead}</span>
            <span className="chip">{surahs.find((s) => s.number === lastRead.surah)?.name ?? lastRead.surah}</span>
          </Link>
        )}

        {bookmarks.length > 0 && (
          <>
            <div className="section-title" style={{ marginTop: 0 }}>{t.quran.bookmarks}</div>
            <div className="glass stack" style={{ marginBottom: 14 }}>
              {bookmarks.map((b) => (
                <Link key={`${b.surah}-${b.ayah}`} to={`/quran/${b.surah}?ayah=${b.ayah}`} className="row" style={{ textDecoration: 'none', color: 'var(--text)' }}>
                  <span>{surahs.find((s) => s.number === b.surah)?.name ?? b.surah}</span>
                  <span className="hint">{t.quran.ayah} {b.ayah}</span>
                </Link>
              ))}
            </div>
          </>
        )}

        <div className="section-title" style={{ marginTop: 0 }}>{t.quran.surahs}</div>
        {error && <p className="hint">{t.quran.loadError}</p>}
        <div className="list">
          {filtered.map((s) => (
            <Link key={s.number} to={`/quran/${s.number}`} className="list-row">
              <b className="badge">{s.number}</b>
              <div>
                <div style={{ fontWeight: 700 }}>{lang === 'ar' ? s.name : s.englishName}</div>
                <small className="hint">{s.numberOfAyahs} {t.quran.ayah}</small>
              </div>
              <ChevronLeft size={16} className="hint" />
            </Link>
          ))}
        </div>

        <p className="hint" style={{ margin: '14px 4px 0' }}>{t.quran.sourceNotice}</p>
      </div>
    </div>
  );
};

export default QuranListPage;
