/**
 * Simple Hijri (Islamic/Gregorian) calendar conversion.
 * Uses the tabular Islamic calendar approximation which is sufficient for display purposes.
 * For production accuracy, consider using a library like hijri-date.
 */

const HIJRI_MONTHS_AR = [
  'محرّم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
  'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
];

const HIJRI_MONTHS_EN = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
  'Jumada al-Ula', 'Jumada al-Akhirah', 'Rajab', 'Sha\'ban',
  'Ramadan', 'Shawwal', 'Dhul Qi\'dah', 'Dhul Hijjah',
];

const HIJRI_DAYS_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const HIJRI_DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Approximate epoch: July 16, 622 CE (Julian) = 1 Muharram 1 AH
const ISLAMIC_EPOCH_MS = -42521587200000; // approx

function intPart(x: number) { return x < 0 ? Math.ceil(x - 1) : Math.floor(x); }

/**
 * Convert Gregorian date to Hijri using the Umm al-Qura-like approximation.
 * Returns { day, month, year }.
 */
export function gregorianToHijri(date: Date): { day: number; month: number; year: number } {
  // Use a simpler but reasonably accurate approach
  const jd = Math.floor(date.getTime() / 86400000) + 2440588; // Julian Day Number
  // Tabular Islamic calendar approximation
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const m = Math.floor((24 * l3) / 709);
  const d = l3 - Math.floor((709 * m) / 24);
  const y = 30 * n + j - 30;
  return { day: d, month: m, year: y };
}

export function formatHijri(date: Date, lang: 'ar' | 'en'): string {
  const h = gregorianToHijri(date);
  if (lang === 'en') {
    return `${HIJRI_DAYS_EN[date.getDay()]}, ${h.day} ${HIJRI_MONTHS_EN[h.month - 1]} ${h.year} AH`;
  }
  return `${HIJRI_DAYS_AR[date.getDay()]}، ${h.day} ${HIJRI_MONTHS_AR[h.month - 1]} ${h.year} هـ`;
}

/** Compact Hijri string for widget */
export function hijriShort(date: Date, lang: 'ar' | 'en'): string {
  const h = gregorianToHijri(date);
  if (lang === 'en') {
    return `${h.day} ${HIJRI_MONTHS_EN[h.month - 1]} ${h.year} AH`;
  }
  return `${h.day} ${HIJRI_MONTHS_AR[h.month - 1]} ${h.year} هـ`;
}