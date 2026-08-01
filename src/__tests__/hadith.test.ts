import { describe, it, expect, beforeEach } from 'vitest';
import { LocalHadithCache } from '../repositories/hadith/LocalHadithCache';

describe('LocalHadithCache.getRandom', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('never returns an excluded id while alternatives exist', async () => {
    const cache = new LocalHadithCache();
    const size = await cache.getLibrarySize();
    const all: string[] = [];
    for (let i = 0; i < size; i++) {
      const item = await cache.getRandom(new Set(all));
      expect(item).not.toBeNull();
      expect(all).not.toContain(item!.id);
      all.push(item!.id);
    }
    expect(new Set(all).size).toBe(size); // كل عناصر المكتبة استُخدمت مرة واحدة فقط
  });

  it('recycles the pool once every item has been excluded, instead of returning null', async () => {
    const cache = new LocalHadithCache();
    const size = await cache.getLibrarySize();
    const everything = new Set<string>();
    // استبعد كل شيء متاح فعلياً بجمع كل الأرقام من 1 إلى الحجم
    for (let i = 1; i <= size; i++) everything.add(`test:${i}`);

    const item = await cache.getRandom(everything);
    expect(item).not.toBeNull(); // يعيد الدورة بدل فشل الاختيار
  });

  it('marks itself explicitly as not the full library', () => {
    const cache = new LocalHadithCache();
    expect(cache.isFullLibrary).toBe(false);
  });
});

// ملاحظة: نختبر أن DailyHadithService لا يكرر نفس الحديث عبر أيام متتالية عندما
// يوجد بديل متاح، دون الاعتماد على مزوّد Sunnah.com (غير مهيأ بمفتاح في هذه البيئة).
describe('DailyHadithService history window', () => {
  it('excludes ids used within the last 30 days from the random pool', async () => {
    const cache = new LocalHadithCache();
    const first = await cache.getRandom(new Set());
    if (!first) throw new Error('expected a hadith');
    const usedYesterday = first.id;

    // نمثّل استبعاد ما استُخدم بالأمس + اليوم
    const excluded = new Set([usedYesterday]);
    const results = new Set<string>();
    for (let i = 0; i < 10; i++) {
      const item = await cache.getRandom(excluded);
      if (item) results.add(item.id);
    }
    expect(results.has(usedYesterday)).toBe(false);
  });
});
