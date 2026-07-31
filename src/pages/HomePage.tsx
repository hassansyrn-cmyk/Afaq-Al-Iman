import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useSettings } from '../context/SettingsContext';
import TopBar from '../components/TopBar';
import CountdownTimer from '../components/CountdownTimer';
import { calculateTimesForDate, getNextPrayer, DayTimes, PrayerKey } from '../services/prayerTimes';
import { gregorianToHijri } from '../utils/hijri';
import { getPlan, KhatmaPlan, progressPercent, todaysTarget, totalCompletedPages } from '../services/khatma';
import { getRandomDailyHadith, HadithItem } from '../services/hadithApi';
import { QuranIcon, AzkarIcon, QiblaIcon, SettingsIcon, LocationIcon } from '../components/Icons';

const PRAYER_ORDER: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

const HomePage: React.FC = () => {
  const { t, lang } = useI18n();
  const { prayerSettings, loaded } = useSettings();
  const [now, setNow] = useState(new Date());
  const [plan, setPlan] = useState<KhatmaPlan | null>(null);
  const [hadith, setHadith] = useState<HadithItem | null>(null);
  const [hadithError, setHadithError] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    getPlan().then(setPlan);
    getRandomDailyHadith(new Date())
      .then((h) => (h ? setHadith(h) : setHadithError(true)))
      .catch(() => setHadithError(true));
  }, []);

  const hijri = useMemo(() => gregorianToHijri(now), [now]);

  const todayTimes: DayTimes | null = useMemo(() => {
    if (!loaded) return null;
    return calculateTimesForDate(prayerSettings, now);
  }, [prayerSettings, loaded, now]);

  const next = useMemo(() => {
    if (!todayTimes) return null;
    const n = getNextPrayer(todayTimes, now);
    if (n) return n;
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tTimes = calculateTimesForDate(prayerSettings, tomorrow);
    return { key: 'fajr' as PrayerKey, time: tTimes.fajr };
  }, [todayTimes, now, prayerSettings]);

  const locale = lang === 'ar' ? 'ar' : 'en';

  return (
    <div className="page">
      <TopBar title={t.app.name} />

      <div className="card" style={{ background: 'linear-gradient(135deg, var(--color-primary), #145C41)', color: '#fff', border: 'none' }}>
        <div className="row" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
          <span className="row" style={{ gap: 4 }}>
            <LocationIcon size={14} />
            {prayerSettings.cityLabel}
          </span>
          <span>
            {hijri.day} {lang === 'ar' ? hijri.monthNameAr : hijri.monthNameEn} {hijri.year}هـ
          </span>
        </div>
        {next && (
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <div style={{ fontSize: 13, opacity: 0.85 }}>{t.home.nextPrayer}</div>
            <div style={{ fontSize: 22, fontWeight: 800, margin: '4px 0' }}>{(t.home as any)[next.key]}</div>
            <CountdownTimer target={next.time} />
          </div>
        )}
      </div>

      <div className="section-title">{t.home.prayerTimesTitle}</div>
      <div className="card">
        <div className="stack">
          {todayTimes &&
            PRAYER_ORDER.map((key) => (
              <div className="row" key={key} style={{ opacity: next?.key === key ? 1 : 0.75, fontWeight: next?.key === key ? 800 : 500 }}>
                <span>{(t.home as any)[key]}</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {todayTimes[key].toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
        </div>
      </div>
      <p className="hint" style={{ margin: '8px 4px 0' }}>{t.home.calcNotice}</p>

      <div className="section-title">{t.home.quranWirdTitle}</div>
      <div className="card">
        {plan ? (
          <>
            <div className="row">
              <span>{t.khatma.todayWird}</span>
              <span style={{ fontWeight: 700 }}>{todaysTarget(plan)} {t.quran.pageLabel}</span>
            </div>
            <div className="progress-track" style={{ marginTop: 10 }}>
              <div className="progress-fill" style={{ width: `${progressPercent(plan)}%` }} />
            </div>
            <div className="row hint" style={{ marginTop: 6 }}>
              <span>{t.home.khatmaProgress}</span>
              <span>{progressPercent(plan)}% ({totalCompletedPages(plan)}/{plan.totalPages})</span>
            </div>
          </>
        ) : (
          <div className="row">
            <span className="hint">{t.khatma.noPlan}</span>
            <Link to="/quran/khatma" className="btn btn-outline">{t.khatma.start}</Link>
          </div>
        )}
      </div>

      <div className="section-title">{t.home.hadithOfDay}</div>
      <div className="card">
        {hadith ? (
          <div className="stack">
            <p className="quran-text" style={{ fontSize: 16, margin: 0 }}>{hadith.arabic}</p>
            <span className="hint">{hadith.bookName} — {t.hadith.number} {hadith.hadithNumber}</span>
          </div>
        ) : hadithError ? (
          <span className="hint">{t.hadith.loadError}</span>
        ) : (
          <span className="hint">{t.common.loading}</span>
        )}
      </div>

      <div className="section-title">{t.home.shortcuts}</div>
      <div className="row" style={{ gap: 10 }}>
        <Link to="/quran" className="card" style={{ flex: 1, textAlign: 'center', textDecoration: 'none', color: 'var(--text-primary)' }}>
          <QuranIcon />
          <div style={{ fontSize: 12, marginTop: 6, fontWeight: 700 }}>{t.nav.quran}</div>
        </Link>
        <Link to="/azkar" className="card" style={{ flex: 1, textAlign: 'center', textDecoration: 'none', color: 'var(--text-primary)' }}>
          <AzkarIcon />
          <div style={{ fontSize: 12, marginTop: 6, fontWeight: 700 }}>{t.nav.azkar}</div>
        </Link>
        <Link to="/qibla" className="card" style={{ flex: 1, textAlign: 'center', textDecoration: 'none', color: 'var(--text-primary)' }}>
          <QiblaIcon />
          <div style={{ fontSize: 12, marginTop: 6, fontWeight: 700 }}>{t.nav.qibla}</div>
        </Link>
        <Link to="/settings" className="card" style={{ flex: 1, textAlign: 'center', textDecoration: 'none', color: 'var(--text-primary)' }}>
          <SettingsIcon />
          <div style={{ fontSize: 12, marginTop: 6, fontWeight: 700 }}>{t.nav.settings}</div>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
