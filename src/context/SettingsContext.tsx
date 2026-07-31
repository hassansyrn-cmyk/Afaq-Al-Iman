import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getPref, setPref } from '../utils/storage';
import { DEFAULT_SETTINGS, PrayerSettings } from '../services/prayerTimes';

export interface PerPrayerNotif {
  enabled: boolean;
  reminderMinutesBefore: 0 | 5 | 10 | 15 | 30;
  sound: 'system' | 'athan' | 'silent';
}

export interface NotificationSettings {
  perPrayer: Record<'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha', PerPrayerNotif>;
  morningAzkar: boolean;
  eveningAzkar: boolean;
  dailyHadith: boolean;
  wirdReminder: boolean;
  endOfDayReminder: boolean;
  quietHoursEnabled: boolean;
  quietFrom: string; // "HH:mm"
  quietTo: string;
}

const DEFAULT_PER_PRAYER: PerPrayerNotif = { enabled: true, reminderMinutesBefore: 0, sound: 'system' };

export const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  perPrayer: {
    fajr: { ...DEFAULT_PER_PRAYER },
    dhuhr: { ...DEFAULT_PER_PRAYER },
    asr: { ...DEFAULT_PER_PRAYER },
    maghrib: { ...DEFAULT_PER_PRAYER },
    isha: { ...DEFAULT_PER_PRAYER }
  },
  morningAzkar: true,
  eveningAzkar: true,
  dailyHadith: true,
  wirdReminder: true,
  endOfDayReminder: true,
  quietHoursEnabled: false,
  quietFrom: '22:00',
  quietTo: '06:00'
};

interface SettingsContextValue {
  prayerSettings: PrayerSettings;
  setPrayerSettings: (s: PrayerSettings) => void;
  notificationSettings: NotificationSettings;
  setNotificationSettings: (s: NotificationSettings) => void;
  loaded: boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);
const PRAYER_KEY = 'afaq.prayerSettings';
const NOTIF_KEY = 'afaq.notificationSettings';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prayerSettings, setPrayerSettingsState] = useState<PrayerSettings>(DEFAULT_SETTINGS);
  const [notificationSettings, setNotificationSettingsState] = useState<NotificationSettings>(DEFAULT_NOTIFICATIONS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const savedPrayer = await getPref<PrayerSettings>(PRAYER_KEY);
      const savedNotif = await getPref<NotificationSettings>(NOTIF_KEY);
      if (savedPrayer) setPrayerSettingsState(savedPrayer);
      if (savedNotif) setNotificationSettingsState(savedNotif);
      setLoaded(true);
    })();
  }, []);

  const setPrayerSettings = (s: PrayerSettings) => {
    setPrayerSettingsState(s);
    void setPref(PRAYER_KEY, s);
  };

  const setNotificationSettings = (s: NotificationSettings) => {
    setNotificationSettingsState(s);
    void setPref(NOTIF_KEY, s);
  };

  const value = useMemo(
    () => ({ prayerSettings, setPrayerSettings, notificationSettings, setNotificationSettings, loaded }),
    [prayerSettings, notificationSettings, loaded]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
