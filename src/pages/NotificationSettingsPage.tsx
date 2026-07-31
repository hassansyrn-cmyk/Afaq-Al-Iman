import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useSettings } from '../context/SettingsContext';
import TopBar from '../components/TopBar';
import { NotificationSettings, PerPrayerNotif } from '../context/SettingsContext';
import { requestNotificationPermissions, ensureNotificationChannel, rescheduleAll } from '../services/notifications';

const PRAYERS: (keyof NotificationSettings['perPrayer'])[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const REMINDER_OPTIONS: PerPrayerNotif['reminderMinutesBefore'][] = [0, 5, 10, 15, 30];

const NotificationSettingsPage: React.FC = () => {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { notificationSettings, setNotificationSettings, prayerSettings } = useSettings();
  const [local, setLocal] = useState<NotificationSettings>(notificationSettings);
  const [permissionError, setPermissionError] = useState(false);
  const [saving, setSaving] = useState(false);

  const updatePrayer = (p: keyof NotificationSettings['perPrayer'], patch: Partial<PerPrayerNotif>) => {
    setLocal((s) => ({ ...s, perPrayer: { ...s.perPrayer, [p]: { ...s.perPrayer[p], ...patch } } }));
  };

  const reminderLabel = (v: PerPrayerNotif['reminderMinutesBefore']) => {
    if (v === 0) return t.notifications.none;
    if (v === 5) return t.notifications.min5;
    if (v === 10) return t.notifications.min10;
    if (v === 15) return t.notifications.min15;
    return t.notifications.min30;
  };

  const toggleDaily = (key: keyof NotificationSettings) => {
    setLocal((s) => ({ ...s, [key]: !s[key] }));
  };

  const save = async () => {
    setSaving(true);
    setPermissionError(false);
    const granted = await requestNotificationPermissions();
    if (!granted) {
      setPermissionError(true);
      setSaving(false);
      return;
    }
    await ensureNotificationChannel();
    setNotificationSettings(local);
    await rescheduleAll(prayerSettings, local, lang);
    setSaving(false);
    navigate('/settings');
  };

  return (
    <div className="page">
      <TopBar title={t.notifications.title} right={<button className="chip" onClick={() => navigate('/settings')}>{t.common.back}</button>} />

      {permissionError && <p className="hint" style={{ color: '#c0392b' }}>{t.errors.notificationPermission}</p>}

      <div className="stack">
        {PRAYERS.map((p) => {
          const conf = local.perPrayer[p];
          return (
            <div className="card stack" key={p}>
              <div className="row">
                <span style={{ fontWeight: 700 }}>{(t.home as any)[p]}</span>
                <button className={`switch${conf.enabled ? ' on' : ''}`} onClick={() => updatePrayer(p, { enabled: !conf.enabled })} aria-label="toggle" />
              </div>
              {conf.enabled && (
                <>
                  <div className="row">
                    <span className="hint">{t.notifications.reminderBefore}</span>
                    <select
                      value={conf.reminderMinutesBefore}
                      onChange={(e) => updatePrayer(p, { reminderMinutesBefore: Number(e.target.value) as PerPrayerNotif['reminderMinutesBefore'] })}
                      style={{ width: 140 }}
                    >
                      {REMINDER_OPTIONS.map((v) => (
                        <option key={v} value={v}>{reminderLabel(v)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="row">
                    <span className="hint">{t.notifications.sound}</span>
                    <select value={conf.sound} onChange={(e) => updatePrayer(p, { sound: e.target.value as PerPrayerNotif['sound'] })} style={{ width: 140 }}>
                      <option value="system">{t.notifications.systemSound}</option>
                      <option value="athan">{t.notifications.athanSound}</option>
                      <option value="silent">{t.notifications.silent}</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="section-title">{t.notifications.dailyNotifTitle}</div>
      <div className="card stack">
        {([
          ['morningAzkar', t.notifications.morningAzkar],
          ['eveningAzkar', t.notifications.eveningAzkar],
          ['dailyHadith', t.notifications.dailyHadith],
          ['wirdReminder', t.notifications.wirdReminder],
          ['endOfDayReminder', t.notifications.endOfDayReminder]
        ] as [keyof NotificationSettings, string][]).map(([key, label]) => (
          <div className="row" key={key}>
            <span>{label}</span>
            <button className={`switch${local[key] ? ' on' : ''}`} onClick={() => toggleDaily(key)} aria-label="toggle" />
          </div>
        ))}
      </div>

      <div className="section-title">{t.notifications.quietHours}</div>
      <div className="card stack">
        <div className="row">
          <span>{t.notifications.quietHours}</span>
          <button className={`switch${local.quietHoursEnabled ? ' on' : ''}`} onClick={() => setLocal((s) => ({ ...s, quietHoursEnabled: !s.quietHoursEnabled }))} aria-label="toggle" />
        </div>
        {local.quietHoursEnabled && (
          <div className="row">
            <span className="hint">{t.notifications.quietFrom}</span>
            <input type="time" value={local.quietFrom} onChange={(e) => setLocal((s) => ({ ...s, quietFrom: e.target.value }))} style={{ width: 110 }} />
            <span className="hint">{t.notifications.quietTo}</span>
            <input type="time" value={local.quietTo} onChange={(e) => setLocal((s) => ({ ...s, quietTo: e.target.value }))} style={{ width: 110 }} />
          </div>
        )}
      </div>

      <p className="hint" style={{ margin: '12px 4px' }}>{t.notifications.rescheduleNotice}</p>

      <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={save} disabled={saving}>
        {t.prayer.save}
      </button>
    </div>
  );
};

export default NotificationSettingsPage;
