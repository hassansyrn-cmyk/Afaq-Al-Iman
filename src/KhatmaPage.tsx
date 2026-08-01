import {
  CalendarDays,
  CheckCircle2,
  RotateCcw,
  Undo2,
} from "lucide-react";
import { useMemo, useState } from "react";

type KhatmaState = {
  goalDays: number;
  completedDates: string[];
  startedAt: string;
};

type KhatmaPageProps = {
  image?: string;
  onRead?: (page: number) => void;
};

const TOTAL_PAGES = 604;
const STORAGE_KEY = "afaq-khatma-v2";

function getTodayKey(): string {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function loadPlan(): KhatmaState {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "null",
    ) as KhatmaState | null;

    if (
      saved &&
      typeof saved.goalDays === "number" &&
      saved.goalDays >= 7 &&
      Array.isArray(saved.completedDates) &&
      typeof saved.startedAt === "string"
    ) {
      return {
        goalDays: Math.min(365, Math.max(7, saved.goalDays)),
        completedDates: Array.from(new Set(saved.completedDates)),
        startedAt: saved.startedAt,
      };
    }
  } catch {
    // استخدم الخطة الافتراضية إذا كانت البيانات المحفوظة غير سليمة.
  }

  return {
    goalDays: 30,
    completedDates: [],
    startedAt: getTodayKey(),
  };
}

function persistPlan(plan: KhatmaState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
}

export default function KhatmaPage({
  image = "./images/khatma/khatma-hero.webp",
  onRead,
}: KhatmaPageProps) {
  const [plan, setPlan] = useState<KhatmaState>(loadPlan);

  const pagesPerDay = Math.ceil(TOTAL_PAGES / plan.goalDays);
  const completedDays = plan.completedDates.length;

  const pagesRead = Math.min(
    TOTAL_PAGES,
    completedDays * pagesPerDay,
  );

  const startPage =
    pagesRead >= TOTAL_PAGES
      ? TOTAL_PAGES
      : Math.min(TOTAL_PAGES, pagesRead + 1);

  const endPage = Math.min(
    TOTAL_PAGES,
    startPage + pagesPerDay - 1,
  );

  const remainingPages = Math.max(
    0,
    TOTAL_PAGES - pagesRead,
  );

  const remainingDays = Math.max(
    0,
    plan.goalDays - completedDays,
  );

  const progress = Math.min(
    100,
    Math.round((pagesRead / TOTAL_PAGES) * 100),
  );

  const today = getTodayKey();
  const completedToday = plan.completedDates.includes(today);
  const completedPlan = progress >= 100;

  const expectedEndDate = useMemo(() => {
    const startDate = new Date(`${plan.startedAt}T12:00:00`);

    if (Number.isNaN(startDate.getTime())) {
      return "";
    }

    startDate.setDate(
      startDate.getDate() + plan.goalDays - 1,
    );

    return startDate.toLocaleDateString("ar-AE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [plan.goalDays, plan.startedAt]);

  function updatePlan(nextPlan: KhatmaState): void {
    setPlan(nextPlan);
    persistPlan(nextPlan);
  }

  function changeGoalDays(goalDays: number): void {
    updatePlan({
      ...plan,
      goalDays: Math.min(365, Math.max(7, goalDays)),
    });
  }

  function completeToday(): void {
    if (completedToday || completedPlan) {
      return;
    }

    updatePlan({
      ...plan,
      completedDates: [
        ...plan.completedDates,
        today,
      ],
    });
  }

  function undoLastCompletion(): void {
    if (plan.completedDates.length === 0) {
      return;
    }

    updatePlan({
      ...plan,
      completedDates: plan.completedDates.slice(0, -1),
    });
  }

  function resetPlan(): void {
    const accepted = window.confirm(
      "هل تريد بدء خطة ختمة جديدة وحذف تقدم الخطة الحالية؟",
    );

    if (!accepted) {
      return;
    }

    updatePlan({
      goalDays: plan.goalDays,
      completedDates: [],
      startedAt: getTodayKey(),
    });
  }

  return (
    <>
      <section
        className="sectionHero khatmaHero"
        style={{
          backgroundImage: `
            linear-gradient(
              90deg,
              rgba(2, 28, 23, 0.92),
              rgba(4, 49, 40, 0.27)
            ),
            url("${image}")
          `,
        }}
      >
        <div>
          <h1>خطة الختمة</h1>

          <p>
            خطة مرنة مبنية على صفحات مصحف المدينة
            البالغ عددها 604 صفحات
          </p>
        </div>
      </section>

      <section className="glass khatmaCard">
        <div
          className="khatmaProgress"
          style={{
            background: `conic-gradient(
              var(--gold) ${progress}%,
              var(--line) 0
            )`,
          }}
        >
          <div>
            <b>{progress}%</b>
            <span>مكتمل</span>
          </div>
        </div>

        <div className="khatmaToday">
          <small>
            {completedPlan ? "تمت الختمة" : "ورد اليوم"}
          </small>

          <h2>
            {completedPlan
              ? "بارك الله لك في ختم القرآن"
              : `من صفحة ${startPage} إلى ${endPage}`}
          </h2>

          <p>
            {completedPlan
              ? "يمكنك بدء خطة ختمة جديدة"
              : `${pagesPerDay} صفحة يوميًا`}
          </p>
        </div>
      </section>

      <section className="glass">
        <label className="khatmaRange">
          مدة الختمة:
          <b> {plan.goalDays} يومًا</b>

          <input
            type="range"
            min="7"
            max="365"
            value={plan.goalDays}
            onChange={(event) =>
              changeGoalDays(Number(event.target.value))
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
          <CalendarDays />

          <span>
            تاريخ الانتهاء المتوقع:
            {" "}
            <b>{expectedEndDate}</b>
          </span>
        </p>

        {onRead && !completedPlan && (
          <button
            className="secondary khatmaAction"
            onClick={() => onRead(startPage)}
          >
            <BookIcon />

            قراءة ورد اليوم
          </button>
        )}

        <button
          className="primary khatmaAction"
          disabled={completedToday || completedPlan}
          onClick={completeToday}
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
          disabled={completedDays === 0}
          onClick={undoLastCompletion}
        >
          <Undo2 />

          تراجع عن آخر إنجاز
        </button>

        <button
          className="khatmaReset"
          onClick={resetPlan}
        >
          <RotateCcw />

          بدء خطة جديدة
        </button>
      </section>
    </>
  );
}

function BookIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 5.5C4 4.12 5.12 3 6.5 3H11V19H6.5C5.12 19 4 20.12 4 21.5V5.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      <path
        d="M20 5.5C20 4.12 18.88 3 17.5 3H13V19H17.5C18.88 19 20 20.12 20 21.5V5.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
