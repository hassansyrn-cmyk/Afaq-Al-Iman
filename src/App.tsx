import { useEffect, useState } from 'react';
import { Home, BookOpen, Library, Settings as SettingsIcon, Moon, Sun, CalendarDays, Compass } from 'lucide-react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { PrayerTimes, Coordinates, CalculationMethod } from 'adhan';

import type { Tab, Chapter, ChapterMeta, HadithRecord } from './types';
import { load, save } from './services/storage';
import { useBackButton } from './hooks/useBackButton';
import type { BackStackState } from './services/backStack';

import { SuraList } from './features/quran/SuraList';
import { QuranReader } from './features/quran/QuranReader';
import { BookmarksList } from './features/quran/BookmarksList';
import { getLastRead } from './repositories/quran/BookmarkRepository';
import { KhatmaPlanScreen } from './features/khatma/KhatmaPlan';
import { KhatmaRepository } from './repositories/khatma/KhatmaRepository';
import { HadithList } from './features/hadith/HadithList';
import { HadithDetail } from './features/hadith/HadithDetail';
import { hadithRepository } from './repositories/hadith/hadithRepositoryInstance';
import { DailyHadithService } from './repositories/hadith/DailyHadithService';
import { QiblaCompass } from './features/qibla/QiblaCompass';
import { SettingsPage, type SettingsSheet } from './features/settings/SettingsPage';
import {
  NotificationOnboarding,
  shouldShowNotificationOnboarding,
} from './features/notifications/NotificationOnboarding';
import { getNotificationPrefs } from './services/notificationPrefs';

const khatmaRepo = new KhatmaRepository();
const dailyHadithService = new DailyHadithService(hadithRepository);

// إحداثيات افتراضية (أبوظبي) — نسخة V4 الأساسية لم تتضمن اختيار مدينة فعلياً؛
// هذا حد معروف موثّق في README بدل الادعاء بدعم اختيار المدينة.
const DEFAULT_COORDS = { lat: 24.4539, lng: 54.3773 };

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [dark, setDark] = useState<boolean>(() => load('dark', false));
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [chapters, setChapters] = useState<ChapterMeta[]>([]);
  const [bookmarksListOpen, setBookmarksListOpen] = useState(false);
  const [hadithDetailId, setHadithDetailId] = useState<string | null>(null);
  const [tafsirAyah, setTafsirAyah] = useState<number | null>(null);
  const [settingsSheet, setSettingsSheet] = useState<SettingsSheet>(null);
  const [todayHadith, setTodayHadith] = useState<{ hadith: HadithRecord | null; isFullLibrary: boolean } | null>(null);
  const [notifOnboardingOpen, setNotifOnboardingOpen] = useState(false);

  // ---- الوضع الليلي ----
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    save('dark', dark);
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light }).catch(() => {});
      StatusBar.setBackgroundColor({ color: dark ? '#071713' : '#F5F8F6' }).catch(() => {});
    }
  }, [dark]);

  // ---- تثبيت overlaysWebView=false عند الإقلاع، تحسباً لأي تغيير بيئة ----
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
  }, []);

  // ---- تحميل فهرس السور مرة واحدة ----
  useEffect(() => {
    fetch('./quran/index.json')
      .then((r) => r.json())
      .then((data: ChapterMeta[]) => setChapters(data))
      .catch(() => setChapters([]));
  }, []);

  // ---- حديث اليوم ----
  useEffect(() => {
    dailyHadithService.getTodayHadith().then(setTodayHadith);
  }, []);

  // ---- شاشة إذن الإشعارات عند أول تشغيل ----
  useEffect(() => {
    if (shouldShowNotificationOnboarding()) setNotifOnboardingOpen(true);
  }, []);

  async function openSura(id: number) {
    const data: Chapter = await fetch(`./quran/${id}.json`).then((r) => r.json());
    setChapter(data);
    setTab('quran');
  }

  // ---- زر الرجوع الفعلي في أندرويد ----
  function currentBackState(): BackStackState {
    return {
      isSheetOpen: tafsirAyah != null || settingsSheet != null,
      isHadithDetailOpen: hadithDetailId != null,
      isSuraOpen: chapter != null,
      isBookmarksListOpen: bookmarksListOpen,
      activeTab: tab,
    };
  }

  useBackButton(currentBackState, {
    closeSheet: () => {
      if (tafsirAyah != null) setTafsirAyah(null);
      else if (settingsSheet != null) setSettingsSheet(null);
    },
    closeHadithDetail: () => setHadithDetailId(null),
    closeSura: () => {
      setChapter(null);
      setTafsirAyah(null);
    },
    closeBookmarksList: () => setBookmarksListOpen(false),
    goHome: () => setTab('home'),
  });

  // ---- جدولة الإشعارات (مواقيت الصلاة + الأذكار + الورد + الحديث اليومي) ----
  async function scheduleNotifications() {
    if (!Capacitor.isNativePlatform()) return;
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== 'granted') return;

    await LocalNotifications.createChannel({ id: 'prayer', name: 'مواقيت الصلاة', importance: 5 });
    await LocalNotifications.createChannel({ id: 'adhkar', name: 'الأذكار', importance: 4 });
    await LocalNotifications.createChannel({ id: 'quran-reminders', name: 'تذكيرات القرآن', importance: 4 });
    await LocalNotifications.createChannel({ id: 'daily-hadith', name: 'الحديث اليومي', importance: 3 });

    // إلغاء الإشعارات المجدولة سابقاً قبل إعادة الجدولة، لمنع التكرار
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) });
    }

    const prefs = getNotificationPrefs();
    const now = new Date();
    const list: Parameters<typeof LocalNotifications.schedule>[0]['notifications'] = [];

    if (prefs.prayer) {
      for (let day = 0; day < 7; day++) {
        const date = new Date(now);
        date.setDate(now.getDate() + day);
        const pt = new PrayerTimes(new Coordinates(DEFAULT_COORDS.lat, DEFAULT_COORDS.lng), date, CalculationMethod.Dubai());
        const prayers = [
          ['الفجر', pt.fajr],
          ['الظهر', pt.dhuhr],
          ['العصر', pt.asr],
          ['المغرب', pt.maghrib],
          ['العشاء', pt.isha],
        ] as const;
        prayers.forEach(([name, time], j) => {
          if (time > now) {
            list.push({
              id: 4000 + day * 10 + j,
              title: `حان وقت صلاة ${name}`,
              body: 'تقبل الله طاعتكم',
              schedule: { at: time, allowWhileIdle: true },
              channelId: 'prayer',
            });
          }
        });
      }
    }

    for (let i = 1; i <= 14; i++) {
      if (prefs.adhkarMorning) {
        const morning = new Date(now);
        morning.setDate(now.getDate() + i);
        morning.setHours(7, 0, 0, 0);
        list.push({ id: 2000 + i, title: 'أذكار الصباح', body: 'ابدأ يومك بذكر الله', schedule: { at: morning }, channelId: 'adhkar' });
      }

      if (prefs.adhkarEvening) {
        const evening = new Date(now);
        evening.setDate(now.getDate() + i);
        evening.setHours(18, 0, 0, 0);
        list.push({ id: 2500 + i, title: 'أذكار المساء', body: 'اختم يومك بذكر الله', schedule: { at: evening }, channelId: 'adhkar' });
      }

      if (prefs.wird) {
        const wird = new Date(now);
        wird.setDate(now.getDate() + i);
        wird.setHours(20, 0, 0, 0);
        list.push({ id: 1000 + i, title: 'وردك اليومي', body: 'خصص دقائق لورد القرآن اليوم', schedule: { at: wird }, channelId: 'quran-reminders' });
      }

      if (prefs.wirdIncomplete) {
        const lateCheck = new Date(now);
        lateCheck.setDate(now.getDate() + i);
        lateCheck.setHours(22, 30, 0, 0);
        const dateStr = lateCheck.toISOString().slice(0, 10);
        const plan = khatmaRepo.getPlan();
        const alreadyDoneThatDay = plan?.history.some((h) => h.date === dateStr) ?? false;
        // لا نرسل تذكير "لم يكتمل الورد" لليوم الحالي لأننا لا نعرف بعد إن كان سيُنجز أم لا؛
        // فقط لأيام مستقبلية تُترك دون سجل إنجاز عند الجدولة نفسها لا معنى لها هنا، لذلك
        // نكتفي بعدم جدولتها لأي يوم مسجَّل بالفعل وقت الجدولة (منع تذكير بعد الإنجاز).
        if (!alreadyDoneThatDay) {
          list.push({
            id: 1500 + i,
            title: 'لم يكتمل ورد اليوم بعد',
            body: 'لا يزال بإمكانك إتمام وردك اليوم',
            schedule: { at: lateCheck },
            channelId: 'quran-reminders',
          });
        }
      }

      if (prefs.dailyHadith) {
        const hadithTime = new Date(now);
        hadithTime.setDate(now.getDate() + i);
        hadithTime.setHours(12, 0, 0, 0);
        list.push({ id: 3000 + i, title: 'حديث اليوم', body: 'اطّلع على حديث اليوم', schedule: { at: hadithTime }, channelId: 'daily-hadith' });
      }
    }

    await LocalNotifications.schedule({ notifications: list });
    alert('تمت جدولة التذكيرات للأيام القادمة');
  }

  const plan = khatmaRepo.getPlan();
  const progress = plan ? khatmaRepo.getProgress(plan) : null;
  const lastRead = getLastRead();

  return (
    <div className="app">
      <header>
        <div className="brand">
          <b>أ</b>
          <span>
            <strong>آفاق الإيمان</strong>
            <small>رحلة إيمانية يومية</small>
          </span>
        </div>
        <button className="round" onClick={() => setDark(!dark)} aria-label="تبديل الوضع الليلي">
          {dark ? <Sun /> : <Moon />}
        </button>
      </header>

      <main>
        {tab === 'home' && (
          <>
            <section className="hero">
              <div>
                <small>ورد اليوم</small>
                <h1>{progress ? `صفحة ${progress.todayStartPage} إلى ${progress.todayEndPage}` : 'لا توجد خطة بعد'}</h1>
                <p>{plan ? `خطة مرنة لختم القرآن خلال ${plan.totalDays} يوماً` : 'أنشئ خطة ختمة من تبويب الختمة'}</p>
              </div>
              <div className="orb">{progress ? `${progress.percent}%` : '—'}</div>
              <button onClick={() => setTab('plan')}>إدارة الختمة</button>
            </section>

            <section className="quick">
              <button onClick={() => setTab('quran')}>
                <BookOpen /> المصحف
              </button>
              <button onClick={() => setTab('hadith')}>
                <Library /> الأحاديث
              </button>
              <button onClick={() => setTab('qibla')}>
                <Compass /> القبلة
              </button>
            </section>

            {lastRead && (
              <section className="glass">
                <small>آخر قراءة</small>
                <h2>
                  سورة {lastRead.suraName} • الآية {lastRead.ayah}
                </h2>
                <button onClick={() => openSura(lastRead.sura)}>متابعة القراءة</button>
              </section>
            )}

            <section className="glass hadith">
              <small>حديث اليوم</small>
              {todayHadith?.hadith ? (
                <>
                  <blockquote>«{todayHadith.hadith.textAr}»</blockquote>
                  <em>{todayHadith.hadith.source}</em>
                  {!todayHadith.isFullLibrary && (
                    <p className="muted" style={{ fontSize: 12 }}>
                      من مجموعة اختبار محلية، وليس من كامل الصحيحين بعد.
                    </p>
                  )}
                </>
              ) : (
                <p className="muted">جارٍ التحميل…</p>
              )}
            </section>
          </>
        )}

        {tab === 'quran' && (
          <>
            {chapter ? (
              <QuranReader
                chapter={chapter}
                onBack={() => setChapter(null)}
                onOpenBookmarksList={() => setBookmarksListOpen(true)}
                tafsirTarget={tafsirAyah}
                onOpenTafsir={setTafsirAyah}
                onCloseTafsir={() => setTafsirAyah(null)}
              />
            ) : bookmarksListOpen ? (
              <BookmarksList
                onBack={() => setBookmarksListOpen(false)}
                onOpenAyah={(sura) => {
                  setBookmarksListOpen(false);
                  openSura(sura);
                }}
              />
            ) : (
              <SuraList chapters={chapters} onOpenChapter={openSura} onOpenBookmarks={() => setBookmarksListOpen(true)} />
            )}
          </>
        )}

        {tab === 'plan' && (
          <KhatmaPlanScreen
            onOpenQuranAtPage={() => {
              setTab('quran');
              // ملاحظة: لا تتوفر بيانات "صفحة → سورة/آية" رسمية في هذه النسخة،
              // لذلك ننتقل لقائمة السور بدل خداع المستخدم برقم صفحة غير دقيق.
            }}
          />
        )}

        {tab === 'hadith' && (
          <>
            {hadithDetailId ? (
              <HadithDetail hadithId={hadithDetailId} onBack={() => setHadithDetailId(null)} />
            ) : (
              <HadithList onOpenDetail={setHadithDetailId} />
            )}
          </>
        )}

        {tab === 'qibla' && <QiblaCompass cityLat={DEFAULT_COORDS.lat} cityLng={DEFAULT_COORDS.lng} />}

        {tab === 'settings' && (
          <>
            <SettingsPage openSheet={settingsSheet} onOpenSheet={setSettingsSheet} />
            <section className="glass">
              <button className="primary" onClick={scheduleNotifications}>
                تفعيل وجدولة كل التذكيرات
              </button>
            </section>
          </>
        )}
      </main>

      <nav>
        {(
          [
            ['home', Home, 'الرئيسية'],
            ['quran', BookOpen, 'القرآن'],
            ['plan', CalendarDays, 'الختمة'],
            ['hadith', Library, 'الأحاديث'],
            ['qibla', Compass, 'القبلة'],
            ['settings', SettingsIcon, 'المزيد'],
          ] as const
        ).map(([key, Icon, label]) => (
          <button
            key={key}
            className={tab === key ? 'on' : ''}
            onClick={() => {
              setTab(key);
              if (key !== 'quran') setChapter(null);
            }}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {notifOnboardingOpen && <NotificationOnboarding onDone={() => setNotifOnboardingOpen(false)} />}
    </div>
  );
}
