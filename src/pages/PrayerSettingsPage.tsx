import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useSettings } from '../context/SettingsContext';
import TopBar from '../components/TopBar';
import { CalcMethodKey, MadhabKey, PrayerSettings } from '../services/prayerTimes';
import { countries } from '../data/locations';
import { getCurrentLocation, reverseGeocode } from '../services/geolocation';
import { rescheduleAll } from '../services/notifications';

const METHODS: CalcMethodKey[] = ['Dubai', 'MWL', 'UmmAlQura', 'Egyptian', 'Karachi', 'NorthAmerica'];
const METHOD_LABELS: Record<CalcMethodKey, string> = {
  Dubai: 'Dubai (GAIAE)',
  MWL: 'Muslim World League',
  UmmAlQura: 'Umm Al-Qura',
  Egyptian: 'Egyptian General Authority',
  Karachi: 'University of Islamic Sciences, Karachi',
  NorthAmerica: 'Islamic Society of North America (ISNA)'
};

const PRAYERS: (keyof PrayerSettings['adjustments'])[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

const PrayerSettingsPage: React.FC = () => {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { prayerSettings, setPrayerSettings, notificationSettings } = useSettings();
  const [local, setLocal] = useState<PrayerSettings>(prayerSettings);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [countryIdx, setCountryIdx] = useState(0);

  const useGps = async () => {
    setLocating(true);
    setLocationError(false);
    try {
      const { latitude, longitude } = await getCurrentLocation();
      const label = (await reverseGeocode(latitude, longitude, lang)) ?? `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
      setLocal((s) => ({ ...s, latitude, longitude, cityLabel: label }));
    } catch {
      setLocationError(true);
    } finally {
      setLocating(false);
    }
  };

  const pickCity = (countryI: number, cityI: number) => {
    const c = countries[countryI].cities[cityI];
    setLocal((s) => ({
      ...s,
      latitude: c.latitude,
      longitude: c.longitude,
      timezone: c.timezone,
      cityLabel: lang === 'ar' ? `${c.nameAr}، ${countries[countryI].nameAr}` : `${c.nameEn}, ${countries[countryI].nameEn}`
    }));
  };

  const save = async () => {
    setPrayerSettings(local);
    await rescheduleAll(local, notificationSettings, lang);
    navigate('/settings');
  };

  return (
    <div className="page">
      <TopBar title={t.prayer.settingsTitle} right={<button className="chip" onClick={() => navigate('/settings')}>{t.common.back}</button>} />

      <div className="section-title">{t.prayer.method}</div>
      <div className="card">
        <select value={local.method} onChange={(e) => setLocal((s) => ({ ...s, method: e.target.value as CalcMethodKey }))}>
          {METHODS.map((m) => (
            <option key={m} value={m}>{METHOD_LABELS[m]}</option>
          ))}
        </select>
      </div>

      <div className="section-title">{t.prayer.madhab}</div>
      <div className="card row" style={{ gap: 8 }}>
        <button className={`chip${local.madhab === 'shafi' ? ' active' : ''}`} style={{ flex: 1 }} onClick={() => setLocal((s) => ({ ...s, madhab: 'shafi' as MadhabKey }))}>{t.prayer.shafi}</button>
        <button className={`chip${local.madhab === 'hanafi' ? ' active' : ''}`} style={{ flex: 1 }} onClick={() => setLocal((s) => ({ ...s, madhab: 'hanafi' as MadhabKey }))}>{t.prayer.hanafi}</button>
      </div>

      <div className="section-title">{local.cityLabel}</div>
      <div className="card stack">
        <button className="btn btn-primary" onClick={useGps} disabled={locating}>
          {locating ? t.home.locating : t.prayer.useGps}
        </button>
        {locationError && <span className="hint">{t.home.locationError}</span>}

        <div className="hint">{t.prayer.manualLocation}</div>
        <select value={countryIdx} onChange={(e) => setCountryIdx(Number(e.target.value))}>
          {countries.map((c, i) => (
            <option key={c.nameEn} value={i}>{lang === 'ar' ? c.nameAr : c.nameEn}</option>
          ))}
        </select>
        <select onChange={(e) => pickCity(countryIdx, Number(e.target.value))} defaultValue="">
          <option value="" disabled>{t.prayer.city}</option>
          {countries[countryIdx].cities.map((c, i) => (
            <option key={c.nameEn} value={i}>{lang === 'ar' ? c.nameAr : c.nameEn}</option>
          ))}
        </select>
      </div>

      <div className="section-title">{t.prayer.manualAdjust}</div>
      <div className="card stack">
        {PRAYERS.map((p) => (
          <div className="row" key={p}>
            <span>{(t.home as any)[p]}</span>
            <input
              type="number"
              style={{ width: 90 }}
              value={local.adjustments[p]}
              onChange={(e) => setLocal((s) => ({ ...s, adjustments: { ...s.adjustments, [p]: Number(e.target.value) } }))}
            />
          </div>
        ))}
      </div>

      <p className="hint" style={{ margin: '10px 4px' }}>{t.home.calcNotice}</p>

      <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={save}>{t.prayer.save}</button>
    </div>
  );
};

export default PrayerSettingsPage;
