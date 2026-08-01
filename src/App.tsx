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

type Tab = "home" | "quran" | "adhkar" | "qibla" | "more";
type More = "menu" | "plan" | "hadith" | "settings";

type Chapter = {
  id: number;
  name: string;
  total_verses: number;
  verses: { id: number; text: string }[];
};

type KhatmaState = {
  goalDays: number;
  completedDates: string[];
  startedAt: string;
};

const TOTAL_QURAN_PAGES = 604;
const KHATMA_STORAGE_KEY = "afaq-khatma-v2";

const load = <T,>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) || "") as T;
  } catch {
    return fallback;
  }
};

const save = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};

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

function calculationMethod(city: City) {
  switch (city.method) {
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

function getTodayKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadKhatma(): KhatmaState {
  try {
    const plan = JSON.parse(
      localStorage.getItem(KHATMA_STORAGE_KEY) || "null",
    ) as KhatmaState | null;

    if (
      plan &&
      typeof plan.goalDays === "number" &&
      Array.isArray(plan.completedDates) &&
      typeof plan.startedAt === "string"
    ) {
      return {
        goalDays: Math.min(365, Math.max(7, plan.goalDays)),
        completedDates: Array.from(new Set(plan.completedDates)),
        startedAt: plan.startedAt,
      };
    }
  } catch {
    // Use the default plan when stored data is invalid.
  }

  return {
    goalDays: 30,
    completedDates: [],
    startedAt: getTodayKey(),
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
  const [tab, setTab] = useState<Tab>("home");
  const [more, setMore] = useState<More>("menu");
  const [dark, setDark] = useState(() => load("dark", false));
  const [city, setCity] = useState<City>(() => load("city", cities[0]));
  const [picker, setPicker] = useState(false);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [font, setFont] = useState(() => load("quran-font", 30));
  const [marks, setMarks] = useState<Record<string, boolean>>(() =>
    load("bookmarks", {}),
  );
  const [counts, setCounts] = useState<Record<string, number>>(() =>
    load("adhkar-counts", {}),
  );
  const [query, setQuery] = useState("");
  const [prompt, setPrompt] = useState(
    () => !load("notification-intro", false),
  );
  const [modal, setModal] = useState<"privacy" | "about" | null>(null);
  const [remaining, setRemaining] = useState("");
  const [khatma, setKhatma] = useState<KhatmaState>(loadKhatma);

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
    const prayerTimes = new PrayerTimes(
      new Coordinates(city.lat, city.lng),
      new Date(),
      calculationMethod(city),
    );

    return [
      ["fajr", "الفجر", prayerTimes.fajr],
      ["sunrise", "الشروق", prayerTimes.sunrise],
      ["dhuhr", "الظهر", prayerTimes.dhuhr],
      ["asr", "العصر", prayerTimes.asr],
      ["maghrib", "المغرب", prayerTimes.maghrib],
      ["isha", "العشاء", prayerTimes.isha],
    ] as const;
  }, [city]);

  const nextPrayer = useMemo(() => {
    const now = new Date();
    const upcoming = times.find((item) => item[2] > now);

    if (upcoming) return upcoming;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const prayerTimes = new PrayerTimes(
      new Coordinates(city.lat, city.lng),
      tomorrow,
      calculationMethod(city),
    );

    return ["fajr", "الفجر", prayerTimes.fajr] as const;
  }, [times, city]);

  useEffect(() => {
    const tick = () => {
      const milliseconds = Math.max(0, nextPrayer[2].getTime() - Date.now());
      const hours = Math.floor(milliseconds / 3_600_000);
      const minutes = Math.floor((milliseconds % 3_600_000) / 60_000);
      const seconds = Math.floor((milliseconds % 60_000) / 1000);

      setRemaining(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
      );
    };

    tick();
    const timer = window.setInterval(tick, 1000);

    if (Capacitor.isNativePlatform()) {
      void PrayerWidget.update({
        prayer: nextPrayer[1],
        city: city.ar,
        target: nextPrayer[2].getTime(),
      }).catch(() => undefined);
    }

    return () => window.clearInterval(timer);
  }, [nextPrayer, city]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let removeListener: (() => void) | undefined;

    void NativeApp.addListener("backButton", () => {
      if (prompt) setPrompt(false);
      else if (modal) setModal(null);
      else if (picker) setPicker(false);
      else if (chapter) setChapter(null);
      else if (tab !== "home") {
        setTab("home");
        setMore("menu");
      } else {
        void NativeApp.exitApp();
      }
    }).then((handle) => {
      removeListener = () => void handle.remove();
    });

    return () => removeListener?.();
  }, [prompt, modal, picker, chapter, tab]);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("ar-AE", {
      hour: "2-digit",
      minute: "2-digit",
    });

  async function askNotifications() {
    save("notification-intro", true);
    setPrompt(false);

    if (!Capacitor.isNativePlatform()) return;

    const permission = await LocalNotifications.requestPermissions();
    if (permission.display === "granted") {
      await scheduleNotifications();
    }
  }

  async function scheduleNotifications() {
    if (!Capacitor.isNativePlatform()) return;

    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }

    await LocalNotifications.createChannel({
      id: "prayer",
      name: "مواقيت الصلاة",
      importance: 5,
    });

    await LocalNotifications.createChannel({
      id: "reminders",
      name: "التذكيرات",
      importance: 4,
    });

    const now = new Date();
    const notifications: any[] = [];

    for (let day = 0; day < 14; day += 1) {
      const date = new Date();
      date.setDate(date.getDate() + day);

      const prayerTimes = new PrayerTimes(
        new Coordinates(city.lat, city.lng),
        date,
        calculationMethod(city),
      );

      [
        ["الفجر", prayerTimes.fajr],
        ["الظهر", prayerTimes.dhuhr],
        ["العصر", prayerTimes.asr],
        ["المغرب", prayerTimes.maghrib],
        ["العشاء", prayerTimes.isha],
      ].forEach((item, index) => {
        const prayerAt = item[1] as Date;
        if (prayerAt > now) {
          notifications.push({
            id: 4000 + day * 10 + index,
            title: `حان وقت صلاة ${item[0]}`,
            body: city.ar,
            schedule: { at: prayerAt, allowWhileIdle: true },
            channelId: "prayer",
          });
        }
      });

      const adhkarAt = new Date(date);
      adhkarAt.setHours(7, 0, 0, 0);
      if (adhkarAt > now) {
        notifications.push({
          id: 2000 + day,
          title: "أذكار الصباح",
          body: "ابدأ يومك بذكر الله",
          schedule: { at: adhkarAt },
          channelId: "reminders",
        });
      }

      const wirdAt = new Date(date);
      wirdAt.setHours(20, 0, 0, 0);
      if (wirdAt > now) {
        notifications.push({
          id: 1000 + day,
          title: "وردك اليومي",
          body: "خصص دقائق لورد القرآن",
          schedule: { at: wirdAt },
          channelId: "reminders",
        });
      }

      const hadithAt = new Date(date);
      hadithAt.setHours(12, 0, 0, 0);
      if (hadithAt > now) {
        const item = hadiths[(day + new Date().getDate()) % hadiths.length];

        notifications.push({
          id: 3000 + day,
          title: "حديث اليوم",
          body: `${item[0]} — ${item[2]}`,
          schedule: { at: hadithAt },
          channelId: "reminders",
        });
      }
    }

    await LocalNotifications.schedule({ notifications });
  }

  async function openSura(id: number) {
    const response = await fetch(`./quran/${id}.json`);
    const data = (await response.json()) as Chapter;
    setChapter(data);
  }

  function go(nextTab: Tab) {
    setTab(nextTab);
    setMore("menu");
    setChapter(null);
  }

  function updateKhatma(nextPlan: KhatmaState) {
    setKhatma(nextPlan);
    save(KHATMA_STORAGE_KEY, nextPlan);
  }

  const filteredHadiths = hadiths.filter((hadith) =>
    `${hadith[0]} ${hadith[1]} ${hadith[2]}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <div className="app">
      <header>
        <div className="brand">
          <b>أ</b>
          <span>
            <strong>آفاق الإيمان</strong>
            <small onClick={() => setPicker(true)}>{city.ar}</small>
          </span>
        </div>

        <div className="headBtns">
          <button onClick={() => setPicker(true)} aria-label="اختيار المدينة">
            <MapPin />
          </button>
          <button onClick={() => setDark(!dark)} aria-label="تغيير المظهر">
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
                backgroundImage: `linear-gradient(90deg,#021c17ed,#04312835),url('${images[nextPrayer[0]]}')`,
              }}
            >
              <span>الصلاة القادمة</span>
              <h1>{nextPrayer[1]}</h1>
              <strong>{formatTime(nextPrayer[2])}</strong>
              <div className="countdown">
                <small>متبقي</small>
                <b>{remaining}</b>
              </div>
              <p>
                <MapPin /> {city.ar}
              </p>
            </section>

            <section className="prayerGrid">
              {times.map((item) => (
                <div
                  className={item[0] === nextPrayer[0] ? "active" : ""}
                  key={item[0]}
                >
                  <span>{item[1]}</span>
                  <b>{formatTime(item[2])}</b>
                </div>
              ))}
            </section>

            <section className="quick">
              <button onClick={() => go("quran")}>
                <BookOpen /> القرآن
              </button>
              <button onClick={() => go("adhkar")}>
                <Heart /> الأذكار
              </button>
              <button onClick={() => go("qibla")}>
                <Compass /> القبلة
              </button>
            </section>

            <section className="glass">
              <small>حديث عشوائي</small>
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
                فتح المكتبة
              </button>
            </section>
          </>
        )}

        {tab === "quran" &&
          (chapter ? (
            <Reader
              c={chapter}
              font={font}
              setFont={setFont}
              marks={marks}
              toggle={(id) => {
                const key = `${chapter.id}:${id}`;
                const nextMarks = { ...marks, [key]: !marks[key] };
                setMarks(nextMarks);
                save("bookmarks", nextMarks);
              }}
              back={() => setChapter(null)}
            />
          ) : (
            <>
              <Hero
                image={images.quran}
                title="القرآن الكريم"
                sub="قراءة متصلة بخط قرآني محلي"
              />
              <div className="suras">
                {Array.from({ length: 114 }, (_, index) => (
                  <button key={index} onClick={() => void openSura(index + 1)}>
                    <b>{index + 1}</b>
                    <span>سورة رقم {index + 1}</span>
                    <ChevronLeft />
                  </button>
                ))}
              </div>
            </>
          ))}

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
              <RotateCcw /> إعادة ضبط الكل
            </button>

            <div className="zikrList">
              {adhkar.map(([id, text, target]) => {
                const count = counts[id] || 0;
                const progress = (count / target) * 100;

                return (
                  <button
                    className={`zikr ${count === target ? "done" : ""}`}
                    key={id}
                    onClick={async () => {
                      if (count >= target) return;
                      const nextCount = count + 1;
                      const nextCounts = { ...counts, [id]: nextCount };
                      setCounts(nextCounts);
                      save("adhkar-counts", nextCounts);

                      if (Capacitor.isNativePlatform()) {
                        if (nextCount === target) {
                          await Haptics.notification({
                            type: NotificationType.Success,
                          });
                        } else {
                          await Haptics.impact({ style: ImpactStyle.Light });
                        }
                      }
                    }}
                  >
                    <div
                      className="ring"
                      style={{
                        background: `conic-gradient(var(--gold) ${progress}%,var(--line) 0)`,
                      }}
                    >
                      <i>{count}</i>
                      <small>/{target}</small>
                    </div>
                    <p>{text}</p>
                    <span>{count === target ? "مكتمل" : "اضغط للعد"}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {tab === "qibla" && (
          <>
            <Hero
              image={images.qibla}
              title="اتجاه القبلة"
              sub={`حسب ${city.ar}`}
            />
            <QiblaCompass city={city} />
          </>
        )}

        {tab === "more" && more === "menu" && (
          <>
            <h1>المزيد</h1>
            <div className="menuGrid">
              <button onClick={() => setMore("plan")}>
                <CalendarDays /> الختمة
              </button>
              <button onClick={() => setMore("hadith")}>
                <Library /> الأحاديث
              </button>
              <button onClick={() => setPicker(true)}>
                <MapPin /> المدينة
              </button>
              <button onClick={() => setMore("settings")}>
                <Settings /> الإعدادات
              </button>
            </div>
          </>
        )}

        {tab === "more" && more === "plan" && (
          <KhatmaPage
            plan={khatma}
            updatePlan={updateKhatma}
            onRead={() => {
              setTab("quran");
              setChapter(null);
            }}
          />
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
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ابحث بكلمة أو رقم"
              />
            </label>
            {filteredHadiths.map((hadith, index) => (
              <article className="glass" key={index}>
                <p>«{hadith[0]}»</p>
                <p>{hadith[1]}</p>
                <small>{hadith[2]}</small>
              </article>
            ))}
          </>
        )}

        {tab === "more" && more === "settings" && (
          <>
            <h1>الإعدادات</h1>
            <section className="glass settings">
              <label>
                <Moon /> الوضع الليلي
                <input
                  type="checkbox"
                  checked={dark}
                  onChange={() => setDark(!dark)}
                />
              </label>
              <button className="primary" onClick={scheduleNotifications}>
                <Bell /> إعادة جدولة الإشعارات
              </button>
              <button className="link" onClick={() => setModal("privacy")}>
                <Shield /> سياسة الخصوصية
              </button>
              <button className="link" onClick={() => setModal("about")}>
                <Info /> حول البرنامج
              </button>
            </section>
          </>
        )}
      </main>

      <nav>
        {(
          [
            ["home", Home, "الرئيسية"],
            ["quran", BookOpen, "القرآن"],
            ["adhkar", Heart, "الأذكار"],
            ["qibla", Compass, "القبلة"],
            ["more", Settings, "المزيد"],
          ] as const
        ).map(([key, Icon, label]) => (
          <button
            key={key}
            className={tab === key ? "on" : ""}
            onClick={() => go(key)}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {picker && (
        <CityPicker
          city={city}
          close={() => setPicker(false)}
          choose={(selectedCity) => {
            setCity(selectedCity);
            save("city", selectedCity);
            setPicker(false);
            window.setTimeout(() => void scheduleNotifications(), 0);
          }}
        />
      )}

      {prompt && (
        <div className="modal">
          <section className="sheet">
            <Bell />
            <h2>تفعيل التذكيرات</h2>
            <p>
              يستخدم آفاق الإيمان الإشعارات لمواقيت الصلاة والأذكار والورد
              والحديث اليومي.
            </p>
            <button className="primary" onClick={askNotifications}>
              السماح بالإشعارات
            </button>
            <button
              className="secondary"
              onClick={() => {
                save("notification-intro", true);
                setPrompt(false);
              }}
            >
              لاحقًا
            </button>
          </section>
        </div>
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
                <p>
                  آفاق الإيمان 1.5.0. المواقيت حسابية وقد تختلف بدقائق. النص
                  القرآني محلي، والتذكيرات تعمل بجدولة Android المحلية.
                </p>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function KhatmaPage({
  plan,
  updatePlan,
  onRead,
}: {
  plan: KhatmaState;
  updatePlan: (plan: KhatmaState) => void;
  onRead: (page: number) => void;
}) {
  const pagesPerDay = Math.ceil(TOTAL_QURAN_PAGES / plan.goalDays);
  const completedDays = plan.completedDates.length;
  const pagesRead = Math.min(TOTAL_QURAN_PAGES, completedDays * pagesPerDay);
  const startPage = Math.min(TOTAL_QURAN_PAGES, pagesRead + 1);
  const endPage = Math.min(TOTAL_QURAN_PAGES, startPage + pagesPerDay - 1);
  const remainingPages = Math.max(0, TOTAL_QURAN_PAGES - pagesRead);
  const remainingDays = Math.max(0, plan.goalDays - completedDays);
  const progress = Math.min(
    100,
    Math.round((pagesRead / TOTAL_QURAN_PAGES) * 100),
  );
  const today = getTodayKey();
  const completedToday = plan.completedDates.includes(today);
  const completedPlan = progress >= 100;

  const endDate = useMemo(() => {
    const date = new Date(`${plan.startedAt}T12:00:00`);
    date.setDate(date.getDate() + plan.goalDays - 1);
    return date.toLocaleDateString("ar-AE", {
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
            background: `conic-gradient(var(--gold) ${progress}%, var(--line) 0)`,
          }}
        >
          <div>
            <b>{progress}%</b>
            <span>مكتمل</span>
          </div>
        </div>

        <div className="khatmaToday">
          <small>{completedPlan ? "تمت الختمة" : "ورد اليوم"}</small>
          <h2>
            {completedPlan
              ? "بارك الله لك في ختم القرآن"
              : `من صفحة ${startPage} إلى ${endPage}`}
          </h2>
          <p>
            {completedPlan ? "ابدأ خطة جديدة" : `${pagesPerDay} صفحة يوميًا`}
          </p>
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
            onChange={(event) =>
              updatePlan({
                ...plan,
                goalDays: Number(event.target.value),
              })
            }
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

        {!completedPlan && (
          <button
            className="secondary khatmaAction"
            onClick={() => onRead(startPage)}
          >
            <BookOpen /> قراءة ورد اليوم
          </button>
        )}

        <button
          className="primary khatmaAction"
          disabled={completedToday || completedPlan}
          onClick={() => {
            if (completedToday || completedPlan) return;
            updatePlan({
              ...plan,
              completedDates: [...plan.completedDates, today],
            });
          }}
        >
          <CheckCircle2 />
          {completedPlan
            ? "اكتملت الختمة"
            : completedToday
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
          <Undo2 /> تراجع عن آخر إنجاز
        </button>

        <button
          className="khatmaReset"
          onClick={() => {
            if (
              !window.confirm(
                "هل تريد بدء خطة ختمة جديدة وحذف تقدم الخطة الحالية؟",
              )
            ) {
              return;
            }

            updatePlan({
              goalDays: plan.goalDays,
              completedDates: [],
              startedAt: getTodayKey(),
            });
          }}
        >
          <RotateCcw /> بدء خطة جديدة
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
  choose: (city: City) => void;
  close: () => void;
}) {
  const [query, setQuery] = useState("");

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
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="مدينة أو دولة"
          />
        </label>
        <div className="cityList">
          {cities
            .filter((item) =>
              `${item.ar} ${item.en}`
                .toLowerCase()
                .includes(query.toLowerCase()),
            )
            .map((item) => (
              <button
                className={item.id === city.id ? "selected" : ""}
                key={item.id}
                onClick={() => choose(item)}
              >
                <b>{item.ar}</b>
                <small>{item.en}</small>
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
  setFont: (font: number) => void;
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
              const nextFont = Math.max(22, font - 2);
              setFont(nextFont);
              save("quran-font", nextFont);
            }}
          >
            <Minus />
          </button>
          <button
            onClick={() => {
              const nextFont = Math.min(46, font + 2);
              setFont(nextFont);
              save("quran-font", nextFont);
            }}
          >
            <Plus />
          </button>
        </div>
      </div>

      <section className="mushafPage" style={{ fontSize: font }}>
        {c.verses.map((verse) => {
          const key = `${c.id}:${verse.id}`;
          const marked = marks[key];

          return (
            <span className="verse" key={verse.id}>
              {verse.text} <b>﴿{verse.id}﴾</b>
              <button
                className={marked ? "marked" : ""}
                onClick={() => toggle(verse.id)}
                aria-label="حفظ الآية"
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
  const bearing = Math.round(Qibla(new Coordinates(city.lat, city.lng)));
  const [heading, setHeading] = useState<number | null>(null);
  const buffer = useRef<number[]>([]);
  const lastUpdate = useRef(0);

  useEffect(() => {
    const handler = (event: any) => {
      if (performance.now() - lastUpdate.current < 100) return;
      lastUpdate.current = performance.now();

      let value =
        typeof event.webkitCompassHeading === "number"
          ? event.webkitCompassHeading
          : typeof event.alpha === "number"
            ? (360 - event.alpha) % 360
            : null;

      if (value === null) return;

      value = (value + (screen.orientation?.angle || 0) + 360) % 360;
      buffer.current.push(value);
      if (buffer.current.length > 20) buffer.current.shift();

      const sin = buffer.current.reduce(
        (sum, item) => sum + Math.sin((item * Math.PI) / 180),
        0,
      );
      const cos = buffer.current.reduce(
        (sum, item) => sum + Math.cos((item * Math.PI) / 180),
        0,
      );
      const average = ((Math.atan2(sin, cos) * 180) / Math.PI + 360) % 360;

      setHeading((previous) =>
        previous === null ||
        Math.abs(((average - previous + 540) % 360) - 180) > 2.5
          ? average
          : previous,
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
          style={{
            transform: `translate(-50%,-100%) rotate(${delta}deg)`,
          }}
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
