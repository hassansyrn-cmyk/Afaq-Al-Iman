const ar = {
  app: { name: 'آفاق الإيمان' },
  nav: { home: 'الرئيسية', quran: 'القرآن', azkar: 'الأذكار', hadith: 'الأحاديث', qibla: 'القبلة', settings: 'الإعدادات' },
  home: {
    hijriToday: 'اليوم الموافق',
    nextPrayer: 'الصلاة القادمة',
    remaining: 'الوقت المتبقي',
    prayerTimesTitle: 'مواقيت الصلاة',
    fajr: 'الفجر', sunrise: 'الشروق', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء',
    quranWirdTitle: 'الورد اليومي',
    khatmaProgress: 'نسبة تقدم الختمة',
    hadithOfDay: 'حديث اليوم',
    shortcuts: 'اختصارات',
    locating: 'جارٍ تحديد الموقع...',
    locationError: 'تعذر تحديد الموقع، يرجى اختيار المدينة يدويًا',
    calcNotice: 'المواقيت محسوبة فلكيًا وقد تختلف بدقائق قليلة عن الجهة الرسمية في بلدك.'
  },
  prayer: {
    settingsTitle: 'إعدادات مواقيت الصلاة',
    method: 'طريقة الحساب',
    madhab: 'المذهب (العصر)',
    shafi: 'الشافعي وغيره', hanafi: 'الحنفي',
    manualAdjust: 'تعديل يدوي (بالدقائق)',
    country: 'الدولة', city: 'المدينة',
    useGps: 'استخدام الموقع الحالي',
    manualLocation: 'اختيار الموقع يدويًا',
    save: 'حفظ'
  },
  notifications: {
    title: 'إشعارات الصلاة',
    perPrayerToggle: 'تفعيل إشعار الصلاة',
    reminderBefore: 'تذكير قبل الصلاة',
    none: 'بدون تذكير',
    min5: '5 دقائق', min10: '10 دقائق', min15: '15 دقيقة', min30: '30 دقيقة',
    sound: 'الصوت',
    systemSound: 'صوت النظام', athanSound: 'صوت الأذان', silent: 'صامت',
    dailyNotifTitle: 'إشعارات يومية أخرى',
    morningAzkar: 'أذكار الصباح', eveningAzkar: 'أذكار المساء',
    dailyHadith: 'حديث يومي', wirdReminder: 'تذكير الورد القرآني',
    endOfDayReminder: 'تذكير آخر اليوم عند عدم إكمال الورد',
    quietHours: 'الساعات الهادئة', quietFrom: 'من', quietTo: 'إلى',
    rescheduleNotice: 'يتم إعادة جدولة التنبيهات تلقائيًا عند تغيير الموقع أو طريقة الحساب أو عند فتح التطبيق. لضمان استمرار عمل التنبيهات بعد إعادة تشغيل الهاتف لفترات طويلة دون فتح التطبيق، يوصى بالسماح للتطبيق بالعمل في الخلفية من إعدادات النظام.'
  },
  qibla: {
    title: 'اتجاه القبلة',
    degrees: 'الاتجاه بالدرجات',
    calibrate: 'قم بمعايرة البوصلة بتحريك الهاتف على شكل الرقم 8',
    avoidMetal: 'ابتعد عن الأجسام المعدنية والمغناطيسية للحصول على قراءة دقيقة',
    noSensor: 'جهازك لا يحتوي على مستشعر بوصلة. إليك الاتجاه الثابت بالدرجات من الشمال:',
    sensorError: 'تعذر الوصول إلى مستشعر البوصلة'
  },
  quran: {
    title: 'القرآن الكريم',
    surahs: 'السور', juz: 'الأجزاء', hizb: 'الأحزاب', pages: 'الصفحات',
    search: 'بحث عن سورة أو آية',
    lastRead: 'آخر قراءة',
    bookmarks: 'العلامات المرجعية',
    favorites: 'المفضلة',
    fontSize: 'حجم الخط',
    nightMode: 'الوضع الليلي',
    ayah: 'آية', juzLabel: 'جزء', hizbLabel: 'حزب', pageLabel: 'صفحة',
    sourceNotice: 'النص القرآني مصدره واجهة AlQuran Cloud (رواية حفص عن عاصم) ولا يتم تعديله أو توليده بالذكاء الاصطناعي.',
    loadError: 'تعذر تحميل النص، تحقق من الاتصال بالإنترنت',
    offlineNotice: 'يتطلب تحميل السورة اتصالاً بالإنترنت أول مرة، ثم تُحفظ للقراءة دون اتصال.'
  },
  khatma: {
    title: 'خطة ختم القرآن',
    setupTitle: 'إعداد خطة جديدة',
    byDays: 'حسب عدد الأيام', byEndDate: 'حسب تاريخ الانتهاء', byPagesPerDay: 'حسب عدد الصفحات يوميًا', byJuzPerWeek: 'حسب عدد الأجزاء أسبوعيًا',
    days: 'عدد الأيام', endDate: 'تاريخ الانتهاء', pagesPerDay: 'صفحات/يوم', juzPerWeek: 'أجزاء/أسبوع',
    todayWird: 'ورد اليوم', pagesRemainingToday: 'صفحات متبقية اليوم',
    markComplete: 'تسجيل كمكتمل', postpone: 'تأجيل الورد',
    progress: 'نسبة الإنجاز', daysLeft: 'الأيام المتبقية',
    history: 'سجل الإنجاز اليومي',
    redistribute: 'تمت إعادة توزيع الصفحات المتبقية على الأيام القادمة',
    start: 'بدء الخطة', noPlan: 'لا توجد خطة ختم حاليًا'
  },
  azkar: {
    title: 'الأذكار',
    morning: 'أذكار الصباح', evening: 'أذكار المساء',
    sleep: 'أذكار النوم', wake: 'أذكار الاستيقاظ',
    afterPrayer: 'أذكار بعد الصلاة', travel: 'أذكار السفر', food: 'أذكار الطعام', home: 'أذكار المنزل',
    count: 'العدد', reset: 'إعادة ضبط', done: 'تم',
    source: 'المصدر', grade: 'الدرجة',
    vibrate: 'اهتزاز خفيف عند الضغط'
  },
  hadith: {
    title: 'الأحاديث',
    dailyHadith: 'حديث اليوم',
    search: 'بحث في الأحاديث',
    book: 'الكتاب', chapter: 'الباب', number: 'رقم الحديث',
    favorites: 'المفضلة', share: 'مشاركة',
    sourceBukhari: 'صحيح البخاري', sourceMuslim: 'صحيح مسلم',
    loadError: 'تعذر تحميل الحديث، تحقق من الاتصال بالإنترنت',
    sourceNotice: 'الأحاديث مصدرها صحيح البخاري وصحيح مسلم عبر واجهة برمجية موثوقة، ولا يتم اختراع نصوص أو أرقام أحاديث.'
  },
  settings: {
    title: 'الإعدادات',
    language: 'اللغة', theme: 'المظهر', light: 'فاتح', dark: 'داكن', system: 'حسب النظام',
    prayerSettings: 'إعدادات الصلاة',
    notificationSettings: 'إعدادات الإشعارات',
    about: 'حول التطبيق',
    version: 'الإصدار'
  },
  common: {
    save: 'حفظ', cancel: 'إلغاء', back: 'رجوع', ok: 'موافق', loading: 'جارٍ التحميل...',
    error: 'حدث خطأ', retry: 'إعادة المحاولة', on: 'مفعّل', off: 'غير مفعّل'
  },
  errors: {
    generic: 'حدث خطأ غير متوقع',
    network: 'تحقق من اتصالك بالإنترنت',
    location: 'تعذر الحصول على الموقع',
    notificationPermission: 'يرجى السماح بالإشعارات من إعدادات النظام'
  }
};

export default ar;
export type TranslationShape = typeof ar;
