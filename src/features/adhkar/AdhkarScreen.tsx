import { useMemo, useState } from 'react';
import { RotateCcw, ArrowRight } from 'lucide-react';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { adhkarItems, CATEGORY_LABELS, type AdhkarCategory } from '../../data/adhkar';
import { AdhkarRepository } from '../../repositories/adhkar/AdhkarRepository';

const repo = new AdhkarRepository();
const CATEGORIES: AdhkarCategory[] = ['after_prayer', 'daily', 'free'];

interface Props {
  onBack: () => void;
}

export function AdhkarScreen({ onBack }: Props) {
  const [category, setCategory] = useState<AdhkarCategory>('after_prayer');
  const [focusIndex, setFocusIndex] = useState(0);
  const [, forceRerender] = useState(0);

  const itemsInCategory = useMemo(() => adhkarItems.filter((i) => i.category === category), [category]);
  const isSequenceMode = category !== 'free';
  const focusItem = itemsInCategory[Math.min(focusIndex, itemsInCategory.length - 1)];

  function tap(itemId: string, target: number | null) {
    const next = repo.increment(itemId);
    forceRerender((n) => n + 1);

    if (target != null && next >= target) {
      Haptics.notification({ type: NotificationType.Success }).catch(() => {});
      if (isSequenceMode) {
        // انتقال تلقائي للذكر التالي في التسلسل بعد بلوغ الهدف
        setTimeout(() => {
          setFocusIndex((i) => Math.min(i + 1, itemsInCategory.length - 1));
        }, 400);
      }
    } else {
      Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
    }
  }

  function resetAll() {
    repo.resetCategory(itemsInCategory.map((i) => i.id));
    setFocusIndex(0);
    forceRerender((n) => n + 1);
  }

  function switchCategory(next: AdhkarCategory) {
    setCategory(next);
    setFocusIndex(0);
  }

  return (
    <div className="title">
      <div className="reader-toolbar">
        <button className="round" onClick={onBack} aria-label="رجوع">
          <ArrowRight size={18} />
        </button>
        <h1>الأذكار</h1>
        <button className="round" onClick={resetAll} aria-label="إعادة تصفير">
          <RotateCcw size={18} />
        </button>
      </div>

      <div className="nav-mode-toggle">
        {CATEGORIES.map((c) => (
          <button key={c} className={category === c ? 'active' : ''} onClick={() => switchCategory(c)}>
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {isSequenceMode && focusItem && (
        <div className="adhkar-focus">
          <p className="adhkar-progress-label">
            {focusIndex + 1} / {itemsInCategory.length}
          </p>
          <button className="adhkar-tap-circle" onClick={() => tap(focusItem.id, focusItem.target)}>
            <span className="adhkar-text">{focusItem.textAr}</span>
            <span className="adhkar-count">
              {repo.getCount(focusItem.id)}
              {focusItem.target != null && <small> / {focusItem.target}</small>}
            </span>
          </button>
          <div className="adhkar-sequence-dots">
            {itemsInCategory.map((it, idx) => (
              <span key={it.id} className={`dot ${idx === focusIndex ? 'on' : ''} ${repo.getCount(it.id) >= (it.target ?? Infinity) ? 'done' : ''}`} />
            ))}
          </div>
        </div>
      )}

      {!isSequenceMode && (
        <div className="adhkar-free-grid">
          {itemsInCategory.map((item) => (
            <button key={item.id} className="adhkar-free-card" onClick={() => tap(item.id, item.target)}>
              <span className="adhkar-text">{item.textAr}</span>
              <span className="adhkar-count">{repo.getCount(item.id)}</span>
            </button>
          ))}
        </div>
      )}

      <p className="muted" style={{ textAlign: 'center', marginTop: 12 }}>
        تُصفَّر العدادات تلقائياً كل يوم جديد.
      </p>
    </div>
  );
}
