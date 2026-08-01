import { Trash2, ArrowRight } from 'lucide-react';
import { QuranBookmarkRepository } from '../../repositories/quran/BookmarkRepository';

const bookmarkRepo = new QuranBookmarkRepository();

interface Props {
  onBack: () => void;
  onOpenAyah: (sura: number) => void;
}

export function BookmarksList({ onBack, onOpenAyah }: Props) {
  const bookmarks = bookmarkRepo.getAll();

  return (
    <div className="title">
      <div className="reader-toolbar">
        <button className="round" onClick={onBack} aria-label="رجوع">
          <ArrowRight size={18} />
        </button>
        <h1>العلامات المرجعية</h1>
      </div>

      {bookmarks.length === 0 && <p className="muted">لا توجد علامات محفوظة بعد.</p>}

      <div className="suras">
        {bookmarks.map((b) => (
          <div key={b.id} className="bookmark-row">
            <button onClick={() => onOpenAyah(b.sura)}>
              <span>
                {b.suraName} : {b.ayah}
                <br />
                <small className="muted">{new Date(b.savedAt).toLocaleDateString('ar')}</small>
              </span>
            </button>
            <button className="round" onClick={() => bookmarkRepo.remove(b.id)} aria-label="حذف">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
