import QuranExperience from "./QuranExperience";
import { useEffect, useMemo, useRef, useState } from "react";
import { App as NativeApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { LocalNotifications } from "@capacitor/local-notifications";
import { StatusBar, Style } from "@capacitor/status-bar";
import { PrayerTimes, Coordinates, CalculationMethod, Qibla } from "adhan";
import {
  Home,
  BookOpen,
  Heart,
  Compass,
  Settings,
  MapPin,
  Search,
  X,
  RotateCcw,
  Library,
  CalendarDays,
  Moon,
  Sun,
  Bell,
  Languages,
  Volume2,
  Vibrate,
  Shield,
  Info,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  Minus,
  Plus,
  CheckCircle2,
  Undo2,
} from "lucide-react";
import { cities, type City } from "./cities";
import { adhkar } from "./adhkar";
import { hadiths } from "./hadith";
import { PrayerWidget } from "./native";
type Tab = "home" | "quran" | "adhkar" | "khatma" | "more";
type More = "menu" | "qibla" | "hadith" | "settings";
type Chapter = {
  id: number;
  name: string;
  total_verses: number;
  verses: { id: number; text: string }[];
};
type NotificationSettings = {
  prayers: boolean;
  prePrayerMinutes: number;
  morningAdhkar: boolean;
  eveningAdhkar: boolean;
  dailyWird: boolean;
  khatma: boolean;
  dailyHadith: boolean;
  sound: boolean;
  vibration: boolean;
};
const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  prayers: true,
  prePrayerMinutes: 0,
  morningAdhkar: true,
  eveningAdhkar: true,
  dailyWird: true,
  khatma: true,
  dailyHadith: true,
  sound: true,
  vibration: true,
};
type KhatmaState = {
  goalDays: number;
  completedDates: string[];
  startedAt: string;
};
const TOTAL_QURAN_PAGES = 604,
  KHATMA_STORAGE_KEY = "afaq-khatma-v2";
const load = <T,>(k: string, f: T): T => {
  try {
    return JSON.parse(localStorage.getItem(k) || "") as T;
  } catch {
    return f;
  }
};
const save = (k: string, v: unknown) =>
  localStorage.setItem(k, JSON.stringify(v));
const images = {
  fajr: "./images/home/prayer-fajr.webp",
  sunrise: "./images/home/prayer-sunrise.webp",
  dhuhr: "./images/home/prayer-dhuhr.webp",
  asr: "./images/home/prayer-asr.webp",
  maghrib: "./images/home/prayer-maghrib.webp",
  isha: "./images/home/prayer-isha.webp",
  quran: "./images/quran/quran-hero.webp",
  adhkar: "./images/adhkar/adhkar-hero.webp",
  qibla: "./images/qibla/qibla-hero.webp",
  hadith: "./images/hadith/hadith-hero.webp",
  plan: "./images/khatma/khatma-hero.webp",
};
function method(c: City) {
  switch (c.method) {
    case "umm":
      return CalculationMethod.UmmAlQura();
    case "egypt":
      return CalculationMethod.Egyptian();
    case "karachi":
      return CalculationMethod.Karachi();
    case "north":
      return CalculationMethod.NorthAmerica();
    case "mwl":
      return CalculationMethod.MuslimWorldLeague();
    default:
      return CalculationMethod.Dubai();
  }
}
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function loadKhatma(): KhatmaState {
  const f = { goalDays: 30, completedDates: [], startedAt: today() };
  try {
    const p = JSON.parse(localStorage.getItem(KHATMA_STORAGE_KEY) || "null");
    return p?.goalDays && Array.isArray(p.completedDates) ? p : f;
  } catch {
    return f;
  }
}
function metrics(p: KhatmaState) {
  const pagesPerDay = Math.ceil(604 / p.goalDays),
    completedDays = p.completedDates.length,
    pagesRead = Math.min(604, completedDays * pagesPerDay),
    startPage = pagesRead >= 604 ? 604 : pagesRead + 1,
    endPage = Math.min(604, startPage + pagesPerDay - 1),
    progress = Math.min(100, Math.round((pagesRead / 604) * 100));
  return {
    pagesPerDay,
    completedDays,
    pagesRead,
    startPage,
    endPage,
    progress,
  };
}
function Hero({
  image,
  title,
  sub,
}: {
  image: string;
  title: string;
  sub: string;
}) {
  return (
    <section
      className="sectionHero"
      style={{
        backgroundImage: `linear-gradient(90deg,#021c17eb,#04312845),url('${image}')`,
      }}
    >
      <div>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
    </section>
  );
}
export default function App() {
  const [tab, setTab] = useState<Tab>("home"),
    [more, setMore] = useState<More>("menu"),
    [dark, setDark] = useState(() => load("dark", false)),
    [city, setCity] = useState<City>(() => load("city", cities[0])),
    [picker, setPicker] = useState(false),
    [chapter, setChapter] = useState<Chapter | null>(null),
    [font, setFont] = useState(() => load("quran-font", 30)),
    [marks, setMarks] = useState<Record<string, boolean>>(() =>
      load("bookmarks", {}),
    ),
    [counts, setCounts] = useState<Record<string, number>>(() =>
      load("adhkar-counts", {}),
    ),
    [query, setQuery] = useState(""),
    [prompt, setPrompt] = useState(() => !load("notification-intro", false)),
    [modal, setModal] = useState<"privacy" | "about" | null>(null),
    [remaining, setRemaining] = useState(""),
    [khatma, setKhatma] = useState<KhatmaState>(loadKhatma),
    [clock, setClock] = useState(() => Date.now()),
    [quranReaderOpen, setQuranReaderOpen] = useState(false),
    [lang, setLang] = useState<"ar" | "en">(() => load("language", "ar")),
    [notificationSettings, setNotificationSettings] =
      useState<NotificationSettings>(() =>
        load("notification-settings", DEFAULT_NOTIFICATION_SETTINGS),
      ),
    [notificationStatus, setNotificationStatus] = useState("");
  const en = lang === "en";
  const tr = (ar: string, english: string) => (en ? english : ar);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = en ? "ltr" : "rtl";
    save("language", lang);
  }, [lang, en]);
  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    save("dark", dark);
    if (Capacitor.isNativePlatform()) {
      void StatusBar.setOverlaysWebView({ overlay: false });
      void StatusBar.setBackgroundColor({
        color: dark ? "#071713" : "#F5F8F6",
      });
      void StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light });
    }
  }, [dark]);
  const times = useMemo(() => {
    const p = new PrayerTimes(
      new Coordinates(city.lat, city.lng),
      new Date(clock),
      method(city),
    );
    return [
      ["fajr", "الفجر", p.fajr],
      ["sunrise", "الشروق", p.sunrise],
      ["dhuhr", "الظهر", p.dhuhr],
      ["asr", "العصر", p.asr],
      ["maghrib", "المغرب", p.maghrib],
      ["isha", "العشاء", p.isha],
    ] as const;
  }, [city, new Date(clock).toDateString()]);
  const next = useMemo(() => {
    const now = new Date(clock);
    const n = times.find((x) => x[2].getTime() > now.getTime());
    if (n) return n;
    const d = new Date(clock);
    d.setDate(d.getDate() + 1);
    const p = new PrayerTimes(
      new Coordinates(city.lat, city.lng),
      d,
      method(city),
    );
    return ["fajr", "الفجر", p.fajr] as const;
  }, [times, city, clock]);
  useEffect(() => {
    const ms = Math.max(0, next[2].getTime() - clock);
    const h = Math.floor(ms / 3600000),
      m = Math.floor((ms % 3600000) / 60000),
      sec = Math.floor((ms % 60000) / 1000);
    setRemaining(
      `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`,
    );
  }, [clock, next]);
  useEffect(() => {
    if (Capacitor.isNativePlatform())
      void PrayerWidget.update({
        schedule: Array.from({ length: 3 }, (_, day) => {
          const date = new Date(clock);
          date.setDate(date.getDate() + day);
          const p = new PrayerTimes(
            new Coordinates(city.lat, city.lng),
            date,
            method(city),
          );
          return [
            ["fajr", p.fajr],
            ["dhuhr", p.dhuhr],
            ["asr", p.asr],
            ["maghrib", p.maghrib],
            ["isha", p.isha],
          ] as const;
        })
          .flat()
          .filter((item) => item[1].getTime() > Date.now())
          .map((item) => ({
            prayer: en
              ? (
                  {
                    fajr: "Fajr",
                    dhuhr: "Dhuhr",
                    asr: "Asr",
                    maghrib: "Maghrib",
                    isha: "Isha",
                  } as Record<string, string>
                )[item[0]]
              : (
                  {
                    fajr: "الفجر",
                    dhuhr: "الظهر",
                    asr: "العصر",
                    maghrib: "المغرب",
                    isha: "العشاء",
                  } as Record<string, string>
                )[item[0]],
            target: item[1].getTime(),
          })),
        prayer: en
          ? (
              {
                fajr: "Fajr",
                dhuhr: "Dhuhr",
                asr: "Asr",
                maghrib: "Maghrib",
                isha: "Isha",
                sunrise: "Sunrise",
              } as Record<string, string>
            )[next[0]]
          : next[1],
        city: en ? city.en : city.ar,
        target: next[2].getTime(),
      }).catch(() => undefined);
  }, [next[0], next[2].getTime(), city.id, lang]);
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let remove: (() => void) | undefined;
    void NativeApp.addListener("backButton", () => {
      if (prompt) setPrompt(false);
      else if (modal) setModal(null);
      else if (picker) setPicker(false);
      else if (tab === "quran" && quranReaderOpen)
        window.dispatchEvent(new Event("afaq-quran-back"));
      else if (chapter) setChapter(null);
      else if (more !== "menu") setMore("menu");
      else if (tab !== "home") {
        setTab("home");
        setMore("menu");
      } else void NativeApp.exitApp();
    }).then((h) => (remove = () => void h.remove()));
    return () => remove?.();
  }, [prompt, modal, picker, chapter, tab, more, quranReaderOpen]);
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let remove: (() => void) | undefined;
    void NativeApp.addListener("appStateChange", ({ isActive }) => {
      if (isActive) {
        setClock(Date.now());
        void verifyNotificationStatus();
      }
    }).then((h) => (remove = () => void h.remove()));
    return () => remove?.();
  }, [city, notificationSettings]);
  async function verifyNotificationStatus() {
    if (!Capacitor.isNativePlatform()) return;
    const permission = await LocalNotifications.checkPermissions();
    let exact = "granted";
    try {
      exact = (
        await (LocalNotifications as any).checkExactNotificationSetting()
      ).exact_alarm;
    } catch {}
    setNotificationStatus(
      permission.display === "granted"
        ? exact === "granted"
          ? tr(
              "الإشعارات مفعلة بدقة",
              "Notifications and exact alarms are enabled",
            )
          : tr(
              "الإشعارات مفعلة، لكن التنبيه الدقيق يحتاج سماحًا",
              "Notifications enabled, exact alarms need permission",
            )
        : tr("إذن الإشعارات غير مفعل", "Notification permission is disabled"),
    );
  }
  async function openExactAlarmSettings() {
    try {
      await (LocalNotifications as any).changeExactNotificationSetting();
    } catch {}
  }
  async function sendTestNotification() {
    if (!Capacitor.isNativePlatform()) return;
    const permission = await LocalNotifications.requestPermissions();
    if (permission.display !== "granted") {
      setNotificationStatus(
        tr("لم يتم منح الإذن", "Permission was not granted"),
      );
      return;
    }
    await LocalNotifications.createChannel({
      id: "afaq-test",
      name: tr("اختبار الإشعارات", "Notification test"),
      importance: 5,
      vibration: true,
    } as any);
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 909090,
          title: tr("اختبار آفاق الإيمان", "Afaq Al-Iman test"),
          body: tr("الإشعارات تعمل بنجاح", "Notifications are working"),
          schedule: { at: new Date(Date.now() + 5000), allowWhileIdle: true },
          channelId: "afaq-test",
        },
      ],
    });
    setNotificationStatus(
      tr(
        "سيصل إشعار تجريبي خلال 5 ثوانٍ",
        "A test notification will arrive in 5 seconds",
      ),
    );
  }
  function updateNotificationSetting<K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K],
  ) {
    const updated = { ...notificationSettings, [key]: value };
    setNotificationSettings(updated);
    save("notification-settings", updated);
  }
  const fmt = (d: Date) =>
    d.toLocaleTimeString(en ? "en-US" : "ar-AE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  async function askNotifications() {
    save("notification-intro", true);
    setPrompt(false);
    if (!Capacitor.isNativePlatform()) return;
    const p = await LocalNotifications.requestPermissions();
    if (p.display === "granted") {
      try {
        const exact = await (
          LocalNotifications as any
        ).checkExactNotificationSetting();
        if (exact.exact_alarm !== "granted")
          await (LocalNotifications as any).changeExactNotificationSetting();
      } catch {}
      await scheduleNotifications();
      await verifyNotificationStatus();
    }
  }
  async function scheduleNotifications() {
    if (!Capacitor.isNativePlatform()) return;
    const old = await LocalNotifications.getPending();
    if (old.notifications.length)
      await LocalNotifications.cancel({ notifications: old.notifications });
    const prayerChannel = `prayer-${notificationSettings.sound ? "sound" : "silent"}-${notificationSettings.vibration ? "vibrate" : "quiet"}`;
    const reminderChannel = `reminders-${notificationSettings.sound ? "sound" : "silent"}-${notificationSettings.vibration ? "vibrate" : "quiet"}`;
    await LocalNotifications.createChannel({
      id: prayerChannel,
      name: tr("مواقيت الصلاة", "Prayer times"),
      importance: 5,
      vibration: notificationSettings.vibration,
      sound: notificationSettings.sound ? undefined : null,
    } as any);
    await LocalNotifications.createChannel({
      id: reminderChannel,
      name: tr("التذكيرات", "Reminders"),
      importance: 4,
      vibration: notificationSettings.vibration,
      sound: notificationSettings.sound ? undefined : null,
    } as any);
    const now = new Date(),
      list: any[] = [];
    for (let day = 0; day < 14; day++) {
      const d = new Date();
      d.setDate(d.getDate() + day);
      const p = new PrayerTimes(
        new Coordinates(city.lat, city.lng),
        d,
        method(city),
      );
      [
        ["الفجر", p.fajr],
        ["الظهر", p.dhuhr],
        ["العصر", p.asr],
        ["المغرب", p.maghrib],
        ["العشاء", p.isha],
      ].forEach((x, i) => {
        if (!notificationSettings.prayers) return;
        const prayerAt = new Date(
          (x[1] as Date).getTime() -
            notificationSettings.prePrayerMinutes * 60000,
        );
        if (prayerAt > now)
          list.push({
            id: 4000 + day * 10 + i,
            title: notificationSettings.prePrayerMinutes
              ? tr(
                  `تبقى ${notificationSettings.prePrayerMinutes} دقيقة لصلاة ${x[0]}`,
                  `${notificationSettings.prePrayerMinutes} minutes until prayer`,
                )
              : tr(`حان وقت صلاة ${x[0]}`, `It is time for prayer`),
            body: en ? city.en : city.ar,
            schedule: { at: prayerAt, allowWhileIdle: true },
            channelId: prayerChannel,
          });
      });
      const a = new Date(d);
      a.setHours(7, 0, 0, 0);
      if (notificationSettings.morningAdhkar && a > now)
        list.push({
          id: 2000 + day,
          title: "أذكار الصباح",
          body: "ابدأ يومك بذكر الله",
          schedule: { at: a },
          channelId: reminderChannel,
        });
      const evening = new Date(d);
      evening.setHours(18, 0, 0, 0);
      if (notificationSettings.eveningAdhkar && evening > now)
        list.push({
          id: 2500 + day,
          title: tr("أذكار المساء", "Evening Adhkar"),
          body: tr("اختم يومك بذكر الله", "End your day with remembrance"),
          schedule: { at: evening, allowWhileIdle: true },
          channelId: reminderChannel,
        });
      const w = new Date(d);
      w.setHours(20, 0, 0, 0);
      if (notificationSettings.dailyWird && w > now)
        list.push({
          id: 1000 + day,
          title: "وردك اليومي",
          body: "خصص دقائق لورد القرآن",
          schedule: { at: w },
          channelId: reminderChannel,
        });
      const h = new Date(d);
      h.setHours(12, 0, 0, 0);
      if (notificationSettings.dailyHadith && h > now) {
        const item = hadiths[(day + new Date().getDate()) % hadiths.length];
        list.push({
          id: 3000 + day,
          title: "حديث اليوم",
          body: `${item[0]} — ${item[2]}`,
          schedule: { at: h },
          channelId: reminderChannel,
        });
      }
    }
    await LocalNotifications.schedule({ notifications: list });
  }
  async function openSura(id: number) {
    setChapter(await fetch(`./quran/${id}.json`).then((r) => r.json()));
  }
  function go(t: Tab) {
    setTab(t);
    setMore("menu");
    setChapter(null);
  }
  function updateKhatma(p: KhatmaState) {
    setKhatma(p);
    save(KHATMA_STORAGE_KEY, p);
  }
  const filtered = hadiths.filter((h) =>
      (h[0] + h[1] + h[2]).toLowerCase().includes(query.toLowerCase()),
    ),
    ks = metrics(khatma);
  return (
    <div className="app" dir={en ? "ltr" : "rtl"}>
      <header>
        <div className="brand">
          <b className="brandIcon">
            <img src="./icon.png" alt="Afaq Al-Iman" />
          </b>
          <span>
            <strong>{tr("آفاق الإيمان", "Afaq Al-Iman")}</strong>
            <small onClick={() => setPicker(true)}>
              {en ? city.en : city.ar}
            </small>
          </span>
        </div>
        <div className="headBtns">
          <button
            className="languageButton"
            onClick={() => setLang(en ? "ar" : "en")}
            aria-label="Language"
          >
            <Languages />
            <small>{en ? "AR" : "EN"}</small>
          </button>
          <button onClick={() => setPicker(true)}>
            <MapPin />
          </button>
          <button onClick={() => setDark(!dark)}>
            {dark ? <Sun /> : <Moon />}
          </button>
        </div>
      </header>
      <main>
        {tab === "home" && (
          <>
            <section
              className="prayerHero"
              style={{
                backgroundImage: `linear-gradient(90deg,#021c17ed,#04312835),url('${images[next[0]]}')`,
              }}
            >
              <span>{tr("الصلاة القادمة", "Next prayer")}</span>
              <h1>
                {en
                  ? (
                      {
                        fajr: "Fajr",
                        sunrise: "Sunrise",
                        dhuhr: "Dhuhr",
                        asr: "Asr",
                        maghrib: "Maghrib",
                        isha: "Isha",
                      } as Record<string, string>
                    )[next[0]]
                  : next[1]}
              </h1>
              <strong>{fmt(next[2])}</strong>
              <div className="countdown">
                <small>{tr("متبقي", "Remaining")}</small>
                <b>{remaining}</b>
              </div>
              <p>
                <MapPin /> {en ? city.en : city.ar}
              </p>
            </section>
            <section className="prayerGrid">
              {times.map((x) => (
                <div className={x[0] === next[0] ? "active" : ""} key={x[0]}>
                  <span>
                    {en
                      ? (
                          {
                            fajr: "Fajr",
                            sunrise: "Sunrise",
                            dhuhr: "Dhuhr",
                            asr: "Asr",
                            maghrib: "Maghrib",
                            isha: "Isha",
                          } as Record<string, string>
                        )[x[0]]
                      : x[1]}
                  </span>
                  <b>{fmt(x[2])}</b>
                </div>
              ))}
            </section>
            <section className="quick">
              <button onClick={() => go("quran")}>
                <BookOpen />
                {tr("القرآن", "Quran")}
              </button>
              <button onClick={() => go("adhkar")}>
                <Heart />
                {tr("الأذكار", "Adhkar")}
              </button>
              <button onClick={() => go("khatma")}>
                <CalendarDays />
                {tr("الختمة", "Khatma")}
              </button>
            </section>
            <section className="glass homeKhatmaCard">
              <div className="homeKhatmaHeader">
                <div>
                  <small>{tr("خطة الختمة", "Khatma plan")}</small>
                  <h2>
                    {tr("ورد اليوم: صفحة", "Today: pages")} {ks.startPage}{" "}
                    {tr("إلى", "to")} {ks.endPage}
                  </h2>
                  <p>
                    {ks.pagesPerDay} {tr("صفحة يوميًا", "pages daily")}
                  </p>
                </div>
                <div className="homeKhatmaProgress">{ks.progress}%</div>
              </div>
              <button className="primary" onClick={() => go("khatma")}>
                <CalendarDays />
                {tr("فتح خطة الختمة", "Open Khatma plan")}
              </button>
            </section>
            <section className="glass">
              <small>{tr("حديث عشوائي", "Random Hadith")}</small>
              <blockquote>
                «{hadiths[new Date().getDate() % hadiths.length][0]}»
              </blockquote>
              <em>{hadiths[new Date().getDate() % hadiths.length][2]}</em>
              <button
                onClick={() => {
                  setTab("more");
                  setMore("hadith");
                }}
              >
                {tr("فتح المكتبة", "Open library")}
              </button>
            </section>
          </>
        )}
        {tab === "quran" && (
          <QuranExperience
            lang={lang}
            onReaderStateChange={setQuranReaderOpen}
          />
        )}

        {tab === "adhkar" && (
          <>
            <Hero
              image={images.adhkar}
              title="الأذكار"
              sub="عدادات محفوظة على الجهاز"
            />
            <button
              className="resetAll"
              onClick={() => {
                setCounts({});
                save("adhkar-counts", {});
              }}
            >
              <RotateCcw />
              إعادة ضبط الكل
            </button>
            <div className="zikrList">
              {adhkar.map(([id, text, target]) => {
                const n = counts[id] || 0,
                  p = (n / target) * 100;
                return (
                  <button
                    className={"zikr " + (n === target ? "done" : "")}
                    key={id}
                    onClick={async () => {
                      if (n >= target) return;
                      const x = n + 1,
                        v = { ...counts, [id]: x };
                      setCounts(v);
                      save("adhkar-counts", v);
                      if (Capacitor.isNativePlatform())
                        x === target
                          ? await Haptics.notification({
                              type: NotificationType.Success,
                            })
                          : await Haptics.impact({ style: ImpactStyle.Light });
                    }}
                  >
                    <div
                      className="ring"
                      style={{
                        background: `conic-gradient(var(--gold) ${p}%,var(--line) 0)`,
                      }}
                    >
                      <i>{n}</i>
                      <small>/{target}</small>
                    </div>
                    <p>{text}</p>
                    <span>{n === target ? "مكتمل" : "اضغط للعد"}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
        {tab === "khatma" && (
          <KhatmaPage
            plan={khatma}
            updatePlan={updateKhatma}
            onRead={() => {
              setTab("quran");
              setChapter(null);
            }}
          />
        )}
        {tab === "more" && more === "menu" && (
          <>
            <h1>{tr("المزيد", "More")}</h1>
            <div className="menuGrid">
              <button onClick={() => setMore("qibla")}>
                <Compass />
                القبلة
              </button>
              <button onClick={() => setMore("hadith")}>
                <Library />
                الأحاديث
              </button>
              <button onClick={() => setPicker(true)}>
                <MapPin />
                المدينة
              </button>
              <button onClick={() => setMore("settings")}>
                <Settings />
                الإعدادات
              </button>
            </div>
          </>
        )}
        {tab === "more" && more === "qibla" && (
          <>
            <Hero
              image={images.qibla}
              title="اتجاه القبلة"
              sub={`حسب ${city.ar}`}
            />
            <QiblaCompass city={city} />
          </>
        )}
        {tab === "more" && more === "hadith" && (
          <>
            <Hero
              image={images.hadith}
              title="مكتبة الأحاديث"
              sub="بحث عربي وإنجليزي في البيانات المتاحة"
            />
            <label className="search">
              <Search />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث بكلمة أو رقم"
              />
            </label>
            {filtered.map((h, i) => (
              <article className="glass" key={i}>
                <p>«{h[0]}»</p>
                <p>{h[1]}</p>
                <small>{h[2]}</small>
              </article>
            ))}
          </>
        )}
        {tab === "more" && more === "settings" && (
          <>
            <h1>{tr("الإعدادات", "Settings")}</h1>
            <section className="glass settings">
              <label>
                <Moon />
                {tr("الوضع الليلي", "Dark mode")}
                <input
                  type="checkbox"
                  checked={dark}
                  onChange={() => setDark(!dark)}
                />
              </label>
              <label>
                <Languages />
                {tr("اللغة", "Language")}
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as "ar" | "en")}
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </label>
              <div className="notificationSettingsPanel">
                <h2>{tr("تخصيص الإشعارات", "Notification preferences")}</h2>
                <label>
                  <Bell />
                  {tr("تنبيهات الصلوات", "Prayer alerts")}
                  <input
                    type="checkbox"
                    checked={notificationSettings.prayers}
                    onChange={(e) =>
                      updateNotificationSetting("prayers", e.target.checked)
                    }
                  />
                </label>
                <label>
                  <Bell />
                  {tr("التذكير قبل الصلاة", "Remind before prayer")}
                  <select
                    value={notificationSettings.prePrayerMinutes}
                    onChange={(e) =>
                      updateNotificationSetting(
                        "prePrayerMinutes",
                        Number(e.target.value),
                      )
                    }
                  >
                    <option value="0">
                      {tr("عند الوقت", "At prayer time")}
                    </option>
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="30">30</option>
                  </select>
                </label>
                <label>
                  <Heart />
                  {tr("أذكار الصباح", "Morning Adhkar")}
                  <input
                    type="checkbox"
                    checked={notificationSettings.morningAdhkar}
                    onChange={(e) =>
                      updateNotificationSetting(
                        "morningAdhkar",
                        e.target.checked,
                      )
                    }
                  />
                </label>
                <label>
                  <Heart />
                  {tr("أذكار المساء", "Evening Adhkar")}
                  <input
                    type="checkbox"
                    checked={notificationSettings.eveningAdhkar}
                    onChange={(e) =>
                      updateNotificationSetting(
                        "eveningAdhkar",
                        e.target.checked,
                      )
                    }
                  />
                </label>
                <label>
                  <BookOpen />
                  {tr("الورد اليومي", "Daily Quran reminder")}
                  <input
                    type="checkbox"
                    checked={notificationSettings.dailyWird}
                    onChange={(e) =>
                      updateNotificationSetting("dailyWird", e.target.checked)
                    }
                  />
                </label>
                <label>
                  <Library />
                  {tr("الحديث اليومي", "Daily Hadith")}
                  <input
                    type="checkbox"
                    checked={notificationSettings.dailyHadith}
                    onChange={(e) =>
                      updateNotificationSetting("dailyHadith", e.target.checked)
                    }
                  />
                </label>
                <label>
                  <Volume2 />
                  {tr("الصوت", "Sound")}
                  <input
                    type="checkbox"
                    checked={notificationSettings.sound}
                    onChange={(e) =>
                      updateNotificationSetting("sound", e.target.checked)
                    }
                  />
                </label>
                <label>
                  <Vibrate />
                  {tr("الاهتزاز", "Vibration")}
                  <input
                    type="checkbox"
                    checked={notificationSettings.vibration}
                    onChange={(e) =>
                      updateNotificationSetting("vibration", e.target.checked)
                    }
                  />
                </label>
              </div>
              {notificationStatus && (
                <p className="notificationStatus">{notificationStatus}</p>
              )}
              <button className="secondary" onClick={sendTestNotification}>
                <Bell />
                {tr("إرسال إشعار تجريبي", "Send test notification")}
              </button>
              <button className="secondary" onClick={openExactAlarmSettings}>
                <Settings />
                {tr("إعداد التنبيهات الدقيقة", "Exact alarm settings")}
              </button>
              <button
                className="primary"
                onClick={async () => {
                  await scheduleNotifications();
                  await verifyNotificationStatus();
                }}
              >
                <Bell />
                {tr("إعادة جدولة الإشعارات", "Reschedule notifications")}
              </button>
              <button className="link" onClick={() => setModal("privacy")}>
                <Shield />
                {tr("سياسة الخصوصية", "Privacy policy")}
              </button>
              <button className="link" onClick={() => setModal("about")}>
                <Info />
                {tr("حول البرنامج", "About")}
              </button>
            </section>
          </>
        )}
      </main>
      <nav>
        {(
          [
            ["home", Home, tr("الرئيسية", "Home")],
            ["quran", BookOpen, tr("القرآن", "Quran")],
            ["adhkar", Heart, tr("الأذكار", "Adhkar")],
            ["khatma", CalendarDays, tr("الختمة", "Khatma")],
            ["more", Settings, tr("المزيد", "More")],
          ] as const
        ).map(([k, I, l]) => (
          <button
            key={k}
            className={tab === k ? "on" : ""}
            onClick={() => go(k)}
          >
            <I />
            <span>{l}</span>
          </button>
        ))}
      </nav>
      {picker && (
        <CityPicker
          city={city}
          close={() => setPicker(false)}
          choose={(c) => {
            setCity(c);
            save("city", c);
            setPicker(false);
            setTimeout(() => void scheduleNotifications(), 0);
          }}
        />
      )}
      {prompt && (
        <NotificationPermission
          onAllow={askNotifications}
          onLater={() => {
            save("notification-intro", true);
            setPrompt(false);
          }}
        />
      )}
      {modal && (
        <div className="modal">
          <section className="sheet">
            <button onClick={() => setModal(null)}>
              <X />
            </button>
            {modal === "privacy" ? (
              <>
                <h2>سياسة الخصوصية</h2>
                <p>
                  تُحفظ المدينة والعلامات والختمة والإعدادات محليًا، ولا يبيع
                  التطبيق البيانات الشخصية.
                </p>
              </>
            ) : (
              <>
                <h2>حول البرنامج</h2>
                <p>آفاق الإيمان 1.5.0. المواقيت حسابية وقد تختلف بدقائق.</p>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
function NotificationPermission({
  onAllow,
  onLater,
}: {
  onAllow: () => void | Promise<void>;
  onLater: () => void;
}) {
  return (
    <div
      className="notificationPermissionOverlay"
      role="dialog"
      aria-modal="true"
    >
      <section className="notificationPermissionCard">
        <div className="notificationIconWrapper">
          <svg className="notificationCrescentIcon" viewBox="0 0 64 64">
            <defs>
              <linearGradient id="crescentGold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFF3B5" />
                <stop offset="45%" stopColor="#E5C566" />
                <stop offset="100%" stopColor="#A97E22" />
              </linearGradient>
            </defs>
            <path
              d="M43.8 9.8C32.5 11.9 24 21.8 24 33.7c0 10.7 6.9 19.9 16.5 23.1C27.8 60.2 14 50.6 14 35.5 14 21.2 26 9.6 40.6 9.6c1.1 0 2.2.1 3.2.2Z"
              fill="url(#crescentGold)"
            />
            <path
              d="M45.5 20.5l1.8 4.2 4.4.5-3.3 2.9 1 4.3-3.9-2.2-3.8 2.2 1-4.3-3.3-2.9 4.4-.5 1.7-4.2Z"
              fill="#F7D97C"
            />
          </svg>
        </div>
        <div className="notificationPermissionContent">
          <span className="notificationPermissionBadge">تنبيهات مهمة</span>
          <h2>لا تفوّت وقت الصلاة</h2>
          <p className="notificationPermissionDescription">
            يحتاج تطبيق آفاق الإيمان إلى إذن الإشعارات حتى يذكّرك في الوقت
            المناسب، حتى عندما لا يكون التطبيق مفتوحًا.
          </p>
          <div className="notificationBenefits">
            <Benefit
              icon={<Bell />}
              title="تنبيهات مواقيت الصلاة"
              text="تذكير عند دخول وقت كل صلاة حسب مدينتك."
            />
            <Benefit
              icon={<Heart />}
              title="أذكار الصباح والمساء"
              text="تذكيرات يومية تساعدك على المحافظة على الأذكار."
            />
            <Benefit
              icon={<BookOpen />}
              title="الورد والختمة والحديث"
              text="متابعة ورد القرآن وخطة الختمة وحديث يومي."
            />
          </div>
          <p className="notificationPrivacyNote">
            يمكنك إيقاف أي نوع من التذكيرات لاحقًا من الإعدادات.
          </p>
          <button className="notificationAllowButton" onClick={onAllow}>
            <Bell />
            <span>
              <b>السماح بالإشعارات</b>
              <small>الانتقال إلى نافذة إذن Android</small>
            </span>
            <ChevronLeft />
          </button>
          <button className="notificationLaterButton" onClick={onLater}>
            ربما لاحقًا
          </button>
        </div>
      </section>
    </div>
  );
}
function Benefit({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="notificationBenefitItem">
      <span className="notificationBenefitIcon">{icon}</span>
      <div>
        <b>{title}</b>
        <small>{text}</small>
      </div>
    </div>
  );
}
function KhatmaPage({
  plan,
  updatePlan,
  onRead,
}: {
  plan: KhatmaState;
  updatePlan: (p: KhatmaState) => void;
  onRead: (p: number) => void;
}) {
  const {
      pagesPerDay,
      completedDays,
      pagesRead,
      startPage,
      endPage,
      progress,
    } = metrics(plan),
    remainingPages = Math.max(0, 604 - pagesRead),
    remainingDays = Math.max(0, plan.goalDays - completedDays),
    t = today(),
    doneToday = plan.completedDates.includes(t),
    complete = progress >= 100,
    endDate = useMemo(() => {
      const d = new Date(`${plan.startedAt}T12:00:00`);
      d.setDate(d.getDate() + plan.goalDays - 1);
      return d.toLocaleDateString("ar-AE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }, [plan.goalDays, plan.startedAt]);
  return (
    <>
      <Hero
        image={images.plan}
        title="خطة الختمة"
        sub="خطة مرنة مبنية على 604 صفحات"
      />
      <section className="glass khatmaCard">
        <div
          className="khatmaProgress"
          style={{
            background: `conic-gradient(var(--gold) ${progress}%,var(--line) 0)`,
          }}
        >
          <div>
            <b>{progress}%</b>
            <span>مكتمل</span>
          </div>
        </div>
        <div className="khatmaToday">
          <small>{complete ? "تمت الختمة" : "ورد اليوم"}</small>
          <h2>
            {complete
              ? "بارك الله لك في ختم القرآن"
              : `من صفحة ${startPage} إلى ${endPage}`}
          </h2>
          <p>{complete ? "ابدأ خطة جديدة" : `${pagesPerDay} صفحة يوميًا`}</p>
        </div>
      </section>
      <section className="glass">
        <label className="khatmaRange">
          مدة الختمة: <b>{plan.goalDays} يومًا</b>
          <input
            type="range"
            min="7"
            max="365"
            value={plan.goalDays}
            onChange={(e) => updatePlan({ ...plan, goalDays: +e.target.value })}
          />
        </label>
        <div className="khatmaStats">
          <div>
            <b>{completedDays}</b>
            <span>يوم منجز</span>
          </div>
          <div>
            <b>{remainingDays}</b>
            <span>يوم متبقٍ</span>
          </div>
          <div>
            <b>{remainingPages}</b>
            <span>صفحة متبقية</span>
          </div>
        </div>
        <p className="khatmaDate">
          <CalendarDays /> تاريخ الانتهاء المتوقع: <b>{endDate}</b>
        </p>
        {!complete && (
          <button
            className="secondary khatmaAction"
            onClick={() => onRead(startPage)}
          >
            <BookOpen />
            قراءة ورد اليوم
          </button>
        )}
        <button
          className="primary khatmaAction"
          disabled={doneToday || complete}
          onClick={() =>
            !doneToday &&
            !complete &&
            updatePlan({ ...plan, completedDates: [...plan.completedDates, t] })
          }
        >
          <CheckCircle2 />
          {complete
            ? "اكتملت الختمة"
            : doneToday
              ? "تم تسجيل ورد اليوم"
              : "تسجيل إنجاز اليوم"}
        </button>
        <button
          className="secondary khatmaAction"
          disabled={!completedDays}
          onClick={() =>
            updatePlan({
              ...plan,
              completedDates: plan.completedDates.slice(0, -1),
            })
          }
        >
          <Undo2 />
          تراجع عن آخر إنجاز
        </button>
        <button
          className="khatmaReset"
          onClick={() =>
            window.confirm("هل تريد بدء خطة ختمة جديدة؟") &&
            updatePlan({
              goalDays: plan.goalDays,
              completedDates: [],
              startedAt: today(),
            })
          }
        >
          <RotateCcw />
          بدء خطة جديدة
        </button>
      </section>
    </>
  );
}
function CityPicker({
  city,
  choose,
  close,
}: {
  city: City;
  choose: (c: City) => void;
  close: () => void;
}) {
  const [q, setQ] = useState("");
  return (
    <div className="modal">
      <section className="sheet citySheet">
        <div className="sheetHead">
          <h2>اختيار المدينة</h2>
          <button onClick={close}>
            <X />
          </button>
        </div>
        <label className="search">
          <Search />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="مدينة أو دولة"
          />
        </label>
        <div className="cityList">
          {cities
            .filter((c) =>
              (c.ar + c.en).toLowerCase().includes(q.toLowerCase()),
            )
            .map((c) => (
              <button
                className={c.id === city.id ? "selected" : ""}
                key={c.id}
                onClick={() => choose(c)}
              >
                <b>{c.ar}</b>
                <small>{c.en}</small>
              </button>
            ))}
        </div>
      </section>
    </div>
  );
}
function Reader({
  c,
  font,
  setFont,
  marks,
  toggle,
  back,
}: {
  c: Chapter;
  font: number;
  setFont: (n: number) => void;
  marks: Record<string, boolean>;
  toggle: (id: number) => void;
  back: () => void;
}) {
  return (
    <>
      <div className="readerHead">
        <button onClick={back}>×</button>
        <h1>سورة {c.name}</h1>
        <div>
          <button
            onClick={() => {
              const n = Math.max(22, font - 2);
              setFont(n);
              save("quran-font", n);
            }}
          >
            <Minus />
          </button>
          <button
            onClick={() => {
              const n = Math.min(46, font + 2);
              setFont(n);
              save("quran-font", n);
            }}
          >
            <Plus />
          </button>
        </div>
      </div>
      <section className="mushafPage" style={{ fontSize: font }}>
        {c.verses.map((v) => {
          const k = `${c.id}:${v.id}`,
            marked = marks[k];
          return (
            <span className="verse" key={v.id}>
              {v.text} <b>﴿{v.id}﴾</b>
              <button
                className={marked ? "marked" : ""}
                onClick={() => toggle(v.id)}
              >
                {marked ? <BookmarkCheck /> : <Bookmark />}
              </button>{" "}
            </span>
          );
        })}
      </section>
    </>
  );
}
function QiblaCompass({ city }: { city: City }) {
  const bearing = Math.round(Qibla(new Coordinates(city.lat, city.lng))),
    [heading, setHeading] = useState<number | null>(null),
    buffer = useRef<number[]>([]),
    last = useRef(0);
  useEffect(() => {
    const handler = (e: any) => {
      if (performance.now() - last.current < 100) return;
      last.current = performance.now();
      let v =
        typeof e.webkitCompassHeading === "number"
          ? e.webkitCompassHeading
          : typeof e.alpha === "number"
            ? (360 - e.alpha) % 360
            : null;
      if (v === null) return;
      v = (v + (screen.orientation?.angle || 0) + 360) % 360;
      buffer.current.push(v);
      if (buffer.current.length > 20) buffer.current.shift();
      const s = buffer.current.reduce(
          (a, x) => a + Math.sin((x * Math.PI) / 180),
          0,
        ),
        c = buffer.current.reduce(
          (a, x) => a + Math.cos((x * Math.PI) / 180),
          0,
        ),
        avg = ((Math.atan2(s, c) * 180) / Math.PI + 360) % 360;
      setHeading((p) =>
        p === null || Math.abs(((avg - p + 540) % 360) - 180) > 2.5 ? avg : p,
      );
    };
    window.addEventListener("deviceorientationabsolute", handler, true);
    window.addEventListener("deviceorientation", handler, true);
    return () => {
      window.removeEventListener("deviceorientationabsolute", handler, true);
      window.removeEventListener("deviceorientation", handler, true);
    };
  }, []);
  const delta =
    heading === null ? bearing : ((bearing - heading + 540) % 360) - 180;
  return (
    <section className="compassCard">
      <div className="compassDial">
        <b>N</b>
        <div
          className="redArrow"
          style={{ transform: `translate(-50%,-100%) rotate(${delta}deg)` }}
        />
        <div className="kaabaMark">
          ◆<small>الكعبة</small>
        </div>
      </div>
      <h2>{bearing}° من الشمال</h2>
      <p>
        {heading === null
          ? "المستشعر غير متاح، استخدم الدرجة الثابتة"
          : `تبقى ${Math.abs(Math.round(delta))}° للوصول إلى القبلة`}
      </p>
    </section>
  );
}
