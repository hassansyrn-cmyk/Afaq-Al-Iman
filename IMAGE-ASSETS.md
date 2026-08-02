# Afaq Al-Iman Image Assets

حزمة صور جاهزة للنسخ إلى مستودع تطبيق آفاق الإيمان.

## الملفات الجاهزة للاستخدام

### الصفحة الرئيسية ومواقيت الصلاة
- `public/images/home/prayer-hero.webp`
- `public/images/home/prayer-fajr.webp`
- `public/images/home/prayer-sunrise.webp`
- `public/images/home/prayer-dhuhr.webp`
- `public/images/home/prayer-asr.webp`
- `public/images/home/prayer-maghrib.webp`
- `public/images/home/prayer-isha.webp`

### الأقسام
- `public/images/quran/quran-hero.webp`
- `public/images/khatma/khatma-hero.webp`
- `public/images/adhkar/adhkar-hero.webp`
- `public/images/hadith/hadith-hero.webp`
- `public/images/qibla/qibla-hero.webp`

## المواصفات
- الصيغة: WebP
- الأبعاد: 1600×900
- النسبة: 16:9
- جودة التصدير: 84%
- كل صورة أقل من 250KB

## التثبيت
انسخ مجلد `public` الموجود في الحزمة فوق مجلد `public` في جذر المستودع.
احتفظ بمجلد `source-images` خارج APK إذا رغبت في تقليل حجم المستودع أو البناء.

## مثال CSS
```css
.prayer-hero {
  background-image:
    linear-gradient(90deg, rgba(4, 35, 29, 0.82), rgba(4, 35, 29, 0.28)),
    url('/images/home/prayer-fajr.webp');
  background-size: cover;
  background-position: center;
}
```
