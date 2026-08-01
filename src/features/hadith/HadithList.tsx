import { useEffect, useState } from 'react';
import { Search, Heart, HeartOff, Info } from 'lucide-react';
import type { HadithRecord } from '../../types';
import { type HadithLibraryStatus } from '../../repositories/hadith/HadithRepository';
import { hadithRepository as repo } from '../../repositories/hadith/hadithRepositoryInstance';

interface Props {
  onOpenDetail: (id: string) => void;
}

export function HadithList({ onOpenDetail }: Props) {
  const [status, setStatus] = useState<HadithLibraryStatus | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<HadithRecord[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [, forceRerender] = useState(0);

  useEffect(() => {
    repo.getStatus().then(setStatus);
  }, []);

  useEffect(() => {
    setLoading(true);
    repo
      .search({ text: query || undefined, page, pageSize: 20 })
      .then((res) => {
        setResults((prev) => (page === 1 ? res.items : [...prev, ...res.items]));
        setHasMore(res.hasMore);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, page]);

  return (
    <div className="title">
      <h1>الأحاديث</h1>

      {status && !status.isFullLibrary && (
        <div className="library-status-banner">
          <Info size={16} />
          <span>
            هذه مجموعة اختبار ({status.size} حديثاً) وليست مكتبة الصحيحين الكاملة. المزامنة الكاملة
            تحتاج اتصالاً بمصدر معتمد — راجع صفحة الإعدادات.
          </span>
        </div>
      )}

      <div className="search-box">
        <Search size={18} />
        <input
          placeholder="بحث بالنص أو رقم الحديث أو المصدر…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="hadith-list">
        {results.map((h) => (
          <div key={h.id} className="hadith" onClick={() => onOpenDetail(h.id)}>
            <p>{h.textAr}</p>
            {h.textEn && <small className="muted">{h.textEn}</small>}
            <div className="hadith-footer">
              <small className="muted">{h.source}</small>
              <button
                className="icon-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  repo.toggleFavorite(h.id);
                  forceRerender((n) => n + 1);
                }}
                aria-label="المفضلة"
              >
                {repo.isFavorite(h.id) ? <Heart size={18} fill="currentColor" /> : <HeartOff size={18} />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {loading && <p className="muted">جارٍ التحميل…</p>}
      {!loading && hasMore && (
        <button className="link" onClick={() => setPage((p) => p + 1)}>
          تحميل المزيد
        </button>
      )}
      {!loading && results.length === 0 && <p className="muted">لا توجد نتائج مطابقة.</p>}
    </div>
  );
}
