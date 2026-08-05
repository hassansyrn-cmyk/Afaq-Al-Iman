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
  ChevronLeft,
  CheckCircle2,
  Undo2,
  Filter,
  BedDouble,
  UtensilsCrossed,
  Building2,
  Droplets,
  BellRing,
  Sparkles,
  CircleDot,
  Star,
  Grid3x3,
  Plus,
  Target,
} from "lucide-react";
import { cities, type City } from "./cities";
import { adhkar, adhkarCategories, type AdhkarItem, type AdhkarCategory } from "./adhkar";
import { hadiths, type Hadith } from "./hadith";
import { formatHijri } from "./hijri";
import { PrayerWidget } from "./native";
type Tab = "home" | "tasbeeh" | "adhkar" | "khatma" | "more";
type More = "menu" | "qibla" | "hadith" | "settings";
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
type TasbeehState = {
  count: number;
  goal: number;
  current: string | null;
  favorites: string[];
  haptic: boolean;
};
const KHATMA_STORAGE_KEY = "afaq-khatma-v2",
  TASBEEH_STORAGE_KEY = "afaq-tasbeeh-v1";
const DEFAULT_TASBEEH_STATE: TasbeehState = {
  count: 0,
  goal: 100,
  current: null,
  favorites: [],
  haptic: true,
};
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
function loadTasbeeh(): TasbeehState {
  try {
    const p = JSON.parse(localStorage.getItem(TASBEEH_STORAGE_KEY) || "null");
    return p && typeof p.count === "number"
      ? { ...DEFAULT_TASBEEH_STATE, ...p }
      : DEFAULT_TASBEEH_STATE;
  } catch {
    return DEFAULT_TASBEEH_STATE;
  }
}
function metrics(p: KhatmaState) {
  const TOTAL = 604;
  // Base pace from the original goal, used to infer how many pages each already
  // completed day represents (we only store which dates were completed, not an
  // explicit page count per day).
  const basePace = Math.ceil(TOTAL / p.goalDays);
  const completedDays = p.completedDates.length;
  const pagesRead = Math.min(TOTAL, completedDays * basePace);

  // Calendar days elapsed since the plan started (not "days completed"). Using the
  // calendar instead of the completed-day count means a missed day still counts
  // against the remaining time, so today's target grows to compensate — this is
  // what actually redistributes the remaining pages over the remaining days
  // instead of silently pushing the finish date out forever.
  const daysElapsed = Math.max(
    0,
    Math.floor(
      (Date.now() - new Date(`${p.startedAt}T00:00:00`).getTime()) / 86400000,
    ),
  );
  const remainingPlannedDays = Math.max(1, p.goalDays - daysElapsed);
  const remainingPages = TOTAL - pagesRead;
  const pagesPerDay =
    pagesRead >= TOTAL
      ? 0
      : Math.max(1, Math.ceil(remainingPages / remainingPlannedDays));
  const startPage = pagesRead >= TOTAL ? TOTAL : pagesRead + 1;
  const endPage = Math.min(TOTAL, startPage + pagesPerDay - 1);
  const progress = Math.min(100, Math.round((pagesRead / TOTAL) * 100));
  // Whether we're currently behind the original even pace (i.e. redistribution is
  // actively bumping today's target above the plan's original daily amount).
  const isBehindSchedule = pagesPerDay > basePace;
  return {
    pagesPerDay,
    completedDays,
    pagesRead,
    startPage,
    endPage,
    progress,
    remainingPlannedDays,
    isBehindSchedule,
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
    [counts, setCounts] = useState<Record<string, number>>(() =>
      load("adhkar-counts", {}),
    ),
    [query, setQuery] = useState(""),
    [prompt, setPrompt] = useState(() => !load("notification-intro", false)),
    [modal, setModal] = useState<"privacy" | "about" | null>(null),
    [remaining, setRemaining] = useState(""),
    [khatma, setKhatma] = useState<KhatmaState>(loadKhatma),
    [clock, setClock] = useState(() => Date.now()),
    [tasbeeh, setTasbeehState] = useState<TasbeehState>(loadTasbeeh),
    [tasbeehView, setTasbeehView] = useState<
      "counter" | "sections" | "favorites" | "search" | "settings"
    >("counter"),
    [tasbeehQuery, setTasbeehQuery] = useState(""),
    [lang, setLang] = useState<"ar" | "en">(() => load("language", "ar")),
    [notificationSettings, setNotificationSettings] =
      useState<NotificationSettings>(() =>
        load("notification-settings", DEFAULT_NOTIFICATION_SETTINGS),
      ),
    [notificationStatus, setNotificationStatus] = useState(""),
    [adhkarCategory, setAdhkarCategory] = useState<AdhkarCategory | 'all'>('all'),
    [adhkarQuery, setAdhkarQuery] = useState('');
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
        hijri: formatHijri(new Date(clock), lang),
      }).catch(() => undefined);
  }, [next[0], next[2].getTime(), city.id, lang]);
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let remove: (() => void) | undefined;
    void NativeApp.addListener("backButton", () => {
      if (prompt) setPrompt(false);
      else if (modal) setModal(null);
      else if (picker) setPicker(false);
      else if (tab === "tasbeeh" && tasbeehView !== "counter")
        setTasbeehView("counter");
      else if (more !== "menu") setMore("menu");
      else if (tab !== "home") {
        setTab("home");
        setMore("menu");
      } else void NativeApp.exitApp();
    }).then((h) => (remove = () => void h.remove()));
    return () => remove?.();
  }, [prompt, modal, picker, tab, more, tasbeehView]);
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
          schedule: { at: a, allowWhileIdle: true },
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
          schedule: { at: w, allowWhileIdle: true },
          channelId: reminderChannel,
        });
      const h = new Date(d);
      h.setHours(12, 0, 0, 0);
      if (notificationSettings.dailyHadith && h > now) {
        const item = hadiths[(day + new Date().getDate()) % hadiths.length];
        list.push({
          id: 3000 + day,
          title: "حديث اليوم",
          body: `${item.ar} — ${item.source}`,
          schedule: { at: h, allowWhileIdle: true },
          channelId: reminderChannel,
        });
      }
    }
    await LocalNotifications.schedule({ notifications: list });
  }
  function go(t: Tab) {
    setTab(t);
    setMore("menu");
  }
  function updateKhatma(p: KhatmaState) {
    setKhatma(p);
    save(KHATMA_STORAGE_KEY, p);
  }
  function updateTasbeeh(p: TasbeehState) {
    setTasbeehState(p);
    save(TASBEEH_STORAGE_KEY, p);
  }
  const filtered = hadiths.filter((h) =>
      (h.ar + h.en + h.source).toLowerCase().includes(query.toLowerCase()),
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
            <section className="hijriCard glass">
              <div className="hijriDateRow">
                <Moon />
                <span>{formatHijri(new Date(clock), lang)}</span>
              </div>
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
              <button onClick={() => go("tasbeeh")}>
                <CircleDot />
                {tr("المسبحة", "Tasbeeh")}
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
                «{hadiths[new Date().getDate() % hadiths.length].ar}»
              </blockquote>
              <em>{hadiths[new Date().getDate() % hadiths.length].source}</em>
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
        {tab === "tasbeeh" && (
          <TasbeehPage
            en={en}
            state={tasbeeh}
            update={updateTasbeeh}
            view={tasbeehView}
            setView={setTasbeehView}
            query={tasbeehQuery}
            setQuery={setTasbeehQuery}
          />
        )}

        {tab === "adhkar" && (
          <>
            <Hero
              image={images.adhkar}
              title={en ? "Azkar" : "الأذكار"}
              sub={
                en
                  ? "Counters saved on this device"
                  : "عدادات محفوظة على الجهاز"
              }
            />
            <div className="adhkarFilters">
              <button
                className={adhkarCategory === 'all' ? 'adhkarFilterActive' : ''}
                onClick={() => setAdhkarCategory('all')}
              >
                {en ? 'All' : 'الكل'}
              </button>
              {adhkarCategories.map(cat => (
                <button
                  key={cat.id}
                  className={adhkarCategory === cat.id ? 'adhkarFilterActive' : ''}
                  onClick={() => setAdhkarCategory(cat.id)}
                >
                  {en ? cat.en : cat.ar}
                </button>
              ))}
            </div>
            <label className="search">
              <Search />
              <input
                value={adhkarQuery}
                onChange={e => setAdhkarQuery(e.target.value)}
                placeholder={en ? 'Search adhkar...' : 'ابحث في الأذكار...'}
              />
            </label>
            <button
              className="resetAll"
              onClick={() => {
                setCounts({});
                save("adhkar-counts", {});
                setAdhkarCategory('all');
                setAdhkarQuery('');
              }}
            >
              <RotateCcw />
              {en ? "Reset all" : "إعادة ضبط الكل"}
            </button>
            {(() => {
              const filteredAdhkar = adhkar.filter(a =>
                (adhkarCategory === 'all' || a.category === adhkarCategory) &&
                (!adhkarQuery || a.ar.includes(adhkarQuery))
              );
              return (
                <div className="zikrList">
                  {filteredAdhkar.map((item) => {
                    const n = counts[item.id] || 0,
                      p = (n / item.count) * 100;
                    return (
                      <button
                        className={"zikr " + (n === item.count ? "done" : "")}
                        key={item.id}
                        onClick={async () => {
                          if (n >= item.count) return;
                          const x = n + 1,
                            v = { ...counts, [item.id]: x };
                          setCounts(v);
                          save("adhkar-counts", v);
                          if (Capacitor.isNativePlatform())
                            x === item.count
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
                          <small>/{item.count}</small>
                        </div>
                        <div className="zikrText">
                          <p>{item.ar}</p>
                          {item.source && <small className="zikrSource">{item.source}</small>}
                        </div>
                        <span>
                          {n === item.count
                            ? en
                              ? "Complete"
                              : "مكتمل"
                            : en
                              ? "Tap to count"
                              : "اضغط للعد"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </>
        )}
        {tab === "khatma" && (
          <KhatmaPage plan={khatma} updatePlan={updateKhatma} en={en} />
        )}
        {tab === "more" && more === "menu" && (
          <>
            <h1>{tr("المزيد", "More")}</h1>
            <div className="menuGrid">
              <button onClick={() => setMore("qibla")}>
                <Compass />
                {tr("القبلة", "Qibla")}
              </button>
              <button onClick={() => setMore("hadith")}>
                <Library />
                {tr("الأحاديث", "Hadith")}
              </button>
              <button onClick={() => setPicker(true)}>
                <MapPin />
                {tr("المدينة", "City")}
              </button>
              <button onClick={() => setMore("settings")}>
                <Settings />
                {tr("الإعدادات", "Settings")}
              </button>
            </div>
          </>
        )}
        {tab === "more" && more === "qibla" && (
          <>
            <Hero
              image={images.qibla}
              title={tr("اتجاه القبلة", "Qibla Direction")}
              sub={tr(`حسب ${city.ar}`, `Based on ${city.en}`)}
            />
            <QiblaCompass city={city} en={en} />
          </>
        )}
        {tab === "more" && more === "hadith" && (
          <>
            <Hero
              image={images.hadith}
              title={tr("مكتبة الأحاديث", "Hadith Library")}
              sub={tr(
                "بحث عربي وإنجليزي في البيانات المتاحة",
                "Search in Arabic or English",
              )}
            />
            <label className="search">
              <Search />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tr("ابحث بكلمة أو رقم", "Search by word")}
              />
            </label>
            {filtered.map((h, i) => (
              <article className="glass" key={i}>
                <p>«{h.ar}»</p>
                <p>{h.en}</p>
                <small>{h.source}</small>
                {h.narrator && <em>{h.narrator}</em>}
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
            ["tasbeeh", CircleDot, tr("المسبحة", "Tasbeeh")],
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
          en={en}
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
                <h2>{tr("سياسة الخصوصية", "Privacy policy")}</h2>
                <p>
                  {tr(
                    "يعمل التطبيق بالكامل من جهازك، بدون حساب أو تسجيل دخول.",
                    "The app runs entirely on your device, with no account or sign-in.",
                  )}
                </p>
                <p>
                  {tr(
                    "البيانات المحفوظة على جهازك فقط: المدينة المختارة، تقدّم خطة الختمة، عدّاد المسبحة والأذكار المفضّلة، وإعدادات المظهر واللغة والإشعارات. لا تُرسل هذه البيانات إلى أي خادم، ولا تُشارك أو تُباع لأي طرف ثالث.",
                    "Data stored only on your device: your selected city, Khatma plan progress, your Tasbeeh counter and favorite Adhkar, and your theme, language, and notification settings. None of this is sent to any server, shared, or sold to third parties.",
                  )}
                </p>
                <p>
                  {tr(
                    "إذن الإشعارات يُستخدم لتذكيرك بأوقات الصلاة والأذكار، ومستشعر الاتجاه يُستخدم فقط لحساب اتجاه القبلة دون أي تسجيل له. لا يحتاج التطبيق إلى اتصال بالإنترنت للعمل.",
                    "The notification permission is used to remind you of prayer times and Adhkar, and the orientation sensor is used only to calculate the Qibla direction, without recording it. The app doesn't need an internet connection to work.",
                  )}
                </p>
                <p>
                  {tr(
                    "لا يحتوي التطبيق على إعلانات أو أدوات تتبع. حذف التطبيق يمسح جميع بياناته المحفوظة نهائيًا.",
                    "The app has no ads or tracking tools. Uninstalling the app permanently erases all of its stored data.",
                  )}
                </p>
              </>
            ) : (
              <>
                <h2>{tr("حول البرنامج", "About")}</h2>
                <p>
                  {tr(
                    "آفاق الإيمان 1.5.0 — رفيقك اليومي في الصلاة والذكر: مواقيت الصلاة، اتجاه القبلة، خطة الختمة، الأذكار، المسبحة الإلكترونية، ومكتبة أحاديث صحيحة.",
                    "Afaq Al-Iman 1.5.0 — your daily companion for prayer and remembrance: prayer times, Qibla direction, a Khatma plan, Adhkar, an electronic Tasbeeh, and a library of authenticated (sahih) hadith.",
                  )}
                </p>
                <p>
                  {tr(
                    "المواقيت والاتجاهات محسوبة فلكيًا وقد تختلف ببضع دقائق عن مصادر أخرى، فيُستحسن التحقق منها عند الحاجة لدقة تامة.",
                    "Prayer times and directions are calculated astronomically and may differ by a few minutes from other sources — worth double-checking when full precision matters.",
                  )}
                </p>
                <p>
                  {tr(
                    "كل حديث في المكتبة مأخوذ من مصادر معتمدة (صحيح البخاري وصحيح مسلم وغيرها من الكتب الموثوقة)، وتم استبعاد أي حديث ضعيف أو مختلف في صحته. لا إعلانات ولا أدوات تتبع في التطبيق.",
                    "Every hadith in the library is drawn from authenticated sources (Sahih al-Bukhari, Sahih Muslim, and other trusted collections), with any weak or disputed narration excluded. No ads or tracking tools are included in the app.",
                  )}
                </p>
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
          <svg className="notificationMosqueIcon" viewBox="0 0 64 64">
            <defs>
              <linearGradient id="mosqueGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFF3B5" />
                <stop offset="45%" stopColor="#E5C566" />
                <stop offset="100%" stopColor="#A97E22" />
              </linearGradient>
              <linearGradient id="mosqueDome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F7E2A6" />
                <stop offset="60%" stopColor="#E5C566" />
                <stop offset="100%" stopColor="#B88B30" />
              </linearGradient>
              <linearGradient id="mosqueBody" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FCE9A8" />
                <stop offset="100%" stopColor="#C99A36" />
              </linearGradient>
            </defs>
            {/* Base platform */}
            <rect x="8" y="50" width="48" height="6" rx="1.5" fill="url(#mosqueBody)" />
            {/* Left minaret */}
            <rect x="13" y="24" width="5" height="26" fill="url(#mosqueBody)" />
            <circle cx="15.5" cy="22" r="3.4" fill="url(#mosqueDome)" />
            <path d="M15.5 13 L17.4 18 L13.6 18 Z" fill="url(#mosqueGold)" />
            <circle cx="15.5" cy="11.5" r="1.2" fill="url(#mosqueGold)" />
            {/* Right minaret */}
            <rect x="46" y="24" width="5" height="26" fill="url(#mosqueBody)" />
            <circle cx="48.5" cy="22" r="3.4" fill="url(#mosqueDome)" />
            <path d="M48.5 13 L50.4 18 L46.6 18 Z" fill="url(#mosqueGold)" />
            <circle cx="48.5" cy="11.5" r="1.2" fill="url(#mosqueGold)" />
            {/* Main building body */}
            <rect x="22" y="32" width="20" height="18" fill="url(#mosqueBody)" />
            {/* Main dome */}
            <path d="M22 32 Q22 19 32 19 Q42 19 42 32 Z" fill="url(#mosqueDome)" />
            <ellipse cx="32" cy="32" rx="10" ry="2.2" fill="#9F7322" opacity="0.45" />
            {/* Crescent finial on top of dome */}
            <path d="M32 6 L33.4 9.5 L37 10 L34.5 12.4 L35 16 L32 14 L29 16 L29.5 12.4 L27 10 L30.6 9.5 Z" fill="url(#mosqueGold)" />
            {/* Arched doorway */}
            <path d="M28 50 L28 41 Q28 36 32 36 Q36 36 36 41 L36 50 Z" fill="#7A5616" />
            <path d="M29.2 49 L29.2 41.4 Q29.2 37.4 32 37.4 Q34.8 37.4 34.8 41.4 L34.8 49 Z" fill="url(#mosqueGold)" opacity="0.85" />
            {/* Side arched windows */}
            <path d="M24.5 47 L24.5 41 Q24.5 38.5 26 38.5 Q27.5 38.5 27.5 41 L27.5 47 Z" fill="#7A5616" opacity="0.75" />
            <path d="M36.5 47 L36.5 41 Q36.5 38.5 38 38.5 Q39.5 38.5 39.5 41 L39.5 47 Z" fill="#7A5616" opacity="0.75" />
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
  en,
}: {
  plan: KhatmaState;
  updatePlan: (p: KhatmaState) => void;
  en: boolean;
}) {
  const {
      pagesPerDay,
      completedDays,
      pagesRead,
      startPage,
      endPage,
      progress,
      isBehindSchedule,
    } = metrics(plan),
    remainingPages = Math.max(0, 604 - pagesRead),
    remainingDays = Math.max(0, plan.goalDays - completedDays),
    t = today(),
    doneToday = plan.completedDates.includes(t),
    complete = progress >= 100,
    endDate = useMemo(() => {
      const d = new Date(`${plan.startedAt}T12:00:00`);
      d.setDate(d.getDate() + plan.goalDays - 1);
      return d.toLocaleDateString(en ? "en-US" : "ar-AE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }, [plan.goalDays, plan.startedAt, en]);
  return (
    <>
      <Hero
        image={images.plan}
        title={en ? "Khatma Plan" : "خطة الختمة"}
        sub={
          en
            ? "A flexible plan based on 604 pages"
            : "خطة مرنة مبنية على 604 صفحات"
        }
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
            <span>{en ? "complete" : "مكتمل"}</span>
          </div>
        </div>
        <div className="khatmaToday">
          <small>
            {complete
              ? en
                ? "Khatma complete"
                : "تمت الختمة"
              : en
                ? "Today's wird"
                : "ورد اليوم"}
          </small>
          <h2>
            {complete
              ? en
                ? "May Allah bless you for completing the Quran"
                : "بارك الله لك في ختم القرآن"
              : en
                ? `From page ${startPage} to ${endPage}`
                : `من صفحة ${startPage} إلى ${endPage}`}
          </h2>
          <p>
            {complete
              ? en
                ? "Start a new plan"
                : "ابدأ خطة جديدة"
              : en
                ? `${pagesPerDay} pages daily`
                : `${pagesPerDay} صفحة يوميًا`}
          </p>
          {!complete && isBehindSchedule && (
            <p className="khatmaBehindNote">
              {en
                ? "You're behind pace — remaining pages have been redistributed over the remaining days."
                : "تأخرت قليلاً عن الخطة — تمت إعادة توزيع الصفحات المتبقية على الأيام القادمة."}
            </p>
          )}
        </div>
      </section>
      <section className="glass">
        <label className="khatmaRange">
          {en ? "Khatma duration: " : "مدة الختمة: "}
          <b>{plan.goalDays} {en ? "days" : "يومًا"}</b>
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
            <span>{en ? "days done" : "يوم منجز"}</span>
          </div>
          <div>
            <b>{remainingDays}</b>
            <span>{en ? "days left" : "يوم متبقٍ"}</span>
          </div>
          <div>
            <b>{remainingPages}</b>
            <span>{en ? "pages left" : "صفحة متبقية"}</span>
          </div>
        </div>
        <p className="khatmaDate">
          <CalendarDays />{" "}
          {en ? "Expected finish date: " : "تاريخ الانتهاء المتوقع: "}
          <b>{endDate}</b>
        </p>
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
            ? en
              ? "Khatma complete"
              : "اكتملت الختمة"
            : doneToday
              ? en
                ? "Today's wird recorded"
                : "تم تسجيل ورد اليوم"
              : en
                ? "Mark today complete"
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
          {en ? "Undo last entry" : "تراجع عن آخر إنجاز"}
        </button>
        <button
          className="khatmaReset"
          onClick={() =>
            window.confirm(
              en
                ? "Start a new khatma plan and clear current progress?"
                : "هل تريد بدء خطة ختمة جديدة؟",
            ) &&
            updatePlan({
              goalDays: plan.goalDays,
              completedDates: [],
              startedAt: today(),
            })
          }
        >
          <RotateCcw />
          {en ? "Start new plan" : "بدء خطة جديدة"}
        </button>
      </section>
    </>
  );
}
function TasbeehPage({
  en,
  state,
  update,
  view,
  setView,
  query,
  setQuery,
}: {
  en: boolean;
  state: TasbeehState;
  update: (s: TasbeehState) => void;
  view: "counter" | "sections" | "favorites" | "search" | "settings";
  setView: (
    v: "counter" | "sections" | "favorites" | "search" | "settings",
  ) => void;
  query: string;
  setQuery: (q: string) => void;
}) {
  const phrases = useMemo(
    () => adhkar.filter((a) => a.category === "general"),
    [],
  );
  const currentPhrase = phrases.find((p) => p.id === state.current);
  const favoritePhrases = phrases.filter((p) =>
    state.favorites.includes(p.id),
  );
  const filteredPhrases = phrases.filter(
    (p) => !query || p.ar.includes(query),
  );
  async function tap() {
    const count = state.count + 1;
    update({ ...state, count });
    if (Capacitor.isNativePlatform() && state.haptic) {
      if (state.goal > 0 && count % state.goal === 0)
        await Haptics.notification({ type: NotificationType.Success });
      else await Haptics.impact({ style: ImpactStyle.Light });
    }
  }
  function selectPhrase(id: string) {
    update({ ...state, current: id });
    setView("counter");
  }
  function toggleFavorite(id: string) {
    const favorites = state.favorites.includes(id)
      ? state.favorites.filter((f) => f !== id)
      : [...state.favorites, id];
    update({ ...state, favorites });
  }
  function phraseRow(p: AdhkarItem) {
    return (
      <button
        key={p.id}
        className={"tasbeehItem" + (state.current === p.id ? " active" : "")}
        onClick={() => selectPhrase(p.id)}
      >
        <div className="tasbeehItemText">
          <p>{p.ar}</p>
          <small>
            {p.count} {en ? "times" : "مرة"}
          </small>
        </div>
        <span
          className="tasbeehStar"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(p.id);
          }}
        >
          <Star
            className={state.favorites.includes(p.id) ? "starred" : ""}
          />
        </span>
      </button>
    );
  }
  return (
    <>
      <div className="tasbeehHeader">
        <h1>{en ? "Electronic Tasbeeh" : "المسبحة الإلكترونية"}</h1>
        <p>
          {en ? "Today's goal: " : "هدف اليوم: "}
          {state.goal}
        </p>
      </div>
      <nav className="tasbeehNav">
        {(
          [
            ["sections", Grid3x3, en ? "Sections" : "الأقسام"],
            ["search", Search, en ? "Search" : "البحث"],
            ["counter", CircleDot, en ? "Counter" : "العداد"],
            ["favorites", Star, en ? "Favorites" : "المفضلة"],
            ["settings", Settings, en ? "Settings" : "الإعدادات"],
          ] as const
        ).map(([k, I, l]) => (
          <button
            key={k}
            className={view === k ? "on" : ""}
            onClick={() => setView(k)}
          >
            <I />
            <span>{l}</span>
          </button>
        ))}
      </nav>
      {view === "counter" && (
        <>
          <div className="tasbeehPhrase">
            {currentPhrase ? (
              <>
                <span>{currentPhrase.ar}</span>
                <button onClick={() => update({ ...state, current: null })}>
                  <X />
                </button>
              </>
            ) : (
              <span className="tasbeehFree">
                {en ? "Free tasbeeh" : "تسبيح حر"}
              </span>
            )}
          </div>
          <button className="tasbeehCircle" onClick={tap}>
            <b>{state.count}</b>
            <small>{en ? "Tap to count" : "اضغط للتسبيح"}</small>
          </button>
          <div className="tasbeehActions">
            <button
              className="secondary"
              onClick={() => update({ ...state, goal: state.goal + 100 })}
            >
              <Plus />
              100
            </button>
            <button
              className="secondary"
              onClick={() => update({ ...state, count: 0 })}
            >
              <RotateCcw />
              {en ? "Reset" : "تصفير"}
            </button>
          </div>
        </>
      )}
      {view === "sections" && (
        <div className="tasbeehList">{phrases.map(phraseRow)}</div>
      )}
      {view === "favorites" && (
        <div className="tasbeehList">
          {favoritePhrases.length === 0 && (
            <p className="tasbeehEmpty">
              {en
                ? "No favorites yet — star a phrase from Sections."
                : "لا توجد مفضلة بعد — أضف نجمة من الأقسام."}
            </p>
          )}
          {favoritePhrases.map(phraseRow)}
        </div>
      )}
      {view === "search" && (
        <>
          <label className="search">
            <Search />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={en ? "Search phrases..." : "ابحث عن ذكر..."}
            />
          </label>
          <div className="tasbeehList">{filteredPhrases.map(phraseRow)}</div>
        </>
      )}
      {view === "settings" && (
        <section className="glass settings">
          <label>
            <Vibrate />
            {en ? "Vibration on tap" : "الاهتزاز عند الضغط"}
            <input
              type="checkbox"
              checked={state.haptic}
              onChange={(e) => update({ ...state, haptic: e.target.checked })}
            />
          </label>
          <label className="tasbeehGoalInput">
            <Target />
            {en ? "Daily goal" : "هدف اليوم"}
            <input
              type="number"
              min={1}
              value={state.goal}
              onChange={(e) =>
                update({ ...state, goal: Math.max(1, +e.target.value || 1) })
              }
            />
          </label>
          <button
            className="secondary"
            disabled={!state.favorites.length}
            onClick={() => update({ ...state, favorites: [] })}
          >
            <RotateCcw />
            {en ? "Clear favorites" : "مسح المفضلة"}
          </button>
        </section>
      )}
    </>
  );
}
function CityPicker({
  city,
  choose,
  close,
  en,
}: {
  city: City;
  choose: (c: City) => void;
  close: () => void;
  en: boolean;
}) {
  const [q, setQ] = useState("");
  return (
    <div className="modal">
      <section className="sheet citySheet">
        <div className="sheetHead">
          <h2>{en ? "Choose a City" : "اختيار المدينة"}</h2>
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
            placeholder={en ? "City or country" : "مدينة أو دولة"}
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
                <b>{en ? c.en : c.ar}</b>
                <small>{en ? c.ar : c.en}</small>
              </button>
            ))}
        </div>
      </section>
    </div>
  );
}
function KaabaIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={`kaabaSvg ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id="kaabaGoldBand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FCE9A8" />
          <stop offset="45%" stopColor="#E5C566" />
          <stop offset="100%" stopColor="#9A7421" />
        </linearGradient>
        <linearGradient id="kaabaKiswah" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1F1F1F" />
          <stop offset="100%" stopColor="#0A0A0A" />
        </linearGradient>
      </defs>
      <ellipse cx="32" cy="56" rx="22" ry="3.5" fill="#000" opacity="0.18" />
      <rect x="14" y="20" width="36" height="32" rx="1.4" fill="url(#kaabaKiswah)" stroke="#000" strokeWidth="0.6" />
      <line x1="23" y1="20" x2="23" y2="52" stroke="#262626" strokeWidth="0.5" />
      <line x1="32" y1="20" x2="32" y2="52" stroke="#262626" strokeWidth="0.5" />
      <line x1="41" y1="20" x2="41" y2="52" stroke="#262626" strokeWidth="0.5" />
      <rect x="14" y="30" width="36" height="4.5" fill="url(#kaabaGoldBand)" />
      <rect x="14" y="20" width="36" height="1.6" fill="#5C5C5C" />
      <rect x="28" y="36" width="8" height="16" rx="1" fill="url(#kaabaGoldBand)" opacity="0.92" />
      <rect x="28" y="36" width="8" height="16" rx="1" fill="none" stroke="#7E5E18" strokeWidth="0.5" />
      <rect x="13" y="18" width="38" height="2.4" rx="0.6" fill="url(#kaabaGoldBand)" opacity="0.85" />
    </svg>
  );
}
function QiblaCompass({ city, en }: { city: City; en: boolean }) {
  const bearing = Math.round(Qibla(new Coordinates(city.lat, city.lng))),
    [heading, setHeading] = useState<number | null>(null),
    [aligned, setAligned] = useState(false),
    smoothedSin = useRef(0),
    smoothedCos = useRef(0),
    hasSmoothed = useRef(false),
    headingRef = useRef<number | null>(null),
    alignedRef = useRef(false);
  useEffect(() => {
    let raf = 0,
      lastVisual = 0;
    const receivedAbsolute = { current: false };
    const process = (rawV: number) => {
      const v = (rawV + (screen.orientation?.angle || 0) + 360) % 360;
      // Low-pass filter: the magnetometer alone can swing several degrees
      // from moment to moment even while the phone is perfectly still, so
      // ordinary noise (small/medium jumps) is smoothed heavily. Only a
      // large jump — a real, intentional turn of the phone — is allowed to
      // move the filter quickly.
      let alpha = 0.08;
      if (hasSmoothed.current) {
        const prevDeg =
          ((Math.atan2(smoothedSin.current, smoothedCos.current) * 180) /
            Math.PI +
            360) %
          360;
        const diff = Math.abs(((v - prevDeg + 540) % 360) - 180);
        if (diff > 30) alpha = 0.5;
        else if (diff > 12) alpha = 0.2;
        else alpha = 0.08;
      }
      const rad = (v * Math.PI) / 180;
      smoothedSin.current =
        (1 - alpha) * smoothedSin.current + alpha * Math.sin(rad);
      smoothedCos.current =
        (1 - alpha) * smoothedCos.current + alpha * Math.cos(rad);
      hasSmoothed.current = true;
    };
    // "deviceorientationabsolute" and a plain "deviceorientation" event can
    // both fire for the same physical reading on some devices — one
    // referenced to true/magnetic north, the other (without
    // webkitCompassHeading) referenced to wherever the phone happened to be
    // pointed when listening started. Feeding both into the same filter
    // means the needle keeps getting yanked between two different
    // reference frames, which looks exactly like constant shake. So: trust
    // an absolute reading (deviceorientationabsolute, or webkitCompassHeading
    // on iOS) once it's available, and only fall back to the relative
    // "deviceorientation" alpha for devices that never provide one.
    const onAbsolute = (e: any) => {
      if (typeof e.webkitCompassHeading === "number") {
        receivedAbsolute.current = true;
        process(e.webkitCompassHeading);
      } else if (typeof e.alpha === "number") {
        receivedAbsolute.current = true;
        process((360 - e.alpha) % 360);
      }
    };
    const onRelative = (e: any) => {
      if (typeof e.webkitCompassHeading === "number") {
        receivedAbsolute.current = true;
        process(e.webkitCompassHeading);
        return;
      }
      if (receivedAbsolute.current) return;
      if (typeof e.alpha === "number") process((360 - e.alpha) % 360);
    };
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!hasSmoothed.current) return;
      const now = performance.now();
      if (now - lastVisual < 33) return; // ~30 fps visual cap
      const avg =
        ((Math.atan2(smoothedSin.current, smoothedCos.current) * 180) /
          Math.PI +
          360) %
        360;
      // Resultant vector length of the smoothed reading: close to 1 means
      // recent samples agree closely (the phone is steady), so widen the
      // deadzone and hold the needle still. A lower value means the
      // readings disagree (real movement, or a noisy moment) — narrow the
      // deadzone so the dial stays responsive.
      const r = Math.sqrt(
        smoothedSin.current * smoothedSin.current +
          smoothedCos.current * smoothedCos.current,
      );
      const deadzone = r > 0.999 ? 2.2 : r > 0.995 ? 1.2 : 0.5;
      const prev = headingRef.current;
      if (prev !== null) {
        const diff = Math.abs(((avg - prev + 540) % 360) - 180);
        if (diff < deadzone) {
          const d = ((bearing - avg + 540) % 360) - 180;
          const isAligned = Math.abs(d) <= 3;
          if (isAligned !== alignedRef.current) {
            alignedRef.current = isAligned;
            setAligned(isAligned);
          }
          return;
        }
      }
      lastVisual = now;
      headingRef.current = avg;
      setHeading(avg);
      const d = ((bearing - avg + 540) % 360) - 180;
      const isAligned = Math.abs(d) <= 3;
      if (isAligned !== alignedRef.current) {
        alignedRef.current = isAligned;
        setAligned(isAligned);
      }
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener("deviceorientationabsolute", onAbsolute, true);
    window.addEventListener("deviceorientation", onRelative, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("deviceorientationabsolute", onAbsolute, true);
      window.removeEventListener("deviceorientation", onRelative, true);
    };
  }, [bearing]);
  const delta =
    heading === null ? bearing : ((bearing - heading + 540) % 360) - 180;
  const deltaAbs = Math.abs(Math.round(delta));
  return (
    <section
      className={`compassCard ${aligned ? "isAligned" : ""} ${
        heading === null ? "noSensor" : ""
      }`}
    >
      <div className="compassStage">
        <div className="compassGlowOuter" />
        <div className="compassGlowInner" />
        <div className="compassBezel" />
        {/* Rotating dial: rotates by -heading so magnetic North follows the phone */}
        <div
          className="compassDial"
          style={{
            transform: `rotate(${heading === null ? 0 : -heading}deg)`,
          }}
        >
          {Array.from({ length: 72 }, (_, i) => (
            <div
              key={i}
              className={`tickWrap ${
                i % 18 === 0 ? "cardinal" : i % 6 === 0 ? "major" : ""
              }`}
              style={{ transform: `rotate(${i * 5}deg)` }}
            >
              <span className="tick" />
            </div>
          ))}
          <span className="cardinalLetter posN">N</span>
          <span className="cardinalLetter posE">E</span>
          <span className="cardinalLetter posS">S</span>
          <span className="cardinalLetter posW">W</span>
        </div>
        {/* Kaaba marker - fixed in screen space at the angle to Qibla */}
        <div
          className="kaabaWrap"
          style={{ transform: `rotate(${delta}deg)` }}
        >
          <div
            className="kaabaInner"
            style={{ transform: `rotate(${-delta}deg)` }}
          >
            <KaabaIcon />
            <small>{en ? "Kaaba" : "الكعبة"}</small>
          </div>
        </div>
        {/* Fixed top indicator - the user's facing direction */}
        <div className="compassTopMark" aria-hidden="true">
          <svg viewBox="0 0 16 12" width="16" height="12">
            <path d="M8 12 L0 0 L16 0 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="compassHub" />
      </div>
      <div className="compassReadout">
        <div className="compassBearing">
          <small>{en ? "Qibla bearing" : "اتجاه القبلة"}</small>
          <h2>{bearing}°</h2>
        </div>
        <div className={`compassStatus ${aligned ? "aligned" : ""}`}>
          {heading === null ? (
            <span>
              {en
                ? "Sensor unavailable — use the fixed bearing"
                : "المستشعر غير متاح — استخدم الدرجة الثابتة"}
            </span>
          ) : aligned ? (
            <>
              <CheckCircle2 />
              <span>{en ? "Aligned with Qibla" : "أنت على القبلة"}</span>
            </>
          ) : (
            <span>
              {en ? `${deltaAbs}° to Qibla` : `تبقى ${deltaAbs}° للقبلة`}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
