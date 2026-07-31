import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import TopBar from '../components/TopBar';
import { AzkarCategory, azkarByCategory } from '../services/azkarData';
import { getPref, setPref } from '../utils/storage';
import { CheckIcon } from '../components/Icons';

const CATEGORIES: AzkarCategory[] = ['morning', 'evening', 'sleep', 'wake', 'afterPrayer', 'travel', 'food', 'home'];

const progressKey = (category: AzkarCategory, id: string) => `afaq.azkar.progress.${category}.${id}`;

const AzkarPage: React.FC = () => {
  const { t } = useI18n();
  const [active, setActive] = useState<AzkarCategory | null>(null);

  if (active) return <AzkarCounterView category={active} onBack={() => setActive(null)} />;

  return (
    <div className="page">
      <TopBar title={t.azkar.title} />
      <div className="stack">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className="card row"
            style={{ cursor: 'pointer', textAlign: 'start' }}
            onClick={() => setActive(cat)}
          >
            <span style={{ fontWeight: 700 }}>{(t.azkar as any)[cat]}</span>
            <span className="hint">{azkarByCategory(cat).length}</span>
          </button>
        ))}
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

      <div className="card" style={{ minHeight: 260, display: 'flex', flexDirection: 'column' }}>
        <p className="quran-text" style={{ fontSize: 19, flex: 1 }}>{current.arabic}</p>
        {current.source && <span className="hint">{t.azkar.source}: {current.source}</span>}
      </div>

      <button className="card" onClick={tap} style={{ width: '100%', marginTop: 12, textAlign: 'center', cursor: 'pointer' }}>
        {remaining <= 0 ? (
          <div className="row" style={{ justifyContent: 'center', color: 'var(--accent)' }}>
            <CheckIcon /> <span style={{ fontWeight: 700 }}>{t.azkar.done}</span>
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
  );
};

export default AzkarPage;
