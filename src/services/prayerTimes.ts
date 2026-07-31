import {
  Coordinates,
  CalculationMethod,
  CalculationParameters,
  PrayerTimes,
  Madhab,
  Qibla
} from 'adhan';

export type CalcMethodKey = 'Dubai' | 'MWL' | 'UmmAlQura' | 'Egyptian' | 'Karachi' | 'NorthAmerica';
export type MadhabKey = 'shafi' | 'hanafi';

export interface PrayerSettings {
  method: CalcMethodKey;
  madhab: MadhabKey;
  latitude: number;
  longitude: number;
  timezone: string;
  cityLabel: string;
  // manual per-prayer adjustment in minutes
  adjustments: {
    fajr: number; sunrise: number; dhuhr: number; asr: number; maghrib: number; isha: number;
  };
}

export const DEFAULT_ADJUSTMENTS = { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };

// Default location: Dubai, UAE
export const DEFAULT_SETTINGS: PrayerSettings = {
  method: 'Dubai',
  madhab: 'shafi',
  latitude: 25.2048,
  longitude: 55.2708,
  timezone: 'Asia/Dubai',
  cityLabel: 'دبي، الإمارات العربية المتحدة',
  adjustments: DEFAULT_ADJUSTMENTS
};

function buildParams(settings: PrayerSettings): CalculationParameters {
  let params: CalculationParameters;
  switch (settings.method) {
    case 'MWL':
      params = CalculationMethod.MuslimWorldLeague();
      break;
    case 'UmmAlQura':
      params = CalculationMethod.UmmAlQura();
      break;
    case 'Egyptian':
      params = CalculationMethod.Egyptian();
      break;
    case 'Karachi':
      params = CalculationMethod.Karachi();
      break;
    case 'NorthAmerica':
      params = CalculationMethod.NorthAmerica();
      break;
    case 'Dubai':
    default:
      params = CalculationMethod.Dubai();
      break;
  }
  params.madhab = settings.madhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  return params;
}

export interface DayTimes {
  fajr: Date; sunrise: Date; dhuhr: Date; asr: Date; maghrib: Date; isha: Date;
}

export function calculateTimesForDate(settings: PrayerSettings, date: Date): DayTimes {
  const coords = new Coordinates(settings.latitude, settings.longitude);
  const params = buildParams(settings);
  const pt = new PrayerTimes(coords, date, params);
  const adj = settings.adjustments;
  const withAdj = (d: Date, minutes: number) => new Date(d.getTime() + minutes * 60000);
  return {
    fajr: withAdj(pt.fajr, adj.fajr),
    sunrise: withAdj(pt.sunrise, adj.sunrise),
    dhuhr: withAdj(pt.dhuhr, adj.dhuhr),
    asr: withAdj(pt.asr, adj.asr),
    maghrib: withAdj(pt.maghrib, adj.maghrib),
    isha: withAdj(pt.isha, adj.isha)
  };
}

export type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export function getNextPrayer(times: DayTimes, now: Date): { key: PrayerKey; time: Date } | null {
  const order: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  for (const key of order) {
    if (times[key].getTime() > now.getTime()) {
      return { key, time: times[key] };
    }
  }
  return null; // after isha; caller should compute tomorrow's fajr
}

export function calculateQiblaDirection(latitude: number, longitude: number): number {
  return Qibla(new Coordinates(latitude, longitude));
}
