import { CalcMethodKey } from '../services/prayerTimes';

export interface CityOption {
  nameAr: string;
  nameEn: string;
  countryAr: string;
  countryEn: string;
  latitude: number;
  longitude: number;
  timezone: string;
  defaultMethod: CalcMethodKey;
}

// A broad set of cities across regions, each with a sensible default calculation
// method for its region (still fully overridable by the user in Prayer Settings).
const raw: [string, string, string, string, number, number, string, CalcMethodKey][] = [
  ['أبوظبي', 'Abu Dhabi', 'الإمارات العربية المتحدة', 'United Arab Emirates', 24.4539, 54.3773, 'Asia/Dubai', 'Dubai'],
  ['دبي', 'Dubai', 'الإمارات العربية المتحدة', 'United Arab Emirates', 25.2048, 55.2708, 'Asia/Dubai', 'Dubai'],
  ['الشارقة', 'Sharjah', 'الإمارات العربية المتحدة', 'United Arab Emirates', 25.3463, 55.4209, 'Asia/Dubai', 'Dubai'],
  ['عجمان', 'Ajman', 'الإمارات العربية المتحدة', 'United Arab Emirates', 25.4052, 55.5136, 'Asia/Dubai', 'Dubai'],
  ['أم القيوين', 'Umm Al Quwain', 'الإمارات العربية المتحدة', 'United Arab Emirates', 25.5647, 55.5552, 'Asia/Dubai', 'Dubai'],
  ['رأس الخيمة', 'Ras Al Khaimah', 'الإمارات العربية المتحدة', 'United Arab Emirates', 25.8007, 55.9762, 'Asia/Dubai', 'Dubai'],
  ['الفجيرة', 'Fujairah', 'الإمارات العربية المتحدة', 'United Arab Emirates', 25.1288, 56.3265, 'Asia/Dubai', 'Dubai'],
  ['العين', 'Al Ain', 'الإمارات العربية المتحدة', 'United Arab Emirates', 24.1302, 55.8023, 'Asia/Dubai', 'Dubai'],

  ['الرياض', 'Riyadh', 'المملكة العربية السعودية', 'Saudi Arabia', 24.7136, 46.6753, 'Asia/Riyadh', 'UmmAlQura'],
  ['مكة المكرمة', 'Makkah', 'المملكة العربية السعودية', 'Saudi Arabia', 21.3891, 39.8579, 'Asia/Riyadh', 'UmmAlQura'],
  ['المدينة المنورة', 'Madinah', 'المملكة العربية السعودية', 'Saudi Arabia', 24.5247, 39.5692, 'Asia/Riyadh', 'UmmAlQura'],
  ['جدة', 'Jeddah', 'المملكة العربية السعودية', 'Saudi Arabia', 21.4858, 39.1925, 'Asia/Riyadh', 'UmmAlQura'],
  ['الدوحة', 'Doha', 'قطر', 'Qatar', 25.2854, 51.531, 'Asia/Qatar', 'UmmAlQura'],
  ['مدينة الكويت', 'Kuwait City', 'الكويت', 'Kuwait', 29.3759, 47.9774, 'Asia/Kuwait', 'UmmAlQura'],
  ['المنامة', 'Manama', 'البحرين', 'Bahrain', 26.2235, 50.5876, 'Asia/Bahrain', 'UmmAlQura'],
  ['مسقط', 'Muscat', 'عُمان', 'Oman', 23.588, 58.3829, 'Asia/Muscat', 'UmmAlQura'],
  ['صنعاء', 'Sanaa', 'اليمن', 'Yemen', 15.3694, 44.191, 'Asia/Aden', 'UmmAlQura'],

  ['عمّان', 'Amman', 'الأردن', 'Jordan', 31.9539, 35.9106, 'Asia/Amman', 'MWL'],
  ['القدس', 'Jerusalem', 'فلسطين', 'Palestine', 31.7683, 35.2137, 'Asia/Jerusalem', 'MWL'],
  ['بيروت', 'Beirut', 'لبنان', 'Lebanon', 33.8938, 35.5018, 'Asia/Beirut', 'MWL'],
  ['دمشق', 'Damascus', 'سوريا', 'Syria', 33.5138, 36.2765, 'Asia/Damascus', 'MWL'],
  ['بغداد', 'Baghdad', 'العراق', 'Iraq', 33.3152, 44.3661, 'Asia/Baghdad', 'MWL'],

  ['القاهرة', 'Cairo', 'مصر', 'Egypt', 30.0444, 31.2357, 'Africa/Cairo', 'Egyptian'],
  ['الإسكندرية', 'Alexandria', 'مصر', 'Egypt', 31.2001, 29.9187, 'Africa/Cairo', 'Egyptian'],
  ['الخرطوم', 'Khartoum', 'السودان', 'Sudan', 15.5007, 32.5599, 'Africa/Khartoum', 'Egyptian'],
  ['طرابلس', 'Tripoli', 'ليبيا', 'Libya', 32.8872, 13.1913, 'Africa/Tripoli', 'Egyptian'],

  ['تونس', 'Tunis', 'تونس', 'Tunisia', 36.8065, 10.1815, 'Africa/Tunis', 'MWL'],
  ['الجزائر', 'Algiers', 'الجزائر', 'Algeria', 36.7538, 3.0588, 'Africa/Algiers', 'MWL'],
  ['الرباط', 'Rabat', 'المغرب', 'Morocco', 34.0209, -6.8416, 'Africa/Casablanca', 'MWL'],
  ['الدار البيضاء', 'Casablanca', 'المغرب', 'Morocco', 33.5731, -7.5898, 'Africa/Casablanca', 'MWL'],
  ['نواكشوط', 'Nouakchott', 'موريتانيا', 'Mauritania', 18.0735, -15.9582, 'Africa/Nouakchott', 'MWL'],
  ['مقديشو', 'Mogadishu', 'الصومال', 'Somalia', 2.0469, 45.3182, 'Africa/Mogadishu', 'MWL'],

  ['لندن', 'London', 'المملكة المتحدة', 'United Kingdom', 51.5074, -0.1278, 'Europe/London', 'MWL'],
  ['باريس', 'Paris', 'فرنسا', 'France', 48.8566, 2.3522, 'Europe/Paris', 'MWL'],
  ['برلين', 'Berlin', 'ألمانيا', 'Germany', 52.52, 13.405, 'Europe/Berlin', 'MWL'],
  ['روما', 'Rome', 'إيطاليا', 'Italy', 41.9028, 12.4964, 'Europe/Rome', 'MWL'],
  ['مدريد', 'Madrid', 'إسبانيا', 'Spain', 40.4168, -3.7038, 'Europe/Madrid', 'MWL'],
  ['إسطنبول', 'Istanbul', 'تركيا', 'Turkey', 41.0082, 28.9784, 'Europe/Istanbul', 'MWL'],
  ['أنقرة', 'Ankara', 'تركيا', 'Turkey', 39.9334, 32.8597, 'Europe/Istanbul', 'MWL'],
  ['موسكو', 'Moscow', 'روسيا', 'Russia', 55.7558, 37.6173, 'Europe/Moscow', 'MWL'],

  ['نيويورك', 'New York', 'الولايات المتحدة', 'United States', 40.7128, -74.006, 'America/New_York', 'NorthAmerica'],
  ['لوس أنجلوس', 'Los Angeles', 'الولايات المتحدة', 'United States', 34.0522, -118.2437, 'America/Los_Angeles', 'NorthAmerica'],
  ['واشنطن', 'Washington DC', 'الولايات المتحدة', 'United States', 38.9072, -77.0369, 'America/New_York', 'NorthAmerica'],
  ['تورونتو', 'Toronto', 'كندا', 'Canada', 43.6532, -79.3832, 'America/Toronto', 'NorthAmerica'],

  ['إسلام آباد', 'Islamabad', 'باكستان', 'Pakistan', 33.6844, 73.0479, 'Asia/Karachi', 'Karachi'],
  ['كراتشي', 'Karachi', 'باكستان', 'Pakistan', 24.8607, 67.0011, 'Asia/Karachi', 'Karachi'],
  ['نيودلهي', 'New Delhi', 'الهند', 'India', 28.6139, 77.209, 'Asia/Kolkata', 'Karachi'],
  ['دكا', 'Dhaka', 'بنغلاديش', 'Bangladesh', 23.8103, 90.4125, 'Asia/Dhaka', 'Karachi'],

  ['كوالالمبور', 'Kuala Lumpur', 'ماليزيا', 'Malaysia', 3.139, 101.6869, 'Asia/Kuala_Lumpur', 'MWL'],
  ['جاكرتا', 'Jakarta', 'إندونيسيا', 'Indonesia', -6.2088, 106.8456, 'Asia/Jakarta', 'MWL'],
  ['سنغافورة', 'Singapore', 'سنغافورة', 'Singapore', 1.3521, 103.8198, 'Asia/Singapore', 'MWL'],

  ['سيدني', 'Sydney', 'أستراليا', 'Australia', -33.8688, 151.2093, 'Australia/Sydney', 'MWL'],
  ['كيب تاون', 'Cape Town', 'جنوب أفريقيا', 'South Africa', -33.9249, 18.4241, 'Africa/Johannesburg', 'MWL'],
  ['نيروبي', 'Nairobi', 'كينيا', 'Kenya', -1.2921, 36.8219, 'Africa/Nairobi', 'MWL']
];

export const cityOptions: CityOption[] = raw.map(
  ([nameAr, nameEn, countryAr, countryEn, latitude, longitude, timezone, defaultMethod]) => ({
    nameAr, nameEn, countryAr, countryEn, latitude, longitude, timezone, defaultMethod
  })
);

export interface CountryGroup {
  nameAr: string;
  nameEn: string;
  cities: CityOption[];
}

export function groupedByCountry(): CountryGroup[] {
  const map = new Map<string, CountryGroup>();
  for (const c of cityOptions) {
    if (!map.has(c.countryEn)) map.set(c.countryEn, { nameAr: c.countryAr, nameEn: c.countryEn, cities: [] });
    map.get(c.countryEn)!.cities.push(c);
  }
  return Array.from(map.values());
}
