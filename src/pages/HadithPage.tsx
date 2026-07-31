import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import TopBar from '../components/TopBar';
import { HadithBook, HadithItem, getFavoriteHadiths, getRandomDailyHadith, searchHadith, toggleFavoriteHadith } from '../services/hadithApi';
import { HeartIcon, SearchIcon, ShareIcon } from '../components/Icons';

const HadithPage: React.FC = () => {
  const { t } = useI18n();
  const [daily, setDaily] = useState<HadithItem | null>(null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');
  const [book, setBook] = useState<HadithBook>('bukhari');
  const [results, setResults] = useState<HadithItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [favorites, setFavorites] = useState<HadithItem[]>([]);

  useEffect(() => {
    getRandomDailyHadith(new Date()).then((h) => (h ? setDaily(h) : setError(true))).catch(() => setError(true));
    getFavoriteHadiths().then(setFavorites);
  }, []);

  const runSearch = async () => {
    if (!query.trim()) return setResults([]);
    setSearching(true);
    const r = await searchHadith(book, query.trim());
    setResults(r);
    setSearching(false);
  };

  const isFavorite = (item: HadithItem) => favorites.some((f) => f.book === item.book && f.hadithNumber === item.hadithNumber);

  const toggleFav = async (item: HadithItem) => {
    const updated = await toggleFavoriteHadith(item);
    setFavorites(updated);
  };

  const share = async (item: HadithItem) => {
    const text = `${item.arabic}\n\n${item.bookName} — ${t.hadith.number} ${item.hadithNumber}`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch { /* cancelled */ }
    }
  };

  return (
    <div className="page">
      <TopBar title={t.hadith.title} />

      <div className="section-title">{t.hadith.dailyHadith}</div>
      <div className="card stack">
        {daily ? (
          <>
            <p className="quran-text" style={{ fontSize: 17, margin: 0 }}>{daily.arabic}</p>
            {daily.english && <p className="hint" style={{ fontStyle: 'italic' }}>{daily.english}</p>}
            <div className="row">
              <span className="hint">{daily.bookName} — {t.hadith.number} {daily.hadithNumber}</span>
              <div className="row" style={{ gap: 10 }}>
                <button className="btn btn-ghost" onClick={() => share(daily)} aria-label="share"><ShareIcon size={16} /></button>
                <button className="btn btn-ghost" onClick={() => toggleFav(daily)} aria-label="favorite">
                  <HeartIcon size={16} filled={isFavorite(daily)} />
                </button>
              </div>
            </div>
          </>
        ) : error ? (
          <span className="hint">{t.hadith.loadError}</span>
        ) : (
          <span className="hint">{t.common.loading}</span>
        )}
      </div>

      <div className="section-title">{t.hadith.search}</div>
      <div className="card">
        <div className="row" style={{ gap: 8, marginBottom: 10 }}>
          <button className={`chip${book === 'bukhari' ? ' active' : ''}`} onClick={() => setBook('bukhari')}>{t.hadith.sourceBukhari}</button>
          <button className={`chip${book === 'muslim' ? ' active' : ''}`} onClick={() => setBook('muslim')}>{t.hadith.sourceMuslim}</button>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <input type="text" placeholder={t.hadith.search} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && runSearch()} />
          <button className="btn btn-primary" onClick={runSearch} aria-label="search"><SearchIcon size={16} /></button>
        </div>
      </div>

      {searching && <p className="hint" style={{ margin: '10px 4px' }}>{t.common.loading}</p>}

      {results.map((r) => (
        <div className="card" key={`${r.book}-${r.hadithNumber}`}>
          <p className="quran-text" style={{ fontSize: 16, margin: 0 }}>{r.arabic}</p>
          <div className="row" style={{ marginTop: 8 }}>
            <span className="hint">{r.bookName} — {t.hadith.number} {r.hadithNumber}</span>
            <button className="btn btn-ghost" onClick={() => toggleFav(r)} aria-label="favorite">
              <HeartIcon size={16} filled={isFavorite(r)} />
            </button>
          </div>
        </div>
      ))}

      <p className="hint" style={{ margin: '14px 4px 0' }}>{t.hadith.sourceNotice}</p>
    </div>
  );
};

export default HadithPage;
