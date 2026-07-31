# آفاق الإيمان | Afaq Al-Iman

تطبيق إسلامي شامل (React + TypeScript + Vite + Capacitor) لمواقيت الصلاة، القرآن الكريم،
الأذكار، الأحاديث، اتجاه القبلة، وخطة ختم القرآن، بدعم كامل للعربية والإنجليزية.

A comprehensive Islamic companion app (React + TypeScript + Vite + Capacitor) covering
prayer times, the Quran, azkar, hadith, qibla direction, and a khatma (Quran completion)
plan — fully bilingual (Arabic default / English).

---

## بنية المشروع | Project Structure

```
src/
  i18n/            نظام الترجمة المركزي (ar.ts, en.ts) — لا نصوص مباشرة في الواجهات
  context/         السياقات: اللغة، المظهر، الإعدادات
  services/        مواقيت الصلاة، القرآن، الأحاديث، الأذكار، الختمة، الإشعارات، الموقع
  components/      عناصر واجهة قابلة لإعادة الاستخدام (SVG icons فقط، بدون إيموجي)
  pages/           شاشات التطبيق
android/           يُنشأ تلقائيًا أثناء CI عبر `npx cap add android` (غير مضمّن في المستودع)
.github/workflows/android-debug.yml   بناء APK تلقائي
```

## البيانات الدينية ومصادرها | Religious Data & Sources

هذا مهم جدًا — لم يتم اختراع أو توليد أي نص ديني بالذكاء الاصطناعي:

- **القرآن الكريم**: يُجلب في وقت التشغيل من [AlQuran Cloud API](https://alquran.cloud)
  (نص حفص عن عاصم + ترجمة Sahih International)، ويُخزَّن محليًا للقراءة دون اتصال بعد أول تحميل.
- **الأحاديث**: تُجلب من [fawazahmed0/hadith-api](https://github.com/fawazahmed0/hadith-api)
  (صحيح البخاري وصحيح مسلم)، مع رقم الحديث والباب كما وردا في المصدر.
- **الأذكار**: نصوص ثابتة قياسية (كآية الكرسي، المعوذات، سيد الاستغفار، أذكار الصباح
  والمساء والنوم وبعد الصلاة) مضمّنة داخل `src/services/azkarData.ts`، وهي مجموعة أولية
  يمكن توسعتها لاحقًا بنفس البنية دون تغيير الشكل.
- **التقويم الهجري**: تحويل حسابي (خوارزمية جدولية معروفة) — تقريبي وقد يختلف يومًا عن
  رؤية الهلال المحلية.
- **مواقيت الصلاة والقبلة**: تُحسب محليًا بالكامل عبر مكتبة `adhan` (بدون إنترنت)، وتدعم
  طرق الحساب الست المطلوبة والمذهبين.

Nothing here is AI-generated: Quran text and hadith are fetched from the two APIs above and
cached for offline use; azkar are standard, widely-published fixed texts; the Hijri date is
a deterministic calendar calculation; prayer times and qibla are computed 100% locally and
offline via the `adhan` library.

## تنبيه هام حول الإشعارات بعد إعادة التشغيل | Important Notice — Notifications After Reboot

يقوم التطبيق بجدولة نافذة متجددة من التنبيهات (3 أيام قادمة) ويعيد جدولتها تلقائيًا في كل
مرة يُفتح فيها التطبيق أو يعود إلى المقدمة. هذا يغطي حالات إعادة التشغيل العادية عمليًا،
لكن الضمان الكامل لعمل التنبيهات لأيام عديدة دون فتح التطبيق إطلاقًا بعد إعادة تشغيل الهاتف
يتطلب مكوّن Android أصلي (BroadcastReceiver/WorkManager) غير مُنفَّذ في هذا الإصدار.
لم يُدّعَ في الكود أو في هذا الملف أن هذا السيناريو مضمون 100%، التزامًا بطلبك الصريح.

The app schedules a rolling 3-day notification window and re-schedules it automatically
every time it is opened or foregrounded. This covers normal reboots in practice, but a
full guarantee of notifications firing for many days with the app *never* reopened after
a phone restart would require a native Android component (BroadcastReceiver/WorkManager)
that is not implemented in this version — per your explicit requirement, we are not
claiming this works unless it's actually built.

## متطلبات التشغيل | Requirements

- Node.js 22
- Java 21 (Temurin) — لبناء أندرويد فقط
- Android SDK 36 / Build Tools 36.0.0

## التطوير محليًا | Local Development

```bash
npm install
npm run dev          # تشغيل في المتصفح على المنفذ 5173
npm run build         # فحص TypeScript ثم بناء الويب إلى dist/
```

## بناء تطبيق أندرويد | Building the Android App

مجلد `android/` **غير مُدرَج** في هذا الأرشيف عمدًا؛ يُنشأ تلقائيًا في كل عملية بناء عبر
GitHub Actions (`npx cap add android`) لضمان توافقه دائمًا مع أحدث قوالب Capacitor بدل
تجميد نسخة قد تتعارض مع Gradle/AGP الحاليين. لإنشائه يدويًا على جهازك:

The `android/` folder is intentionally **not included** in this archive — it is generated
fresh on every CI run via `npx cap add android`, so it always matches current Capacitor
templates instead of a possibly-stale hand-committed copy. To generate it locally:

```bash
npm install
npm run build
npx cap add android
npx cap sync android
cd android && ./gradlew assembleDebug
```
APK output: `android/app/build/outputs/apk/debug/app-debug.apk`

## النشر إلى GitHub | Publishing to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Afaq Al-Iman"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

بمجرد الدفع (push) إلى `main`، سيبدأ Workflow ببناء ملف APK تلقائيًا ورفعه كـ Artifact باسم
`afaq-al-iman-debug-apk` — يمكنك تحميله من تبويب Actions في مستودعك على GitHub.

Once pushed to `main`, the workflow automatically builds the debug APK and uploads it as
an artifact named `afaq-al-iman-debug-apk`, downloadable from your repo's Actions tab.

## ملاحظات مهمة أخرى | Other Important Notes

- تم فحص TypeScript بنجاح (`tsc --noEmit`) وبناء الويب بنجاح (`vite build`) داخل بيئة التطوير
  المستخدمة لإعداد هذا المشروع. لم يتمكن هذا البيئة من الوصول لشبكة عامة (npm فقط)، لذا لم
  يُختبر بناء Gradle/Android الفعلي ولا استدعاءات الشبكة الحية لواجهات القرآن/الأحاديث هنا —
  ستُختبر فعليًا أول مرة عبر GitHub Actions وعلى جهازك.
- Package ID / namespace: `com.afaq.iman` (مضبوط في `capacitor.config.ts`، وينعكس تلقائيًا
  عند `cap add android`).
- الألوان: أخضر داكن `#0B3D2E`، ذهبي هادئ `#C9A227`، أبيض/عاجي — مع دعم كامل للوضع الداكن.
- جميع الأيقونات SVG مخصصة (`src/components/Icons.tsx`) — لا يوجد إيموجي كأيقونات في أي مكان.

- TypeScript type-checking (`tsc --noEmit`) and the web build (`vite build`) both passed
  successfully in the environment used to prepare this project. That environment could not
  reach the public internet (npm only), so the actual Gradle/Android build and the live
  Quran/Hadith API calls were **not** exercised here — they will run for real the first time
  via GitHub Actions and on your own machine/device.
- Package ID / namespace: `com.afaq.iman` (set in `capacitor.config.ts`, carried through
  automatically when `cap add android` runs).
- Colors: dark green `#0B3D2E`, calm gold `#C9A227`, white/ivory — full dark mode support.
- All icons are custom SVG (`src/components/Icons.tsx`) — no emoji used as icons anywhere.
