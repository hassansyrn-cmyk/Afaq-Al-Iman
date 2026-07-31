import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import QuranListPage from './pages/QuranListPage';
import QuranReaderPage from './pages/QuranReaderPage';
import KhatmaPage from './pages/KhatmaPage';
import AzkarPage from './pages/AzkarPage';
import HadithPage from './pages/HadithPage';
import QiblaPage from './pages/QiblaPage';
import SettingsPage from './pages/SettingsPage';
import PrayerSettingsPage from './pages/PrayerSettingsPage';
import NotificationSettingsPage from './pages/NotificationSettingsPage';
import { useSettings } from './context/SettingsContext';
import { useI18n } from './i18n';
import { rescheduleAll, ensureNotificationChannel } from './services/notifications';

const App: React.FC = () => {
  const { prayerSettings, notificationSettings, loaded } = useSettings();
  const { lang } = useI18n();

  // Reschedule the rolling notification window whenever the app becomes active,
  // and once settings finish loading on cold start. This is the app's mechanism
  // for keeping upcoming days' notifications fresh (see services/notifications.ts
  // for the documented limitation around long offline periods after a reboot).
  useEffect(() => {
    if (!loaded) return;
    (async () => {
      await ensureNotificationChannel();
      await rescheduleAll(prayerSettings, notificationSettings, lang);
    })();
  }, [loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const listener = CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive && loaded) {
        void rescheduleAll(prayerSettings, notificationSettings, lang);
      }
    });
    return () => {
      listener.then((l) => l.remove());
    };
  }, [loaded, prayerSettings, notificationSettings, lang]);

  return (
    <HashRouter>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quran" element={<QuranListPage />} />
          <Route path="/quran/khatma" element={<KhatmaPage />} />
          <Route path="/quran/:number" element={<QuranReaderPage />} />
          <Route path="/azkar" element={<AzkarPage />} />
          <Route path="/hadith" element={<HadithPage />} />
          <Route path="/qibla" element={<QiblaPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/prayer" element={<PrayerSettingsPage />} />
          <Route path="/settings/notifications" element={<NotificationSettingsPage />} />
        </Routes>
        <BottomNav />
      </div>
    </HashRouter>
  );
};

export default App;
