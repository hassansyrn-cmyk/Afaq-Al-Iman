import { useEffect, useState } from 'react';
import { ArrowRight, Heart, HeartOff } from 'lucide-react';
import type { HadithRecord } from '../../types';
import { hadithRepository as repo } from '../../repositories/hadith/hadithRepositoryInstance';

interface Props {
  hadithId: string;
  onBack: () => void;
}

export function HadithDetail({ hadithId, onBack }: Props) {
  const [hadith, setHadith] = useState<HadithRecord | null | undefined>(undefined);
  const [, forceRerender] = useState(0);

  useEffect(() => {
    repo.setLastRead(hadithId);
    repo.getById(hadithId).then(setHadith);
  }, [hadithId]);

  return (
    <div className="title">
      <div className="reader-toolbar">
        <button className="round" onClick={onBack} aria-label="رجوع">
          <ArrowRight size={18} />
        </button>
        <h1>تفاصيل الحديث</h1>
      </div>

      {hadith === undefined && <p className="muted">جارٍ التحميل…</p>}
      {hadith === null && <p className="muted">تعذّر العثور على هذا الحديث.</p>}
      {hadith && (
        <div className="hadith">
          <p style={{ fontSize: 20 }}>{hadith.textAr}</p>
          {hadith.textEn && <p className="muted">{hadith.textEn}</p>}
          <small className="muted">{hadith.source}</small>
          <div className="hadith-footer">
            <button
              className="icon-btn"
              onClick={() => {
                repo.toggleFavorite(hadith.id);
                forceRerender((n) => n + 1);
              }}
            >
              {repo.isFavorite(hadith.id) ? <Heart size={18} fill="currentColor" /> : <HeartOff size={18} />}
              المفضلة
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
