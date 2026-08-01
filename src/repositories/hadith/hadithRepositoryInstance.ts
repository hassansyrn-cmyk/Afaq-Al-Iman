import { HadithRepository } from './HadithRepository';
import { OpenHadithApiProvider } from './OpenHadithApiProvider';
import { SunnahComHadithProvider } from './SunnahComHadithProvider';
import { LocalHadithCache } from './LocalHadithCache';

/**
 * ترتيب الأولوية:
 * 1) OpenHadithApiProvider — مكتبة كاملة فعلية، بلا مفتاح API (fawazahmed0/hadith-api).
 * 2) SunnahComHadithProvider — يُستخدم تلقائياً بدلاً منه فور توفير رابط Backend + مفتاح
 *    (راجع SunnahComHadithProvider.ts)، لأنه مصدر أكثر توثيقاً أكاديمياً.
 * 3) LocalHadithCache — شبكة أمان أخيرة تعمل بلا إنترنت (15 حديث اختبار فقط).
 */
export const hadithRepository = new HadithRepository([
  new OpenHadithApiProvider(),
  new SunnahComHadithProvider(null),
  new LocalHadithCache(),
]);
