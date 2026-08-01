import { BookMarked, PlayCircle } from 'lucide-react';
import type { ChapterMeta } from '../../types';
import { getLastRead } from '../../repositories/quran/BookmarkRepository';

interface Props {
  chapters: ChapterMeta[];
  onOpenChapter: (id: number) => void;
  onOpenBookmarks: () => void;
}

export function SuraList({ chapters, onOpenChapter, onOpenBookmarks }: Props) {
  const lastRead = getLastRead();

  return (
    <div className="title">
      <h1>القرآن الكريم</h1>

      <div className="quran-quick-actions">
        {lastRead && (
          <button className="link" onClick={() => onOpenChapter(lastRead.sura)}>
            <PlayCircle size={18} /> متابعة القراءة — {lastRead.suraName} : {lastRead.ayah}
          </button>
        )}
        <button className="link" onClick={onOpenBookmarks}>
          <BookMarked size={18} /> العلامات المرجعية
        </button>
      </div>

      <div className="suras">
        {chapters.map((c) => (
          <button key={c.id} onClick={() => onOpenChapter(c.id)}>
            <b>{c.id}</b>
            <span>
              {c.name}
              <br />
              <small className="muted">{c.transliteration}</small>
            </span>
            <span className="muted">{c.total_verses} آية</span>
          </button>
        ))}
      </div>
    </div>
  );
}
