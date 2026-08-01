import { useState } from 'react';
import { Info, ShieldCheck, BellRing } from 'lucide-react';
import { AboutSheet } from './AboutSheet';
import { PrivacySheet } from './PrivacySheet';
import { useNotificationPermissionState, sendTestNotification } from '../notifications/NotificationOnboarding';
import { getNotificationPrefs, saveNotificationPrefs } from '../../services/notificationPrefs';
import type { NotificationPrefs } from '../../types';

export type SettingsSheet = 'about' | 'privacy' | null;

interface Props {
  openSheet: SettingsSheet;
  onOpenSheet: (sheet: SettingsSheet) => void;
}

const PREF_LABELS: Array<[keyof NotificationPrefs, string]> = [
  ['prayer', 'مواقيت الصلاة'],
  ['adhkarMorning', 'أذكار الصباح'],
  ['adhkarEvening', 'أذكار المساء'],
  ['wird', 'تذكير الورد اليومي'],
  ['wirdIncomplete', 'تذكير آخر اليوم إذا لم يكتمل الورد'],
  ['dailyHadith', 'الحديث اليومي'],
];

export function SettingsPage({ openSheet, onOpenSheet }: Props) {
  const permission = useNotificationPermissionState();
  const [prefs, setPrefs] = useState<NotificationPrefs>(getNotificationPrefs());

  function togglePref(key: keyof NotificationPrefs) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    saveNotificationPrefs(next);
  }

  return (
    <div className="title">
      <h1>الإعدادات</h1>

      <div className="glass">
        <h2>
          <BellRing size={18} /> الإشعارات
        </h2>
        <p className="muted">
          الحالة الحالية:{' '}
          {permission === 'granted' ? 'مفعّلة' : permission === 'denied' ? 'مرفوضة' : 'غير محددة'}
        </p>

        <div className="notif-prefs">
          {PREF_LABELS.map(([key, label]) => (
            <label key={key} className="notif-pref-row">
              <input type="checkbox" checked={prefs[key]} onChange={() => togglePref(key)} />
              {label}
            </label>
          ))}
        </div>

        <button onClick={() => sendTestNotification()}>إرسال إشعار اختباري</button>
      </div>

      <div className="glass">
        <button className="link" onClick={() => onOpenSheet('about')}>
          <Info size={18} /> حول البرنامج
        </button>
        <button className="link" onClick={() => onOpenSheet('privacy')}>
          <ShieldCheck size={18} /> سياسة الخصوصية
        </button>
      </div>

      {openSheet === 'about' && <AboutSheet onClose={() => onOpenSheet(null)} onOpenPrivacy={() => onOpenSheet('privacy')} />}
      {openSheet === 'privacy' && <PrivacySheet onClose={() => onOpenSheet(null)} />}
    </div>
  );
}
