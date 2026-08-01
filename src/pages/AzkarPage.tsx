import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { useI18n } from '../i18n';
import TopBar from '../components/TopBar';
import SectionHero from '../components/SectionHero';
import { AzkarCategory, azkarByCategory } from '../services/azkarData';
import { getPref, setPref } from '../utils/storage';

const CATEGORIES: AzkarCategory[] = ['morning', 'evening', 'sleep', 'wake', 'afterPrayer', 'travel', 'food', 'home'];

const progressKey = (category: AzkarCategory, id: string) => `afaq.azkar.progress.${category}.${id}`;

const AzkarPage: React.FC = () => {
  const { t } = useI18n();
  const [active, setActive] = useState<AzkarCategory | null>(null);
  const [totals, setTotals] = useState<Record<string, { done: number; total: number }>>({});

  useEffect(() => {
    (async () => {
      const result: Record<string, { done: number; total: number }> = {};
      for (const cat of CATEGORIES) {
        const items = azkarByCategory(cat);
        let done = 0;
        for (const it of items) {
          const v = await getPref<number>(progressKey(cat, it.id));
          if ((v ?? 0) >= it.count) done += 1;
        }
        result[cat] = { done, total: items.length };
      }
      setTotals(result);
    })();
  }, [active]);

  if (active) return <AzkarCounterView category={active} onBack={() => setActive(null)} />;

  return (
    <div className="page">
      <SectionHero image="/images/adhkar/adhkar-hero.webp" title={t.azkar.title} />
      <div className="content">
        <div className="zikr-grid">
          {CATEGORIES.map((cat) => {
            const stat = totals[cat] ?? { done: 0, total: azkarByCategory(cat).length };
            const pct = stat.total ? Math.round((stat.done / stat.total) * 100) : 0;
            return (
              <button key={cat} className="zikr-ring-card" onClick={() => setActive(cat)}>
                <div className="ring" style={{ background: `conic-gradient(var(--gold) ${pct}%, var(--line) 0)` }}>
                  <i>{stat.done}</i>
                  <small>/{stat.total}</small>
                </div>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{(t.azkar as any)[cat]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const AzkarCounterView: React.FC<{ category: AzkarCategory; onBack: () => void }> = ({ category, onBack }) => {
  const { t } = useI18n();
  const items = azkarByCategory(category);
  const [index, setIndex] = useState(0);
  const [counts, setCounts] = useState<number[]>(() => items.map(() => 0));

  useEffect(() => {
    (async () => {
      const loaded = await Promise.all(items.map((it) => getPref<number>(progressKey(category, it.id))));
      setCounts(loaded.map((v) => v ?? 0));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const current = items[index];
  const currentCount = counts[index] ?? 0;
  const remaining = Math.max(0, current.count - currentCount);

  const tap = () => {
    if (remaining <= 0) return;
    const next = currentCount + 1;
    const updated = [...counts];
    updated[index] = next;
    setCounts(updated);
    void setPref(progressKey(category, current.id), next);
    if (navigator.vibrate) navigator.vibrate(12);
    if (next >= current.count && index < items.length - 1) {
      setTimeout(() => setIndex((i) => i + 1), 350);
    }
  };

  const reset = () => {
    const updated = counts.map(() => 0);
    setCounts(updated);
    items.forEach((it) => void setPref(progressKey(category, it.id), 0));
    setIndex(0);
  };

  return (
    <div className="page">
      <TopBar title={(t.azkar as any)[category]} right={<button className="chip" onClick={onBack}>{t.common.back}</button>} />

      <div className="content">
        <div className="glass" style={{ minHeight: 220, display: 'flex', flexDirection: 'column' }}>
          <p className="quran-text" style={{ fontSize: 19, flex: 1 }}>{current.arabic}</p>
          {current.source && <span className="hint">{t.azkar.source}: {current.source}</span>}
        </div>

        <button className="glass" onClick={tap} style={{ width: '100%', textAlign: 'center' }}>
          {remaining <= 0 ? (
            <div className="row" style={{ justifyContent: 'center', color: 'var(--green)' }}>
              <Check /> <span style={{ fontWeight: 700 }}>{t.azkar.done}</span>
            </div>
          ) : (
            <div style={{ fontSize: 40, fontWeight: 800 }}>{remaining}</div>
          )}
          <div className="hint">{t.azkar.count}: {current.count}</div>
        </button>

        <div className="row" style={{ marginTop: 12, gap: 10 }}>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={reset}>{t.azkar.reset}</button>
          <button
            className="btn btn-ghost"
            style={{ flex: 1 }}
            disabled={index >= items.length - 1}
            onClick={() => setIndex((i) => Math.min(items.length - 1, i + 1))}
          >
            {index + 1} / {items.length}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AzkarPage;
