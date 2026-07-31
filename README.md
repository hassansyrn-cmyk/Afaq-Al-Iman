# Afaq Al-Iman Android Icon Pack

حزمة أيقونة جاهزة للنسخ إلى مستودع تطبيق آفاق الإيمان.

## التثبيت
انسخ مجلد `android` الموجود في هذه الحزمة فوق مجلد `android` في جذر المستودع، ووافق على استبدال الملفات.

تتضمن الحزمة:
- أيقونات Legacy لجميع كثافات Android من mdpi إلى xxxhdpi.
- أيقونة Round لجميع الكثافات.
- Adaptive Icon مع Foreground آمن وخلفية زمردية.
- أيقونة Google Play بدقة 512x512.
- الملف الأصلي المنظف بدقة 1024x1024.

## بعد النسخ
شغّل:

```bash
npm install
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

يجب أن يحتوي `AndroidManifest.xml` على:

```xml
android:icon="@mipmap/ic_launcher"
android:roundIcon="@mipmap/ic_launcher_round"
```
