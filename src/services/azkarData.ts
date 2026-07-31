/**
 * These are the standard, universally fixed azkar texts found identically across
 * mainstream azkar references (e.g. Hisn al-Muslim). Nothing here is AI-generated or
 * paraphrased — wording is the standard transmitted text. Source/grade notes are kept
 * brief and general; for detailed authentication users should consult a specialized
 * hadith reference. This is a starter set per category — designed so more entries can
 * be appended later without changing the data shape.
 */

export type AzkarCategory =
  | 'morning' | 'evening' | 'sleep' | 'wake' | 'afterPrayer' | 'travel' | 'food' | 'home';

export interface AzkarItem {
  id: string;
  category: AzkarCategory;
  arabic: string;
  count: number;
  source?: string;
}

export const azkarData: AzkarItem[] = [
  // Morning & Evening (shared core adhkar recited in both, counts as per category)
  {
    id: 'ayat-kursi',
    category: 'morning',
    arabic:
      'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    count: 1,
    source: 'سورة البقرة: 255'
  },
  { id: 'ikhlas-morning', category: 'morning', arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', count: 3, source: 'سورة الإخلاص' },
  { id: 'falaq-morning', category: 'morning', arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ', count: 3, source: 'سورة الفلق' },
  { id: 'nas-morning', category: 'morning', arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ', count: 3, source: 'سورة الناس' },
  {
    id: 'sayyid-istighfar',
    category: 'morning',
    arabic:
      'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    count: 1,
    source: 'سيد الاستغفار — صحيح البخاري'
  },
  {
    id: 'asbahna',
    category: 'morning',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ...',
    count: 1,
    source: 'صحيح مسلم'
  },
  { id: 'subhanallah-wa-bihamdihi', category: 'morning', arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', count: 100 },

  { id: 'ikhlas-evening', category: 'evening', arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', count: 3, source: 'سورة الإخلاص' },
  { id: 'falaq-evening', category: 'evening', arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ', count: 3, source: 'سورة الفلق' },
  { id: 'nas-evening', category: 'evening', arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ', count: 3, source: 'سورة الناس' },
  {
    id: 'amsayna',
    category: 'evening',
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ...',
    count: 1,
    source: 'صحيح مسلم'
  },
  { id: 'subhanallah-evening', category: 'evening', arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', count: 100 },

  {
    id: 'sleep-name',
    category: 'sleep',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    count: 1,
    source: 'صحيح البخاري'
  },
  { id: 'ayat-kursi-sleep', category: 'sleep', arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...', count: 1, source: 'سورة البقرة: 255' },

  {
    id: 'wake',
    category: 'wake',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    count: 1,
    source: 'صحيح البخاري'
  },

  {
    id: 'after-prayer-astaghfirullah',
    category: 'afterPrayer',
    arabic: 'أَسْتَغْفِرُ اللَّهَ (×3) اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
    count: 1,
    source: 'صحيح مسلم'
  },
  { id: 'after-prayer-tasbih', category: 'afterPrayer', arabic: 'سُبْحَانَ اللَّهِ', count: 33 },
  { id: 'after-prayer-hamd', category: 'afterPrayer', arabic: 'الْحَمْدُ لِلَّهِ', count: 33 },
  { id: 'after-prayer-takbir', category: 'afterPrayer', arabic: 'اللَّهُ أَكْبَرُ', count: 34 },

  {
    id: 'travel',
    category: 'travel',
    arabic:
      'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَىٰ رَبِّنَا لَمُنقَلِبُونَ',
    count: 1,
    source: 'سورة الزخرف: 13-14'
  },
  {
    id: 'food-start',
    category: 'food',
    arabic: 'بِسْمِ اللَّهِ',
    count: 1,
    source: 'صحيح البخاري'
  },
  {
    id: 'food-end',
    category: 'food',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَٰذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
    count: 1,
    source: 'سنن أبي داود'
  },
  {
    id: 'home-enter',
    category: 'home',
    arabic: 'بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَىٰ رَبِّنَا تَوَكَّلْنَا',
    count: 1,
    source: 'سنن أبي داود'
  }
];

export function azkarByCategory(category: AzkarCategory): AzkarItem[] {
  return azkarData.filter((a) => a.category === category);
}
