/**
 * Gregorian -> Hijri conversion using the well-known tabular ("Kuwaiti") algorithm.
 * This is a deterministic arithmetic calendar conversion, not religious text — it is
 * an approximation and can be off by a day from local moon-sighting announcements.
 */

const HIJRI_MONTHS_AR = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة',
  'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];

const HIJRI_MONTHS_EN = [
  'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani", 'Jumada al-Awwal', 'Jumada al-Thani',
  'Rajab', "Sha'ban", 'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah'
];

export interface HijriDate {
  day: number;
  month: number; // 1-12
  year: number;
  monthNameAr: string;
  monthNameEn: string;
}

export function gregorianToHijri(date: Date): HijriDate {
  const jd = gregorianToJulianDay(date);
  return julianDayToHijri(jd);
}

function gregorianToJulianDay(date: Date): number {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const a = Math.floor((14 - m) / 12);
  const y2 = y + 4800 - a;
  const m2 = m + 12 * a - 3;
  return (
    d +
    Math.floor((153 * m2 + 2) / 5) +
    365 * y2 +
    Math.floor(y2 / 4) -
    Math.floor(y2 / 100) +
    Math.floor(y2 / 400) -
    32045
  );
}

function julianDayToHijri(jd: number): HijriDate {
  const islamicEpoch = 1948439.5;
  const daysSinceEpoch = jd - islamicEpoch + 1;
  const cycles = Math.floor((daysSinceEpoch - 1) / 10631);
  let remaining = daysSinceEpoch - cycles * 10631;
  let year = cycles * 30 + 1;

  while (true) {
    const yearLength = isHijriLeapYear(year) ? 355 : 354;
    if (remaining <= yearLength) break;
    remaining -= yearLength;
    year += 1;
  }

  let month = 1;
  while (true) {
    const monthLength = hijriMonthLength(month, year);
    if (remaining <= monthLength) break;
    remaining -= monthLength;
    month += 1;
  }

  const day = Math.max(1, Math.round(remaining));
  return {
    day,
    month,
    year,
    monthNameAr: HIJRI_MONTHS_AR[month - 1],
    monthNameEn: HIJRI_MONTHS_EN[month - 1]
  };
}

function isHijriLeapYear(year: number): boolean {
  return (11 * year + 14) % 30 < 11;
}

function hijriMonthLength(month: number, year: number): number {
  if (month === 12) return isHijriLeapYear(year) ? 30 : 29;
  return month % 2 === 1 ? 30 : 29;
}
