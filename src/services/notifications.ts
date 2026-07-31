import { LocalNotifications } from '@capacitor/local-notifications';
import { calculateTimesForDate, PrayerSettings } from './prayerTimes';
import { NotificationSettings } from '../context/SettingsContext';
import { Lang } from '../i18n';
import ar from '../i18n/ar';
import en from '../i18n/en';

/**
 * Notification IDs are namespaced by day-offset and prayer index so re-scheduling
 * (after a settings change or app open) simply cancels the previous window's IDs
 * before scheduling fresh ones. IMPORTANT LIMITATION: Capacitor's LocalNotifications
 * plugin re-arms exact alarms when Android delivers them, but pure JS/Capacitor
 * cannot guarantee rescheduling for days far in the future after a phone reboot
 * without a small native BroadcastReceiver (Android clears exact alarms on reboot
 * for apps that are not running). This app schedules a rolling 3-day window and
 * re-schedules every time the app is opened or foregrounded, plus registers Android's
 * RECEIVE_BOOT_COMPLETED permission so the OS can restart the app process on boot —
 * but guaranteed silent background rescheduling with zero app opens is not implemented
 * here and would require a custom native Android plugin.
 */

const ROLLING_DAYS = 3;
const BASE_ID_PRAYER = 1000;
const BASE_ID_DAILY = 5000;

const PRAYER_ORDER = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
type NotifiablePrayer = (typeof PRAYER_ORDER)[number];

export async function requestNotificationPermissions(): Promise<boolean> {
  const result = await LocalNotifications.requestPermissions();
  return result.display === 'granted';
}

export async function ensureNotificationChannel(): Promise<void> {
  try {
    await LocalNotifications.createChannel({
      id: 'prayer-times',
      name: 'مواقيت الصلاة / Prayer Times',
      description: 'إشعارات أوقات الصلاة والتذكيرات اليومية',
      importance: 5,
      visibility: 1,
      vibration: true
    });
  } catch {
    // channel API is Android-only; safe to ignore elsewhere
  }
}

function isInQuietHours(date: Date, settings: NotificationSettings): boolean {
  if (!settings.quietHoursEnabled) return false;
  const [fromH, fromM] = settings.quietFrom.split(':').map(Number);
  const [toH, toM] = settings.quietTo.split(':').map(Number);
  const minutes = date.getHours() * 60 + date.getMinutes();
  const from = fromH * 60 + fromM;
  const to = toH * 60 + toM;
  if (from <= to) return minutes >= from && minutes < to;
  return minutes >= from || minutes < to; // wraps past midnight
}

export async function rescheduleAll(
  prayerSettings: PrayerSettings,
  notificationSettings: NotificationSettings,
  lang: Lang
): Promise<void> {
  const t = lang === 'ar' ? ar : en;
  await LocalNotifications.cancel({ notifications: allPossibleIds().map((id) => ({ id })) });

  const toSchedule: {
    id: number; title: string; body: string; schedule: { at: Date }; channelId: string;
  }[] = [];

  const now = new Date();
  for (let dayOffset = 0; dayOffset < ROLLING_DAYS; dayOffset++) {
    const date = new Date(now);
    date.setDate(date.getDate() + dayOffset);
    const times = calculateTimesForDate(prayerSettings, date);

    PRAYER_ORDER.forEach((prayer, prayerIndex) => {
      const conf = notificationSettings.perPrayer[prayer as NotifiablePrayer];
      if (!conf.enabled) return;
      const at = times[prayer as NotifiablePrayer];
      if (at.getTime() <= now.getTime()) return;
      if (isInQuietHours(at, notificationSettings)) return;

      const id = BASE_ID_PRAYER + dayOffset * 100 + prayerIndex;
      toSchedule.push({
        id,
        title: t.app.name,
        body: `${(t.home as any)[prayer]} — ${at.toLocaleTimeString(lang === 'ar' ? 'ar' : 'en', { hour: '2-digit', minute: '2-digit' })}`,
        schedule: { at },
        channelId: 'prayer-times'
      });

      if (conf.reminderMinutesBefore > 0) {
        const reminderAt = new Date(at.getTime() - conf.reminderMinutesBefore * 60000);
        if (reminderAt.getTime() > now.getTime() && !isInQuietHours(reminderAt, notificationSettings)) {
          toSchedule.push({
            id: id + 500,
            title: t.app.name,
            body: `${t.notifications.reminderBefore}: ${(t.home as any)[prayer]}`,
            schedule: { at: reminderAt },
            channelId: 'prayer-times'
          });
        }
      }
    });

    if (dayOffset === 0 || true) {
      // morning/evening azkar + hadith are daily fixed-time reminders
      if (notificationSettings.morningAzkar) {
        pushDaily(toSchedule, BASE_ID_DAILY + dayOffset * 10 + 1, date, 6, 0, t.app.name, t.notifications.morningAzkar, now, notificationSettings);
      }
      if (notificationSettings.eveningAzkar) {
        pushDaily(toSchedule, BASE_ID_DAILY + dayOffset * 10 + 2, date, 17, 30, t.app.name, t.notifications.eveningAzkar, now, notificationSettings);
      }
      if (notificationSettings.dailyHadith) {
        pushDaily(toSchedule, BASE_ID_DAILY + dayOffset * 10 + 3, date, 9, 0, t.app.name, t.notifications.dailyHadith, now, notificationSettings);
      }
      if (notificationSettings.wirdReminder) {
        pushDaily(toSchedule, BASE_ID_DAILY + dayOffset * 10 + 4, date, 8, 0, t.app.name, t.notifications.wirdReminder, now, notificationSettings);
      }
      if (notificationSettings.endOfDayReminder) {
        pushDaily(toSchedule, BASE_ID_DAILY + dayOffset * 10 + 5, date, 22, 0, t.app.name, t.notifications.endOfDayReminder, now, notificationSettings);
      }
    }
  }

  if (toSchedule.length > 0) {
    await LocalNotifications.schedule({ notifications: toSchedule });
  }
}

function pushDaily(
  list: { id: number; title: string; body: string; schedule: { at: Date }; channelId: string }[],
  id: number,
  date: Date,
  hour: number,
  minute: number,
  title: string,
  body: string,
  now: Date,
  notificationSettings: NotificationSettings
) {
  const at = new Date(date);
  at.setHours(hour, minute, 0, 0);
  if (at.getTime() <= now.getTime()) return;
  if (isInQuietHours(at, notificationSettings)) return;
  list.push({ id, title, body, schedule: { at }, channelId: 'prayer-times' });
}

function allPossibleIds(): number[] {
  const ids: number[] = [];
  for (let d = 0; d < ROLLING_DAYS; d++) {
    for (let p = 0; p < PRAYER_ORDER.length; p++) {
      ids.push(BASE_ID_PRAYER + d * 100 + p, BASE_ID_PRAYER + d * 100 + p + 500);
    }
    for (let k = 1; k <= 5; k++) ids.push(BASE_ID_DAILY + d * 10 + k);
  }
  return ids;
}
