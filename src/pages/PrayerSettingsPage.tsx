import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, MapPin, LocateFixed } from 'lucide-react';
import { useI18n } from '../i18n';
import { useSettings } from '../context/SettingsContext';
import TopBar from '../components/TopBar';
import { CalcMethodKey, MadhabKey, PrayerSettings } from '../services/prayerTimes';
import { cityOptions, CityOption } from '../data/locations';
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
  const [pickerOpen, setPickerOpen] = useState(false);

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

  const pickCity = (c: CityOption) => {
    setLocal((s) => ({
      ...s,
      latitude: c.latitude,
      longitude: c.longitude,
      timezone: c.timezone,
      method: c.defaultMethod,
      cityLabel: lang === 'ar' ? `${c.nameAr}، ${c.countryAr}` : `${c.nameEn}, ${c.countryEn}`
    }));
    setPickerOpen(false);
  };

  const save = async () => {
    setPrayerSettings(local);
    await rescheduleAll(local, notificationSettings, lang);
    navigate('/settings');
  };

  return (
    <div className="page">
      <TopBar title={t.prayer.settingsTitle} right={<button className="chip" onClick={() => navigate('/settings')}>{t.common.back}</button>} />

      <div className="content">
        <div className="section-title" style={{ marginTop: 0 }}>{local.cityLabel}</div>
        <div className="glass stack">
          <button className="btn btn-primary" onClick={useGps} disabled={locating}>
            <LocateFixed size={16} /> {locating ? t.home.locating : t.prayer.useGps}
          </button>
          {locationError && <span className="hint">{t.home.locationError}</span>}
          <button className="btn btn-outline" onClick={() => setPickerOpen(true)}>
            <MapPin size={16} /> {t.prayer.manualLocation}
          </button>
        </div>

        <div className="section-title">{t.prayer.method}</div>
        <div className="glass">
          <select value={local.method} onChange={(e) => setLocal((s) => ({ ...s, method: e.target.value as CalcMethodKey }))}>
            {METHODS.map((m) => (
              <option key={m} value={m}>{METHOD_LABELS[m]}</option>
            ))}
          </select>
        </div>

        <div className="section-title">{t.prayer.madhab}</div>
        <div className="glass row" style={{ gap: 8 }}>
          <button className={`chip${local.madhab === 'shafi' ? ' active' : ''}`} style={{ flex: 1 }} onClick={() => setLocal((s) => ({ ...s, madhab: 'shafi' as MadhabKey }))}>{t.prayer.shafi}</button>
          <button className={`chip${local.madhab === 'hanafi' ? ' active' : ''}`} style={{ flex: 1 }} onClick={() => setLocal((s) => ({ ...s, madhab: 'hanafi' as MadhabKey }))}>{t.prayer.hanafi}</button>
        </div>

        <div className="section-title">{t.prayer.manualAdjust}</div>
        <div className="glass stack">
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

      {pickerOpen && <CityPickerModal onClose={() => setPickerOpen(false)} onPick={pickCity} />}
    </div>
  );
};

const CityPickerModal: React.FC<{ onClose: () => void; onPick: (c: CityOption) => void }> = ({ onClose, onPick }) => {
  const { t, lang } = useI18n();
  const [q, setQ] = useState('');
  const filtered = cityOptions.filter((c) => {
    const hay = `${c.nameAr}${c.nameEn}${c.countryAr}${c.countryEn}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <div className="modal" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-top">
          <h2 style={{ margin: 0, fontSize: 18 }}>{t.prayer.manualLocation}</h2>
          <button onClick={onClose} aria-label="close"><X size={20} /></button>
        </div>
        <div className="glass search-field" style={{ marginBottom: 12 }}>
          <Search size={16} />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.prayer.city} />
        </div>
        <div className="list">
          {filtered.map((c) => (
            <button key={`${c.nameEn}-${c.countryEn}`} className="list-row" style={{ gridTemplateColumns: '1fr auto' }} onClick={() => onPick(c)}>
              <span style={{ fontWeight: 700 }}>{lang === 'ar' ? c.nameAr : c.nameEn}</span>
              <small className="hint">{lang === 'ar' ? c.countryAr : c.countryEn}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrayerSettingsPage;
