import { Geolocation } from '@capacitor/geolocation';

export interface GeoResult {
  latitude: number;
  longitude: number;
}

export async function getCurrentLocation(): Promise<GeoResult> {
  const perm = await Geolocation.checkPermissions();
  if (perm.location !== 'granted') {
    const req = await Geolocation.requestPermissions();
    if (req.location !== 'granted') throw new Error('permission-denied');
  }
  const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
  return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
}

/** Reverse geocode via OpenStreetMap Nominatim (no key required) to get a readable city label. */
export async function reverseGeocode(lat: number, lon: number, lang: 'ar' | 'en'): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=${lang}`,
      { headers: { 'Accept-Language': lang } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const addr = json.address ?? {};
    const city = addr.city || addr.town || addr.village || addr.county;
    const country = addr.country;
    if (!city && !country) return null;
    return [city, country].filter(Boolean).join('، ');
  } catch {
    return null;
  }
}
