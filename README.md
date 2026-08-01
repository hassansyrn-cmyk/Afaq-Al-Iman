# آفاق الإيمان | Afaq Al-Iman

تطبيق إسلامي شامل (React + TypeScript + Vite + Capacitor) لمواقيت الصلاة، القرآن الكريم،
الأذكار، الأحاديث، اتجاه القبلة، وخطة ختم القرآن، بدعم كامل للعربية والإنجليزية.

هذه نسخة **مدمجة**: تجمع بين البنية والميزات الكاملة (i18n، إعدادات إشعارات تفصيلية، خطة
ختمة متقدمة، بحث وعلامات مرجعية) وبين الهوية البصرية والبيانات المُجمَّعة محليًا من نسختين
سابقتين للمشروع تم تزويدي بهما، لإخراج أفضل نسخة ممكنة.

A comprehensive bilingual Islamic companion app. This is a **merged** version — combining
full architecture/features with the richer visual identity and bundled offline data from
two earlier prototypes of this project you provided, to produce the best overall result.

---

## ما الذي تغيّر في هذا الدمج | What Changed in This Merge

- **التصميم**: استُبدلت البطاقات المسطحة بتصميم "زجاجي" (glassmorphism) مع صور أغلفة
  احترافية لكل قسم (الصلاة، القرآن، الختمة، الأحاديث، القبلة، الأذكار) وأيقونة تطبيق جاهزة.
- **القرآن الكريم أصبح يعمل دون إنترنت بالكامل**: بدل الاعتماد على واجهة برمجية خارجية،
  النص الآن مُجمَّع داخل التطبيق (114 سورة، عربي + ترجمة إنجليزية) — يعمل من أول تشغيل
  بلا اتصال.
- **بوصلة القبلة**: خوارزمية تنعيم أفضل (متوسط دائري + تخميد) لثبات أدق للمؤشر.
- **قائمة المدن**: وُسِّعت إلى أكثر من 50 مدينة حول العالم، كل واحدة بطريقة حساب افتراضية
  مناسبة لمنطقتها، مع نافذة اختيار قابلة للبحث.
- **حديث اليوم**: أصبح له احتياطي فوري مُجمَّع محليًا (8 أحاديث معروفة) يظهر حتى بلا إنترنت
  إطلاقًا وقبل أول تحميل ناجح من الواجهة البرمجية.
- بقيت جميع ميزات النسخة الأصلية كما هي: تعدد اللغات الكامل، إعدادات إشعارات تفصيلية لكل
  صلاة (تذكير، صوت، ساعات هادئة)، خطة ختمة بأربعة أوضاع إعداد مع إعادة توزيع تلقائية،
  بحث وعلامات مرجعية في القرآن، مفضلة وبحث في الأحاديث.

- **Design**: flat cards replaced with a glassmorphism system and professional hero images
  per section, plus a ready-made app icon.
- **The Quran now works fully offline**: instead of a remote API, the text is bundled inside
  the app (114 surahs, Arabic + English) — works from the very first launch, no connection
  needed.
- **Qibla compass**: a steadier smoothing algorithm (circular moving average + damping).
- **City list**: expanded to 50+ cities worldwide, each with a sensible default calculation
  method, plus a searchable picker.
- **Hadith of the day**: now has an instant bundled fallback (8 well-known hadiths) shown
  even with zero connectivity or before the first successful API fetch.
- Everything from the original build remains: full i18n, per-prayer notification settings
  (reminders, sound, quiet hours), a four-mode khatma plan with automatic redistribution,
  Quran search/bookmarks, hadith favorites/search.

## بنية المشروع | Project Structure

```
src/
  i18n/            نظام الترجمة المركزي (ar.ts, en.ts)
  context/         اللغة، المظهر، الإعدادات
  services/        مواقيت الصلاة، القرآن (محلي بالكامل)، الأحاديث، الأذكار، الختمة، الإشعارات، الموقع
  components/      SectionHero، BottomNav، TopBar، CountdownTimer
  pages/           شاشات التطبيق
  data/            قائمة المدن الموسّعة (locations.ts)
public/
  quran/           114 ملف JSON (عربي) + public/quran/en (إنجليزي) — بيانات مُجمَّعة، لا شبكة مطلوبة
  images/          صور الأغلفة لكل قسم (webp)
  icons/           أيقونة التطبيق المصدرية (1024px، 512px)
android/           يُنشأ تلقائيًا أثناء CI عبر `npx cap add android` (غير مضمّن في المستودع)
.github/workflows/android-debug.yml   بناء APK تلقائي
```

## البيانات الدينية ومصادرها | Religious Data & Sources

لم يتم اختراع أو توليد أي نص ديني بالذكاء الاصطناعي:

- **القرآن الكريم**: نص "quran-json" القياسي (رواية حفص/طباعة تنزيل) مع ترجمة إنجليزية،
  مُجمَّع بالكامل داخل `public/quran/` — لا يتطلب إنترنت.
- **الأحاديث**: تُجلب من [fawazahmed0/hadith-api](https://github.com/fawazahmed0/hadith-api)
  (صحيح البخاري وصحيح مسلم) مع رقم الحديث والباب، بالإضافة إلى 8 أحاديث احتياطية مُجمَّعة
  محليًا للعمل الفوري دون إنترنت.
- **الأذكار**: نصوص ثابتة قياسية (آية الكرسي، المعوذات، سيد الاستغفار، أذكار الصباح
  والمساء والنوم وبعد الصلاة) في `src/services/azkarData.ts`.
- **التقويم الهجري**: تحويل حسابي (خوارزمية جدولية معروفة) — تقريبي.
- **مواقيت الصلاة والقبلة**: تُحسب محليًا بالكامل عبر مكتبة `adhan` (بدون إنترنت)، 6 طرق
  حساب + مذهبين.

Nothing here is AI-generated. Quran text is bundled locally (no network needed); hadith are
fetched from the API above with a local fallback set; azkar are standard fixed texts; the
Hijri date is a deterministic calendar calculation; prayer times/qibla are computed 100%
offline via `adhan`.

## تنبيه هام حول الإشعارات بعد إعادة التشغيل | Notifications After Reboot

يعيد التطبيق جدولة نافذة متجددة من التنبيهات (3 أيام) تلقائيًا عند كل فتح. الضمان الكامل
لعمل التنبيهات لأيام عديدة دون فتح التطبيق إطلاقًا بعد إعادة تشغيل الهاتف يتطلب مكوّن
Android أصلي (BroadcastReceiver/WorkManager) غير مُنفَّذ في هذا الإصدار — لم يُدّعَ خلاف ذلك.

The app re-schedules a rolling 3-day notification window automatically on every open. A full
guarantee of notifications firing for many days with the app *never* reopened after a reboot
requires a native Android component not implemented here — this is not claimed otherwise.

## متطلبات التشغيل | Requirements

Node.js 22 · Java 21 (Temurin, لبناء أندرويد فقط) · Android SDK 36 / Build Tools 36.0.0

## التطوير محليًا | Local Development

```bash
npm install
npm run dev      # المتصفح على المنفذ 5173
npm run build    # فحص TypeScript ثم بناء الويب إلى dist/
```

تم فحص TypeScript والبناء بنجاح (`tsc --noEmit` و`vite build`) في بيئة إعداد هذا المشروع،
وتم التحقق يدويًا من مطابقة بيانات القرآن المُجمَّعة للشكل الذي يتوقعه الكود. لم تُختبر
استدعاءات الشبكة الحية لواجهة الأحاديث ولا بناء Gradle/Android الفعلي في تلك البيئة (لا
اتصال بالإنترنت العام سوى npm) — ستُختبر أول مرة عبر GitHub Actions وعلى جهازك.

TypeScript and the build passed (`tsc --noEmit`, `vite build`), and the bundled Quran data
was manually verified against the schema the code expects. The live hadith API calls and the
actual Gradle/Android build were **not** exercised in that environment (no public internet
besides npm) — they'll run for real the first time via GitHub Actions and on your machine.

## بناء تطبيق أندرويد | Building the Android App

مجلد `android/` غير مُدرَج عمدًا؛ يُنشأ تلقائيًا في كل بناء عبر GitHub Actions
(`npx cap add android`) ليبقى متوافقًا مع أحدث قوالب Capacitor. لإنشائه يدويًا:

```bash
npm install
npm run build
npx cap add android
npx cap sync android
cd android && ./gradlew assembleDebug
```
APK: `android/app/build/outputs/apk/debug/app-debug.apk`

### أيقونة التطبيق وشاشة البداية | App Icon & Splash

أيقونة المصدر موجودة في `public/icons/app-icon-1024.png`. بعد `cap add android`، يمكنك
توليد كل أحجام الأيقونات وشاشة البداية تلقائيًا عبر:

```bash
npx @capacitor/assets generate --iconBackgroundColor '#04302a' --splashBackgroundColor '#04302a'
```

## النشر إلى GitHub | Publishing to GitHub

```bash
git init && git add . && git commit -m "Initial commit: Afaq Al-Iman"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

سيبني Workflow ملف APK تلقائيًا عند كل push إلى `main` ويرفعه كـ Artifact باسم
`afaq-al-iman-debug-apk` (تبويب Actions في مستودعك).

The workflow builds the debug APK on every push to `main` and uploads it as
`afaq-al-iman-debug-apk` (your repo's Actions tab).

## ملاحظات أخرى | Other Notes

- Package ID: `com.afaq.iman` (في `capacitor.config.ts`).
- الألوان: أخضر داكن `#04302a`/`#0a5b4b`، ذهبي هادئ `#d4b35a` — مع دعم كامل للوضع الداكن.
- الخطوط: Tajawal للواجهة، Amiri Quran للنص القرآني.
- الأيقونات من مكتبة `lucide-react` (SVG فقط) — لا يوجد إيموجي كأيقونات في أي مكان.
- Colors: dark green `#04302a`/`#0a5b4b`, calm gold `#d4b35a` — full dark mode.
- Fonts: Tajawal for UI, Amiri Quran for Quran text.
- Icons from `lucide-react` (SVG only) — no emoji used as icons anywhere.
