// طبقة تخزين محلي بسيطة وآمنة — تُستخدم بدل استدعاء localStorage مباشرة
// في كل مكان، حتى نتحكم بمعالجة الأخطاء ونمنع الكتابة المفرطة لاحقاً.

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // مثال: تخزين ممتلئ أو غير متاح (وضع خاص). لا نُسقط التطبيق.
    return false;
  }
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* تجاهل */
  }
}

// حفظ مُخفَّف (debounced) لتجنّب الكتابة إلى التخزين عند كل حدث تمرير،
// يُستخدم لحفظ آخر موضع قراءة في القرآن.
export function debouncedSave<T>(key: string, delayMs = 800): (value: T) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (value: T) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => save(key, value), delayMs);
  };
}
