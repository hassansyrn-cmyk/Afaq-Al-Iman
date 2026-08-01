import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';
import TopBar from '../components/TopBar';
import SectionHero from '../components/SectionHero';
import {
  KhatmaPlan, KhatmaSetupMode, createPlan, getPlan, markTodayComplete, postponeToday,
  progressPercent, daysRemaining, todaysTarget
} from '../services/khatma';

const KhatmaPage: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<KhatmaPlan | null>(null);
  const [mode, setMode] = useState<KhatmaSetupMode>('byDays');
  const [value, setValue] = useState('30');
  const [pagesToday, setPagesToday] = useState('');

  useEffect(() => { getPlan().then(setPlan); }, []);

  const modes: { key: KhatmaSetupMode; label: string }[] = [
    { key: 'byDays', label: t.khatma.byDays },
    { key: 'byEndDate', label: t.khatma.byEndDate },
    { key: 'byPagesPerDay', label: t.khatma.byPagesPerDay },
    { key: 'byJuzPerWeek', label: t.khatma.byJuzPerWeek }
  ];

  const start = async () => {
    const p = await createPlan(mode, mode === 'byEndDate' ? value : Number(value));
    setPlan(p);
  };

  const complete = async () => {
    const target = todaysTarget(plan!);
    const pages = pagesToday ? Number(pagesToday) : target;
    const updated = await markTodayComplete(pages);
    setPlan(updated);
    setPagesToday('');
  };

  const postpone = async () => {
    const updated = await postponeToday();
    setPlan(updated);
  };

  return (
    <div className="page">
      {plan ? (
        <TopBar title={t.khatma.title} right={<button className="chip" onClick={() => navigate('/quran')}>{t.common.back}</button>} />
      ) : (
        <SectionHero image="/images/khatma/khatma-hero.webp" title={t.khatma.title} subtitle={t.khatma.setupTitle} />
      )}

      <div className="content">
        {plan ? (
          <div className="stack">
            <div className="glass">
              <div className="progress-track"><div className="progress-fill" style={{ width: `${progressPercent(plan)}%` }} /></div>
              <div className="row hint" style={{ marginTop: 8 }}>
                <span>{t.khatma.progress}: {progressPercent(plan)}%</span>
                <span>{t.khatma.daysLeft}: {daysRemaining(plan)}</span>
              </div>
            </div>

            <div className="glass">
              <div className="row"><span>{t.khatma.todayWird}</span><span style={{ fontWeight: 700 }}>{todaysTarget(plan)} {t.quran.pageLabel}</span></div>
              <input
                type="number"
                placeholder={t.khatma.pagesRemainingToday}
                value={pagesToday}
                onChange={(e) => setPagesToday(e.target.value)}
                style={{ marginTop: 10 }}
              />
              <div className="row" style={{ gap: 10, marginTop: 10 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={complete}>{t.khatma.markComplete}</button>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={postpone}>{t.khatma.postpone}</button>
              </div>
            </div>

            <div className="glass">
              <div className="section-title" style={{ margin: '0 0 8px' }}>{t.khatma.history}</div>
              <div className="stack">
                {Object.entries(plan.completedLog).sort((a, b) => (a[0] < b[0] ? 1 : -1)).slice(0, 14).map(([date, pages]) => (
                  <div key={date} className="row hint"><span>{date}</span><span>{pages} {t.quran.pageLabel}</span></div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="glass stack">
            <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
              {modes.map((m) => (
                <button key={m.key} className={`chip${mode === m.key ? ' active' : ''}`} onClick={() => setMode(m.key)}>{m.label}</button>
              ))}
            </div>
            {mode === 'byEndDate' ? (
              <input type="date" value={value} onChange={(e) => setValue(e.target.value)} />
            ) : (
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={
                  mode === 'byDays' ? t.khatma.days : mode === 'byPagesPerDay' ? t.khatma.pagesPerDay : t.khatma.juzPerWeek
                }
              />
            )}
            <button className="btn btn-primary" onClick={start}>{t.khatma.start}</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KhatmaPage;
