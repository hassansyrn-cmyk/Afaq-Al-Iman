import { CalendarDays, CheckCircle2, RotateCcw, Undo2 } from 'lucide-react';
import { useMemo, useState } from 'react';

type KhatmaState = {
  goalDays: number;
  completedDates: string[];
  startedAt: string;
};

const TOTAL_PAGES = 604;
const STORAGE_KEY = 'afaq-khatma-v2';

const todayKey = () => new Date().toISOString().slice(0, 10);

function loadPlan(): KhatmaState {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as KhatmaState | null;
    if (saved?.goalDays && Array.isArray(saved.completedDates)) return saved;
  } catch {}
  return { goalDays: 30, completedDates: [], startedAt: todayKey() };
}

function persist(plan: KhatmaState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
}

export default function KhatmaPage({ image = './images/khatma/khatma-hero.webp', onRead }: { image?: string; onRead?: (page: number) => void }) {
  const [plan, setPlan] = useState<KhatmaState>(loadPlan);
  const pagesPerDay = Math.ceil(TOTAL_PAGES / plan.goalDays);
  const completedDays = plan.completedDates.length;
  const startPage = Math.min(TOTAL_PAGES, completedDays * pagesPerDay + 1);
  const endPage = Math.min(TOTAL_PAGES, startPage + pagesPerDay - 1);
  const pagesRead = Math.min(TOTAL_PAGES, completedDays * pagesPerDay);
  const progress = Math.min(100, Math.round((pagesRead / TOTAL_PAGES) * 100));
  const completedToday = plan.completedDates.includes(todayKey());
  const endDate = useMemo(() => {
    const date = new Date(`${plan.startedAt}T12:00:00`);
    date.setDate(date.getDate() + plan.goalDays - 1);
    return date.toLocaleDateString('ar-AE');
  }, [plan.goalDays, plan.startedAt]);

  const update = (next: KhatmaState) => { setPlan(next); persist(next); };
  const completeToday = () => {
    if (completedToday || progress >= 100) return;
    update({ ...plan, completedDates: [...plan.completedDates, todayKey()] });
  };
  const undoLast = () => update({ ...plan, completedDates: plan.completedDates.slice(0, -1) });
  const reset = () => {
    if (!window.confirm('هل تريد بدء خطة ختمة جديدة وحذف التقدم الحالي؟')) return;
    update({ goalDays: plan.goalDays, completedDates: [], startedAt: todayKey() });
  };

  return <>
    <section className="sectionHero khatmaHero" style={{ backgroundImage: `linear-gradient(90deg,#021c17eb,#04312845),url('${image}')` }}>
      <div><h1>خطة الختمة</h1><p>خطة مرنة مبنية على 604 صفحات</p></div>
    </section>

    <section className="glass khatmaCard">
      <div className="khatmaProgress" style={{ background: `conic-gradient(var(--gold) ${progress}%, var(--line) 0)` }}>
        <div><b>{progress}%</b><span>مكتمل</span></div>
      </div>
      <div className="khatmaToday">
        <small>ورد اليوم</small>
        <h2>من صفحة {startPage} إلى {endPage}</h2>
        <p>{pagesPerDay} صفحة يومياً</p>
      </div>
    </section>

    <section className="glass">
      <label className="khatmaRange">مدة الختمة: <b>{plan.goalDays} يوماً</b>
        <input type="range" min="7" max="365" value={plan.goalDays} onChange={e => update({ ...plan, goalDays: Number(e.target.value) })} />
      </label>
      <div className="khatmaStats">
        <div><b>{completedDays}</b><span>يوم منجز</span></div>
        <div><b>{Math.max(0, plan.goalDays - completedDays)}</b><span>يوم متبقٍ</span></div>
        <div><b>{TOTAL_PAGES - pagesRead}</b><span>صفحة متبقية</span></div>
      </div>
      <p className="khatmaDate"><CalendarDays /> تاريخ الانتهاء المتوقع: {endDate}</p>
      {onRead && <button className="secondary khatmaAction" onClick={() => onRead(startPage)}><CalendarDays /> قراءة ورد اليوم</button>}
      <button className="primary khatmaAction" disabled={completedToday || progress >= 100} onClick={completeToday}><CheckCircle2 /> {completedToday ? 'تم تسجيل ورد اليوم' : 'تسجيل إنجاز اليوم'}</button>
      <button className="secondary khatmaAction" disabled={!completedDays} onClick={undoLast}><Undo2 /> تراجع عن آخر إنجاز</button>
      <button className="khatmaReset" onClick={reset}><RotateCcw /> بدء خطة جديدة</button>
    </section>
  </>;
}
