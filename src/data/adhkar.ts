export type AdhkarCategory = 'after_prayer' | 'daily' | 'free';

export interface AdhkarItem {
  id: string;
  textAr: string;
  target: number | null; // null = عدّاد حر بلا هدف ثابت
  category: AdhkarCategory;
}

/**
 * أذكار قصيرة ومعروفة بصيغتها المتداولة، بأعداد شائعة الممارسة. لا تُنسب هذه الصيغ
 * هنا لرقم حديث أو كتاب محدد (بخلاف مكتبة الأحاديث في التطبيق) لتفادي أي نسبة غير
 * موثّقة بدقة؛ هي أذكار عامة معروفة عند عموم المسلمين وليست ادعاءً بمصدر أكاديمي.
 */
export const adhkarItems: AdhkarItem[] = [
  // بعد الصلاة — العدد الشائع الأشهر (33/33/34)
  { id: 'after_prayer:subhanallah', textAr: 'سُبْحَانَ اللَّهِ', target: 33, category: 'after_prayer' },
  { id: 'after_prayer:alhamdulillah', textAr: 'الْحَمْدُ لِلَّهِ', target: 33, category: 'after_prayer' },
  { id: 'after_prayer:allahuakbar', textAr: 'اللَّهُ أَكْبَرُ', target: 34, category: 'after_prayer' },

  // صباحاً ومساءً — تسبيح واستغفار من الأذكار الشائعة
  { id: 'daily:subhanallah-wa-bihamdihi', textAr: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', target: 100, category: 'daily' },
  { id: 'daily:astaghfirullah', textAr: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', target: 100, category: 'daily' },

  // عدّاد حر — بلا هدف ثابت، للتسبيح الحر في أي وقت
  { id: 'free:subhanallah', textAr: 'سُبْحَانَ اللَّهِ', target: null, category: 'free' },
  { id: 'free:alhamdulillah', textAr: 'الْحَمْدُ لِلَّهِ', target: null, category: 'free' },
  { id: 'free:allahuakbar', textAr: 'اللَّهُ أَكْبَرُ', target: null, category: 'free' },
  { id: 'free:la-ilaha-illallah', textAr: 'لَا إِلَٰهَ إِلَّا اللَّهُ', target: null, category: 'free' },
  { id: 'free:la-hawla', textAr: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', target: null, category: 'free' },
  { id: 'free:astaghfirullah', textAr: 'أَسْتَغْفِرُ اللَّهَ', target: null, category: 'free' },
];

export const CATEGORY_LABELS: Record<AdhkarCategory, string> = {
  after_prayer: 'بعد الصلاة',
  daily: 'صباحاً ومساءً',
  free: 'تسبيح حر',
};
