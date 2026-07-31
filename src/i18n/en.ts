import type { TranslationShape } from './ar';

const en: TranslationShape = {
  app: { name: 'Afaq Al-Iman' },
  nav: { home: 'Home', quran: 'Quran', azkar: 'Azkar', hadith: 'Hadith', qibla: 'Qibla', settings: 'Settings' },
  home: {
    hijriToday: 'Today',
    nextPrayer: 'Next Prayer',
    remaining: 'Time Remaining',
    prayerTimesTitle: 'Prayer Times',
    fajr: 'Fajr', sunrise: 'Sunrise', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha',
    quranWirdTitle: "Today's Wird",
    khatmaProgress: 'Khatma Progress',
    hadithOfDay: 'Hadith of the Day',
    shortcuts: 'Shortcuts',
    locating: 'Locating...',
    locationError: 'Could not detect location, please select your city manually',
    calcNotice: 'Prayer times are calculated astronomically and may differ by a few minutes from your local official authority.'
  },
  prayer: {
    settingsTitle: 'Prayer Time Settings',
    method: 'Calculation Method',
    madhab: 'Madhab (Asr)',
    shafi: 'Shafi & others', hanafi: 'Hanafi',
    manualAdjust: 'Manual Adjustment (minutes)',
    country: 'Country', city: 'City',
    useGps: 'Use Current Location',
    manualLocation: 'Select Location Manually',
    save: 'Save'
  },
  notifications: {
    title: 'Prayer Notifications',
    perPrayerToggle: 'Enable notification',
    reminderBefore: 'Reminder before prayer',
    none: 'No reminder',
    min5: '5 minutes', min10: '10 minutes', min15: '15 minutes', min30: '30 minutes',
    sound: 'Sound',
    systemSound: 'System sound', athanSound: 'Athan sound', silent: 'Silent',
    dailyNotifTitle: 'Other Daily Notifications',
    morningAzkar: 'Morning Azkar', eveningAzkar: 'Evening Azkar',
    dailyHadith: 'Daily Hadith', wirdReminder: 'Quran Wird Reminder',
    endOfDayReminder: 'End-of-day reminder if wird not completed',
    quietHours: 'Quiet Hours', quietFrom: 'From', quietTo: 'To',
    rescheduleNotice: 'Notifications are automatically rescheduled when location, calculation method, or opening the app changes. To keep notifications reliable after long periods without opening the app following a phone restart, please allow background activity for the app in system settings.'
  },
  qibla: {
    title: 'Qibla Direction',
    degrees: 'Direction in Degrees',
    calibrate: 'Calibrate the compass by moving your phone in a figure-8 motion',
    avoidMetal: 'Stay away from metal objects and magnets for an accurate reading',
    noSensor: "Your device has no compass sensor. Here is the fixed direction in degrees from North:",
    sensorError: 'Could not access the compass sensor'
  },
  quran: {
    title: 'The Holy Quran',
    surahs: 'Surahs', juz: 'Juz', hizb: 'Hizb', pages: 'Pages',
    search: 'Search a surah or ayah',
    lastRead: 'Last Read',
    bookmarks: 'Bookmarks',
    favorites: 'Favorites',
    fontSize: 'Font Size',
    nightMode: 'Night Mode',
    ayah: 'Ayah', juzLabel: 'Juz', hizbLabel: 'Hizb', pageLabel: 'Page',
    sourceNotice: 'The Quran text is sourced from the AlQuran Cloud API (Hafs an Asim narration) and is never edited or AI-generated.',
    loadError: 'Could not load the text, check your internet connection',
    offlineNotice: 'A surah requires internet the first time it is opened, then it is saved for offline reading.'
  },
  khatma: {
    title: 'Khatma Plan',
    setupTitle: 'Set Up a New Plan',
    byDays: 'By number of days', byEndDate: 'By end date', byPagesPerDay: 'By pages per day', byJuzPerWeek: 'By juz per week',
    days: 'Number of days', endDate: 'End date', pagesPerDay: 'Pages/day', juzPerWeek: 'Juz/week',
    todayWird: "Today's Wird", pagesRemainingToday: 'Pages remaining today',
    markComplete: 'Mark as complete', postpone: 'Postpone wird',
    progress: 'Progress', daysLeft: 'Days left',
    history: 'Daily Completion Log',
    redistribute: 'Remaining pages were redistributed over the upcoming days',
    start: 'Start Plan', noPlan: 'No active khatma plan'
  },
  azkar: {
    title: 'Azkar',
    morning: 'Morning Azkar', evening: 'Evening Azkar',
    sleep: 'Sleep Azkar', wake: 'Waking Azkar',
    afterPrayer: 'After-Prayer Azkar', travel: 'Travel Azkar', food: 'Food Azkar', home: 'Home Azkar',
    count: 'Count', reset: 'Reset', done: 'Done',
    source: 'Source', grade: 'Grade',
    vibrate: 'Light vibration on tap'
  },
  hadith: {
    title: 'Hadith',
    dailyHadith: 'Hadith of the Day',
    search: 'Search hadith',
    book: 'Book', chapter: 'Chapter', number: 'Hadith Number',
    favorites: 'Favorites', share: 'Share',
    sourceBukhari: 'Sahih al-Bukhari', sourceMuslim: 'Sahih Muslim',
    loadError: 'Could not load hadith, check your internet connection',
    sourceNotice: 'Hadiths are sourced from Sahih al-Bukhari and Sahih Muslim via a trusted API — no invented text or numbers.'
  },
  settings: {
    title: 'Settings',
    language: 'Language', theme: 'Theme', light: 'Light', dark: 'Dark', system: 'System',
    prayerSettings: 'Prayer Settings',
    notificationSettings: 'Notification Settings',
    about: 'About',
    version: 'Version'
  },
  common: {
    save: 'Save', cancel: 'Cancel', back: 'Back', ok: 'OK', loading: 'Loading...',
    error: 'An error occurred', retry: 'Retry', on: 'On', off: 'Off'
  },
  errors: {
    generic: 'An unexpected error occurred',
    network: 'Please check your internet connection',
    location: 'Could not get your location',
    notificationPermission: 'Please allow notifications from system settings'
  }
};

export default en;
