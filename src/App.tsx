import { useEffect, useMemo, useState } from "react";
import {
  Home,
  BookOpen,
  Library,
  Search,
  Settings,
  Moon,
  Sun,
  Bell,
  Info,
  Shield,
  Bookmark,
  ChevronLeft,
  X,
  CalendarDays,
  MapPin,
} from "lucide-react";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";
import { hadiths } from "./hadith";
import { PrayerTimes, Coordinates, CalculationMethod } from "adhan";

type Tab = "home" | "quran" | "plan" | "hadith" | "settings";

type Chapter = {
  id: number;
  name: string;
  transliteration: string;
  total_verses: number;
  verses: {
    id: number;
    text: string;
  }[];
};

type NotificationSettings = {
  prayer: boolean;
  adhkar: boolean;
  wird: boolean;
  hadith: boolean;
};

type SectionHeroProps = {
  image: string;
  title: string;
  subtitle?: string;
  className?: string;
};

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

const asset = (path: string) => `./${path}`;

const prayerHeroImages: Record<string, string> = {
  fajr: asset("images/home/prayer-fajr.webp"),
  sunrise: asset("images/home/prayer-sunrise.webp"),
  dhuhr: asset("images/home/prayer-dhuhr.webp"),
  asr: asset("images/home/prayer-asr.webp"),
  maghrib: asset("images/home/prayer-maghrib.webp"),
  isha: asset("images/home/prayer-isha.webp"),
};

const sectionHeroImages = {
  home: asset("images/home/prayer-hero.webp"),
  quran: asset("images/quran/quran-hero.webp"),
  khatma: asset("images/khatma/khatma-hero.webp"),
  hadith: asset("images/hadith/hadith-hero.webp"),
};

const suras = [
  "الفاتحة",
  "البقرة",
  "آل عمران",
  "النساء",
  "المائدة",
  "الأنعام",
  "الأعراف",
  "الأنفال",
  "التوبة",
  "يونس",
  "هود",
  "يوسف",
  "الرعد",
  "إبراهيم",
  "الحجر",
  "النحل",
  "الإسراء",
  "الكهف",
  "مريم",
  "طه",
  "الأنبياء",
  "الحج",
  "المؤمنون",
  "النور",
  "الفرقان",
  "الشعراء",
  "النمل",
  "القصص",
  "العنكبوت",
  "الروم",
  "لقمان",
  "السجدة",
  "الأحزاب",
  "سبأ",
  "فاطر",
  "يس",
  "الصافات",
  "ص",
  "الزمر",
  "غافر",
  "فصلت",
  "الشورى",
  "الزخرف",
  "الدخان",
  "الجاثية",
  "الأحقاف",
  "محمد",
  "الفتح",
  "الحجرات",
  "ق",
  "الذاريات",
  "الطور",
  "النجم",
  "القمر",
  "الرحمن",
  "الواقعة",
  "الحديد",
  "المجادلة",
  "الحشر",
  "الممتحنة",
  "الصف",
  "الجمعة",
  "المنافقون",
  "التغابن",
  "الطلاق",
  "التحريم",
  "الملك",
  "القلم",
  "الحاقة",
  "المعارج",
  "نوح",
  "الجن",
  "المزمل",
  "المدثر",
  "القيامة",
  "الإنسان",
  "المرسلات",
  "النبأ",
  "النازعات",
  "عبس",
  "التكوير",
  "الانفطار",
  "المطففين",
  "الانشقاق",
  "البروج",
  "الطارق",
  "الأعلى",
  "الغاشية",
  "الفجر",
  "البلد",
  "الشمس",
  "الليل",
  "الضحى",
  "الشرح",
  "التين",
  "العلق",
  "القدر",
  "البينة",
  "الزلزلة",
  "العاديات",
  "القارعة",
  "التكاثر",
  "العصر",
  "الهمزة",
  "الفيل",
  "قريش",
  "الماعون",
  "الكوثر",
  "الكافرون",
  "النصر",
  "المسد",
  "الإخلاص",
  "الفلق",
  "الناس",
];

function SectionHero({
  image,
  title,
  subtitle,
  className = "",
}: SectionHeroProps) {
  return (
    <section
      className={`sectionHero ${className}`}
      style={{
        backgroundImage: `
          linear-gradient(
            90deg,
            rgba(2, 28, 23, 0.90) 0%,
            rgba(4, 49, 40, 0.62) 52%,
            rgba(4, 49, 40, 0.18) 100%
          ),
          url("${image}")
        `,
      }}
    >
      <div className="sectionHeroContent">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </section>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [dark, setDark] = useState(() => load("dark", false));
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [bookmark, setBookmark] = useState(() =>
    load("bookmark", { sura: 1, ayah: 1, name: "الفاتحة" }),
  );
  const [goal, setGoal] = useState(() => load("goal", 30));
  const [done, setDone] = useState(() => load("done", 0));
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<{
    sura: number;
    ayah: number;
    text: string;
  } | null>(null);
  const [notifs, setNotifs] = useState<NotificationSettings>(() =>
    load("notifs", {
      prayer: true,
      adhkar: true,
      wird: true,
      hadith: true,
    }),
  );

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    save("dark", dark);
  }, [dark]);

  const todayPrayerTimes = useMemo(() => {
    return new PrayerTimes(
      new Coordinates(24.4539, 54.3773),
      new Date(),
      CalculationMethod.Dubai(),
    );
  }, []);

  const nextPrayer = useMemo(() => {
    const now = new Date();
    const prayers = [
      { key: "fajr", name: "الفجر", time: todayPrayerTimes.fajr },
      { key: "sunrise", name: "الشروق", time: todayPrayerTimes.sunrise },
      { key: "dhuhr", name: "الظهر", time: todayPrayerTimes.dhuhr },
      { key: "asr", name: "العصر", time: todayPrayerTimes.asr },
      { key: "maghrib", name: "المغرب", time: todayPrayerTimes.maghrib },
      { key: "isha", name: "العشاء", time: todayPrayerTimes.isha },
    ];

    const upcomingPrayer = prayers.find((prayer) => prayer.time > now);

    if (upcomingPrayer) {
      return upcomingPrayer;
    }

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const tomorrowPrayerTimes = new PrayerTimes(
      new Coordinates(24.4539, 54.3773),
      tomorrow,
      CalculationMethod.Dubai(),
    );

    return {
      key: "fajr",
      name: "الفجر",
      time: tomorrowPrayerTimes.fajr,
    };
  }, [todayPrayerTimes]);

  const formatPrayerTime = (date: Date) => {
    return date.toLocaleTimeString("ar-AE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  async function openSura(id: number) {
    const response = await fetch(`./quran/${id}.json`);

    if (!response.ok) {
      throw new Error(`Failed to load sura ${id}`);
    }

    const chapterData = (await response.json()) as Chapter;
    setChapter(chapterData);
  }

  async function schedule() {
    if (!Capacitor.isNativePlatform()) {
      alert("الإشعارات المحلية تعمل داخل تطبيق Android.");
      return;
    }

    const permission = await LocalNotifications.requestPermissions();

    if (permission.display !== "granted") {
      alert("لم يتم منح إذن الإشعارات.");
      return;
    }

    const now = new Date();
    const notifications: any[] = [];

    if (notifs.prayer) {
      for (let day = 0; day < 7; day += 1) {
        const date = new Date(now);
        date.setDate(now.getDate() + day);

        const prayerTimes = new PrayerTimes(
          new Coordinates(24.4539, 54.3773),
          date,
          CalculationMethod.Dubai(),
        );

        const prayers = [
          ["الفجر", prayerTimes.fajr],
          ["الظهر", prayerTimes.dhuhr],
          ["العصر", prayerTimes.asr],
          ["المغرب", prayerTimes.maghrib],
          ["العشاء", prayerTimes.isha],
        ] as const;

        prayers.forEach((prayer, index) => {
          if (prayer[1] > now) {
            notifications.push({
              id: 4000 + day * 10 + index,
              title: `حان وقت صلاة ${prayer[0]}`,
              body: "تقبل الله طاعتكم",
              schedule: {
                at: prayer[1],
                allowWhileIdle: true,
              },
              channelId: "prayer",
            });
          }
        });
      }
    }

    await LocalNotifications.createChannel({
      id: "prayer",
      name: "مواقيت الصلاة",
      importance: 5,
    });

    for (let index = 1; index <= 14; index += 1) {
      const scheduledDate = new Date(now);
      scheduledDate.setDate(now.getDate() + index);

      if (notifs.wird) {
        scheduledDate.setHours(20, 0, 0, 0);
        notifications.push({
          id: 1000 + index,
          title: "وردك اليومي",
          body: "خصص دقائق لورد القرآن اليوم",
          schedule: { at: new Date(scheduledDate) },
          channelId: "reminders",
        });
      }

      if (notifs.adhkar) {
        scheduledDate.setHours(7, 0, 0, 0);
        notifications.push({
          id: 2000 + index,
          title: "أذكار الصباح",
          body: "ابدأ يومك بذكر الله",
          schedule: { at: new Date(scheduledDate) },
          channelId: "reminders",
        });
      }

      if (notifs.hadith) {
        scheduledDate.setHours(12, 0, 0, 0);
        const hadith = hadiths[index % hadiths.length];

        notifications.push({
          id: 3000 + index,
          title: "حديث اليوم",
          body: hadith[0],
          schedule: { at: new Date(scheduledDate) },
          channelId: "reminders",
        });
      }
    }

    await LocalNotifications.createChannel({
      id: "reminders",
      name: "التذكيرات اليومية",
      importance: 4,
    });

    await LocalNotifications.schedule({
      notifications,
    });

    alert("تمت جدولة التذكيرات للأيام القادمة");
  }

  const daily = Math.ceil(604 / goal);
  const start = Math.min(604, done * daily + 1);
  const end = Math.min(604, start + daily - 1);
  const progress = Math.min(100, Math.round((done / goal) * 100));

  const filtered = hadiths.filter((hadith) =>
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
            <small>رحلة إيمانية يومية</small>
          </span>
        </div>

        <button
          className="round"
          onClick={() => setDark(!dark)}
          aria-label={dark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الليلي"}
        >
          {dark ? <Sun /> : <Moon />}
        </button>
      </header>

      <main>
        {tab === "home" && (
          <>
            <section
              className="prayerHero"
              style={{
                backgroundImage: `
                  linear-gradient(
                    90deg,
                    rgba(2, 28, 23, 0.90) 0%,
                    rgba(4, 49, 40, 0.66) 48%,
                    rgba(4, 49, 40, 0.22) 100%
                  ),
                  url("${prayerHeroImages[nextPrayer.key] ?? sectionHeroImages.home}")
                `,
              }}
            >
              <div className="prayerHeroContent">
                <span className="heroEyebrow">الصلاة القادمة</span>
                <h1>{nextPrayer.name}</h1>
                <strong>{formatPrayerTime(nextPrayer.time)}</strong>

                <div className="heroLocation">
                  <MapPin size={16} />
                  <span>أبوظبي</span>
                </div>
              </div>
            </section>

            <section className="hero wirdHero">
              <div>
                <small>ورد اليوم</small>
                <h1>
                  صفحة {start} إلى {end}
                </h1>
                <p>خطة مرنة لختم القرآن خلال {goal} يوماً</p>
              </div>

              <div className="orb">{progress}%</div>

              <button
                onClick={() => {
                  const nextDone = Math.min(goal, done + 1);
                  setDone(nextDone);
                  save("done", nextDone);
                }}
                disabled={progress >= 100}
              >
                {progress >= 100 ? "أكملت الختمة" : "تسجيل الإنجاز"}
              </button>
            </section>

            <section className="quick">
              <button onClick={() => setTab("quran")}>
                <BookOpen />
                المصحف
              </button>

              <button onClick={() => setTab("hadith")}>
                <Library />
                الأحاديث
              </button>

              <button onClick={() => setTab("plan")}>
                <CalendarDays />
                الختمة
              </button>
            </section>

            <section className="glass">
              <small>آخر قراءة</small>
              <h2>
                سورة {bookmark.name} • الآية {bookmark.ayah}
              </h2>

              <button
                onClick={() => {
                  setTab("quran");
                  void openSura(bookmark.sura);
                }}
              >
                متابعة القراءة
                <ChevronLeft />
              </button>
            </section>

            <section className="glass">
              <small>حديث اليوم</small>
              <blockquote>
                «{hadiths[new Date().getDate() % hadiths.length][0]}»
              </blockquote>
              <em>{hadiths[new Date().getDate() % hadiths.length][2]}</em>
            </section>
          </>
        )}

        {tab === "quran" && (
          <>
            {chapter ? (
              <Reader
                c={chapter}
                mark={(ayah, text) => {
                  const nextBookmark = {
                    sura: chapter.id,
                    ayah,
                    name: chapter.name,
                  };

                  setBookmark(nextBookmark);
                  save("bookmark", nextBookmark);
                  setDetail({
                    sura: chapter.id,
                    ayah,
                    text,
                  });
                }}
                back={() => setChapter(null)}
              />
            ) : (
              <>
                <SectionHero
                  className="quranHero"
                  image={sectionHeroImages.quran}
                  title="القرآن الكريم"
                  subtitle="اقرأ واحفظ موضعك وتابع وردك اليومي"
                />

                <div className="suras">
                  {suras.map((name, index) => (
                    <button key={name} onClick={() => void openSura(index + 1)}>
                      <b>{index + 1}</b>
                      <span>
                        {name}
                        <small>سورة رقم {index + 1}</small>
                      </span>
                      <ChevronLeft />
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {tab === "plan" && (
          <>
            <SectionHero
              className="khatmaHero"
              image={sectionHeroImages.khatma}
              title="خطة الختمة"
              subtitle="خطة مرنة تساعدك على إتمام القرآن بخطوات منتظمة"
            />

            <section className="glass">
              <label>
                مدة الختمة
                <input
                  type="range"
                  min="7"
                  max="365"
                  value={goal}
                  onChange={(event) => {
                    const nextGoal = Number(event.target.value);
                    setGoal(nextGoal);
                    save("goal", nextGoal);
                  }}
                />
              </label>

              <div className="planStats">
                <div>
                  <b>{goal}</b>
                  <span>يوماً</span>
                </div>

                <div>
                  <b>{daily}</b>
                  <span>صفحة يومياً</span>
                </div>

                <div>
                  <b>{progress}%</b>
                  <span>مكتمل</span>
                </div>
              </div>

              <button
                className="primary"
                onClick={() => {
                  setDone(0);
                  save("done", 0);
                }}
              >
                بدء خطة جديدة
              </button>
            </section>
          </>
        )}

        {tab === "hadith" && (
          <>
            <SectionHero
              className="hadithHero"
              image={sectionHeroImages.hadith}
              title="أحاديث الصحيحين"
              subtitle="تصفح وابحث في الأحاديث الموثقة"
            />

            <label className="search hadithSearch">
              <Search />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ابحث في نص الحديث أو المصدر"
              />
            </label>

            {filtered.map((hadith) => (
              <article className="hadith" key={`${hadith[2]}-${hadith[0]}`}>
                <p>«{hadith[0]}»</p>
                <small>{hadith[2]}</small>
              </article>
            ))}
          </>
        )}

        {tab === "settings" && (
          <>
            <div className="title">
              <h1>الإعدادات</h1>
            </div>

            <section className="glass settings">
              <label>
                <Moon />
                الوضع الليلي
                <input
                  type="checkbox"
                  checked={dark}
                  onChange={() => setDark(!dark)}
                />
              </label>

              <h3>التحكم بالإشعارات</h3>

              {Object.entries(notifs).map(([key, value]) => (
                <label key={key}>
                  <Bell />
                  {key === "prayer"
                    ? "الصلاة"
                    : key === "adhkar"
                      ? "الأذكار"
                      : key === "wird"
                        ? "الورد اليومي"
                        : "حديث عشوائي"}

                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => {
                      const nextNotifications = {
                        ...notifs,
                        [key]: !value,
                      };

                      setNotifs(nextNotifications);
                      save("notifs", nextNotifications);
                    }}
                  />
                </label>
              ))}

              <button className="primary" onClick={() => void schedule()}>
                تفعيل وجدولة الإشعارات
              </button>

              <button className="link">
                <Shield />
                سياسة الخصوصية
              </button>

              <button className="link">
                <Info />
                حول البرنامج
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
            ["plan", CalendarDays, "الختمة"],
            ["hadith", Library, "الأحاديث"],
            ["settings", Settings, "المزيد"],
          ] as const
        ).map(([key, Icon, label]) => (
          <button
            key={key}
            className={tab === key ? "on" : ""}
            onClick={() => {
              setTab(key);

              if (key !== "quran") {
                setChapter(null);
              }
            }}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {detail && (
        <div className="modal">
          <div className="sheet">
            <button className="close" onClick={() => setDetail(null)}>
              <X />
            </button>

            <Bookmark />
            <h2>حفظ موضع القراءة</h2>
            <p>
              تم حفظ الآية {detail.ayah} من سورة {suras[detail.sura - 1]}.
            </p>

            <h3>شرح الآية</h3>
            <p className="muted">
              التفسير وسبب النزول يحتاجان اتصالاً بمصدر تفسير معتمد. لم يتم
              توليد شرح آلي للنص القرآني.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Reader({
  c,
  mark,
  back,
}: {
  c: Chapter;
  mark: (ayah: number, text: string) => void;
  back: () => void;
}) {
  return (
    <>
      <div className="readerHead">
        <button onClick={back}>×</button>
        <div>
          <h1>سورة {c.name}</h1>
          <small>{c.total_verses} آيات</small>
        </div>
      </div>

      <div className="verses">
        {c.verses.map((verse) => (
          <article key={verse.id}>
            <button className="aya" onClick={() => mark(verse.id, verse.text)}>
              {verse.id}
            </button>

            <p>
              {verse.text} <span>﴿{verse.id}﴾</span>
            </p>

            <button
              className="explain"
              onClick={() => mark(verse.id, verse.text)}
            >
              <Bookmark />
              حفظ وشرح
            </button>
          </article>
        ))}
      </div>
    </>
  );
}
