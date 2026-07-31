export interface CityOption {
  nameAr: string;
  nameEn: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface CountryOption {
  nameAr: string;
  nameEn: string;
  cities: CityOption[];
}

export const countries: CountryOption[] = [
  {
    nameAr: 'الإمارات العربية المتحدة', nameEn: 'United Arab Emirates',
    cities: [
      { nameAr: 'دبي', nameEn: 'Dubai', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai' },
      { nameAr: 'أبوظبي', nameEn: 'Abu Dhabi', latitude: 24.4539, longitude: 54.3773, timezone: 'Asia/Dubai' },
      { nameAr: 'الشارقة', nameEn: 'Sharjah', latitude: 25.3463, longitude: 55.4209, timezone: 'Asia/Dubai' },
      { nameAr: 'العين', nameEn: 'Al Ain', latitude: 24.2075, longitude: 55.7447, timezone: 'Asia/Dubai' },
      { nameAr: 'رأس الخيمة', nameEn: 'Ras Al Khaimah', latitude: 25.7895, longitude: 55.9432, timezone: 'Asia/Dubai' },
      { nameAr: 'الفجيرة', nameEn: 'Fujairah', latitude: 25.1288, longitude: 56.3265, timezone: 'Asia/Dubai' },
      { nameAr: 'عجمان', nameEn: 'Ajman', latitude: 25.4052, longitude: 55.5136, timezone: 'Asia/Dubai' },
      { nameAr: 'أم القيوين', nameEn: 'Umm Al Quwain', latitude: 25.5647, longitude: 55.5533, timezone: 'Asia/Dubai' }
    ]
  },
  {
    nameAr: 'المملكة العربية السعودية', nameEn: 'Saudi Arabia',
    cities: [
      { nameAr: 'الرياض', nameEn: 'Riyadh', latitude: 24.7136, longitude: 46.6753, timezone: 'Asia/Riyadh' },
      { nameAr: 'مكة المكرمة', nameEn: 'Makkah', latitude: 21.3891, longitude: 39.8579, timezone: 'Asia/Riyadh' },
      { nameAr: 'المدينة المنورة', nameEn: 'Madinah', latitude: 24.5247, longitude: 39.5692, timezone: 'Asia/Riyadh' },
      { nameAr: 'جدة', nameEn: 'Jeddah', latitude: 21.5433, longitude: 39.1728, timezone: 'Asia/Riyadh' },
      { nameAr: 'الدمام', nameEn: 'Dammam', latitude: 26.4207, longitude: 50.0888, timezone: 'Asia/Riyadh' }
    ]
  },
  {
    nameAr: 'مصر', nameEn: 'Egypt',
    cities: [
      { nameAr: 'القاهرة', nameEn: 'Cairo', latitude: 30.0444, longitude: 31.2357, timezone: 'Africa/Cairo' },
      { nameAr: 'الإسكندرية', nameEn: 'Alexandria', latitude: 31.2001, longitude: 29.9187, timezone: 'Africa/Cairo' },
      { nameAr: 'الجيزة', nameEn: 'Giza', latitude: 30.0131, longitude: 31.2089, timezone: 'Africa/Cairo' }
    ]
  },
  {
    nameAr: 'الكويت', nameEn: 'Kuwait',
    cities: [{ nameAr: 'مدينة الكويت', nameEn: 'Kuwait City', latitude: 29.3759, longitude: 47.9774, timezone: 'Asia/Kuwait' }]
  },
  {
    nameAr: 'قطر', nameEn: 'Qatar',
    cities: [{ nameAr: 'الدوحة', nameEn: 'Doha', latitude: 25.2854, longitude: 51.531, timezone: 'Asia/Qatar' }]
  },
  {
    nameAr: 'البحرين', nameEn: 'Bahrain',
    cities: [{ nameAr: 'المنامة', nameEn: 'Manama', latitude: 26.2285, longitude: 50.586, timezone: 'Asia/Bahrain' }]
  },
  {
    nameAr: 'عُمان', nameEn: 'Oman',
    cities: [{ nameAr: 'مسقط', nameEn: 'Muscat', latitude: 23.588, longitude: 58.3829, timezone: 'Asia/Muscat' }]
  },
  {
    nameAr: 'الأردن', nameEn: 'Jordan',
    cities: [{ nameAr: 'عمّان', nameEn: 'Amman', latitude: 31.9454, longitude: 35.9284, timezone: 'Asia/Amman' }]
  },
  {
    nameAr: 'المملكة المتحدة', nameEn: 'United Kingdom',
    cities: [{ nameAr: 'لندن', nameEn: 'London', latitude: 51.5072, longitude: -0.1276, timezone: 'Europe/London' }]
  },
  {
    nameAr: 'الولايات المتحدة', nameEn: 'United States',
    cities: [
      { nameAr: 'نيويورك', nameEn: 'New York', latitude: 40.7128, longitude: -74.006, timezone: 'America/New_York' },
      { nameAr: 'لوس أنجلوس', nameEn: 'Los Angeles', latitude: 34.0522, longitude: -118.2437, timezone: 'America/Los_Angeles' }
    ]
  }
];
