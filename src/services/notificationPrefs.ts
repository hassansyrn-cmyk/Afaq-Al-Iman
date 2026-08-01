import type { NotificationPrefs } from '../types';
import { load, save } from './storage';

const KEY = 'notifs:prefs';

const DEFAULTS: NotificationPrefs = {
  prayer: true,
  adhkarMorning: true,
  adhkarEvening: true,
  wird: true,
  wirdIncomplete: true,
  dailyHadith: true,
};

export function getNotificationPrefs(): NotificationPrefs {
  return load<NotificationPrefs>(KEY, DEFAULTS);
}

export function saveNotificationPrefs(prefs: NotificationPrefs): void {
  save(KEY, prefs);
}
