import type { KhatmaPlan, KhatmaDayRecord } from '../../types';
import { load, save } from '../../services/storage';

const PLAN_KEY = 'khatma:plan';
const TOTAL_PAGES = 604;

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface KhatmaProgress {
  completedDays: number;
  remainingDays: number;
  pagesRead: number;
  pagesRemaining: number;
  percent: number; // 0-100، لا يتجاوز 100 أبداً
  todayStartPage: number;
  todayEndPage: number;
  alreadyRecordedToday: boolean;
}

/**
 * يدير خطة الختمة: الإنشاء، تسجيل إنجاز اليوم، التراجع، وإعادة توزيع الورد.
 * كل القواعد المطلوبة مطبّقة صراحة (وليست ضمنية):
 * - سجل واحد فقط لكل تاريخ (لا يمكن تسجيل نفس اليوم مرتين).
 * - التراجع يحذف آخر سجل فقط (history.pop، وليس مسحاً كاملاً).
 * - النسبة لا تتجاوز 100% أبداً مهما كانت عدد الصفحات المُدخلة.
 * - صفحة البداية/النهاية لا تتجاوز 604 أبداً.
 */
export class KhatmaRepository {
  getPlan(): KhatmaPlan | null {
    return load<KhatmaPlan | null>(PLAN_KEY, null);
  }

  createPlan(totalDays: number, startDateISO?: string): KhatmaPlan {
    const startDate = startDateISO ?? todayStr();
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + totalDays - 1);

    const plan: KhatmaPlan = {
      totalDays: Math.max(1, totalDays),
      startDate,
      endDateTarget: end.toISOString().slice(0, 10),
      pagesPerDay: Math.ceil(TOTAL_PAGES / Math.max(1, totalDays)),
      history: [],
      postponedDates: [],
    };
    save(PLAN_KEY, plan);
    return plan;
  }

  /** خطة جديدة تستبدل القديمة بالكامل — يجب تأكيدها من الواجهة قبل الاستدعاء. */
  replacePlan(totalDays: number, startDateISO?: string): KhatmaPlan {
    return this.createPlan(totalDays, startDateISO);
  }

  private clampPage(page: number): number {
    return Math.min(TOTAL_PAGES, Math.max(0, Math.round(page)));
  }

  private totalPagesRead(plan: KhatmaPlan): number {
    return plan.history.reduce((sum, d) => sum + d.pagesRead, 0);
  }

  getProgress(plan: KhatmaPlan): KhatmaProgress {
    const pagesRead = Math.min(TOTAL_PAGES, this.totalPagesRead(plan));
    const completedDays = plan.history.length;
    const remainingDays = Math.max(0, plan.totalDays - completedDays);
    const pagesRemaining = Math.max(0, TOTAL_PAGES - pagesRead);
    const percent = TOTAL_PAGES === 0 ? 0 : Math.min(100, Math.round((pagesRead / TOTAL_PAGES) * 100));

    const todayStartPage = this.clampPage(pagesRead + 1 > TOTAL_PAGES ? TOTAL_PAGES : pagesRead + 1);
    const todayEndPage = this.clampPage(pagesRead + plan.pagesPerDay);

    return {
      completedDays,
      remainingDays,
      pagesRead,
      pagesRemaining,
      percent,
      todayStartPage,
      todayEndPage,
      alreadyRecordedToday: plan.history.some((h) => h.date === todayStr()),
    };
  }

  /** يسجّل إنجاز اليوم. يرمي خطأ إن كان اليوم مسجَّلاً مسبقاً (تُعالَج الحالة في الواجهة قبل الاستدعاء أيضاً). */
  recordTodayCompletion(plan: KhatmaPlan): KhatmaPlan {
    const today = todayStr();
    if (plan.history.some((h) => h.date === today)) {
      throw new Error('تم تسجيل إنجاز اليوم مسبقاً — لا يمكن التسجيل مرتين لنفس اليوم.');
    }
    const progress = this.getProgress(plan);
    const startPage = this.clampPage(progress.pagesRead + 1);
    const endPage = this.clampPage(Math.min(TOTAL_PAGES, progress.pagesRead + plan.pagesPerDay));
    const pagesRead = Math.max(0, endPage - startPage + 1);

    const record: KhatmaDayRecord = { date: today, pagesRead, startPage, endPage };
    const updated: KhatmaPlan = { ...plan, history: [...plan.history, record] };
    save(PLAN_KEY, updated);
    return updated;
  }

  /** تراجع: يحذف آخر سجل إنجاز فقط، ويعيد حساب الصفحات تلقائياً (getProgress تُعاد حسابها من history في كل مرة). */
  undoLastCompletion(plan: KhatmaPlan): KhatmaPlan {
    if (plan.history.length === 0) return plan;
    const updated: KhatmaPlan = { ...plan, history: plan.history.slice(0, -1) };
    save(PLAN_KEY, updated);
    return updated;
  }

  postponeToday(plan: KhatmaPlan): KhatmaPlan {
    const today = todayStr();
    if (plan.postponedDates.includes(today)) return plan;
    const updated: KhatmaPlan = { ...plan, postponedDates: [...plan.postponedDates, today] };
    save(PLAN_KEY, updated);
    return updated;
  }
}
