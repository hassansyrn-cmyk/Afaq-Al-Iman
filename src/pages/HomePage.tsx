import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, BookOpen, Heart, Compass, Settings as SettingsIcon, ChevronLeft } from 'lucide-react';
import { useI18n } from '../i18n';
import { useSettings } from '../context/SettingsContext';
import SectionHero from '../components/SectionHero';
import CountdownTimer from '../components/CountdownTimer';
import { calculateTimesForDate, getNextPrayer, DayTimes, PrayerKey } from '../services/prayerTimes';
import { gregorianToHijri } from '../utils/hijri';
import { getPlan, KhatmaPlan, progressPercent, todaysTarget, totalCompletedPages } from '../services/khatma';
import { getRandomDailyHadith, HadithItem } from '../services/hadithApi';

const PRAYER_ORDER: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

const prayerHeroImages: Record<PrayerKey, string> = {
  fajr: '/images/home/prayer-fajr.webp',
  sunrise: '/images/home/prayer-sunrise.webp',
  dhuhr: '/images/home/prayer-dhuhr.webp',
  asr: '/images/home/prayer-asr.webp',
  maghrib: '/images/home/prayer-maghrib.webp',
  isha: '/images/home/prayer-isha.webp'
};

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
  const heroImage = next ? prayerHeroImages[next.key] : '/images/home/prayer-hero.webp';

  return (
    <div className="page">
      <SectionHero
        tall
        image={heroImage}
        eyebrow={t.home.nextPrayer}
        title={next ? (t.home as any)[next.key] : ''}
        topRight={
          <div className="row" style={{ width: '100%', color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>
            <span className="row" style={{ gap: 4 }}><MapPin size={13} />{prayerSettings.cityLabel}</span>
            <span>{hijri.day} {lang === 'ar' ? hijri.monthNameAr : hijri.monthNameEn} {hijri.year}هـ</span>
          </div>
        }
      >
        {next && (
          <>
            <div className="prayer-time">{next.time.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="hero-location"><CountdownTimer target={next.time} /></div>
          </>
        )}
      </SectionHero>

      <div className="content">
        <div className="glass">
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
        <p className="hint" style={{ margin: '-6px 4px 14px' }}>{t.home.calcNotice}</p>

        <div className="feature-card">
          <div>
            <small>{t.home.quranWirdTitle}</small>
            {plan ? (
              <h2>{todaysTarget(plan)} {t.quran.pageLabel}</h2>
            ) : (
              <h2 style={{ fontSize: 18 }}>{t.khatma.noPlan}</h2>
            )}
            <p>{plan ? `${t.home.khatmaProgress}: ${progressPercent(plan)}%` : t.khatma.setupTitle}</p>
          </div>
          <div className="orb">{plan ? `${progressPercent(plan)}%` : '—'}</div>
          <Link to="/quran/khatma" className="btn btn-primary">
            {plan ? `${totalCompletedPages(plan)}/${plan.totalPages} ${t.quran.pageLabel}` : t.khatma.start}
          </Link>
        </div>

        <div className="quick-grid">
          <Link to="/quran"><BookOpen /><span>{t.nav.quran}</span></Link>
          <Link to="/azkar"><Heart /><span>{t.nav.azkar}</span></Link>
          <Link to="/qibla"><Compass /><span>{t.nav.qibla}</span></Link>
          <Link to="/settings"><SettingsIcon /><span>{t.nav.settings}</span></Link>
        </div>

        <div className="glass">
          <small>{t.home.hadithOfDay}</small>
          {hadith ? (
            <>
              <p className="quran-text" style={{ fontSize: 17, margin: '8px 0' }}>«{hadith.arabic}»</p>
              <div className="row">
                <em style={{ color: 'var(--muted)', fontStyle: 'normal', fontSize: 12 }}>
                  {hadith.bookName} — {t.hadith.number} {hadith.hadithNumber}
                </em>
                <Link to="/hadith" className="row hint" style={{ textDecoration: 'none' }}>
                  {t.hadith.title} <ChevronLeft size={14} />
                </Link>
              </div>
            </>
          ) : hadithError ? (
            <p className="hint">{t.hadith.loadError}</p>
          ) : (
            <p className="hint">{t.common.loading}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
