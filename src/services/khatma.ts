import { getPref, setPref } from '../utils/storage';

const TOTAL_PAGES = 604; // standard Madani mushaf page count

export type KhatmaSetupMode = 'byDays' | 'byEndDate' | 'byPagesPerDay' | 'byJuzPerWeek';

export interface KhatmaPlan {
  startDate: string; // ISO date
  endDate: string; // ISO date
  pagesPerDay: number;
  completedLog: Record<string, number>; // ISO date -> pages completed that day
  totalPages: number;
}

const PLAN_KEY = 'afaq.khatma.plan';

export async function getPlan(): Promise<KhatmaPlan | null> {
  return getPref<KhatmaPlan>(PLAN_KEY);
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function createPlan(mode: KhatmaSetupMode, value: number | string): Promise<KhatmaPlan> {
  const start = new Date();
  let days: number;

  if (mode === 'byDays') {
    days = Number(value);
  } else if (mode === 'byEndDate') {
    const end = new Date(String(value));
    days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
  } else if (mode === 'byPagesPerDay') {
    const perDay = Number(value);
    days = Math.max(1, Math.ceil(TOTAL_PAGES / perDay));
  } else {
    // byJuzPerWeek: 30 juz total, ~20.1 pages per juz
    const juzPerWeek = Number(value);
    const weeksNeeded = 30 / juzPerWeek;
    days = Math.max(1, Math.ceil(weeksNeeded * 7));
  }

  const end = new Date(start);
  end.setDate(end.getDate() + days);

  const plan: KhatmaPlan = {
    startDate: toISODate(start),
    endDate: toISODate(end),
    pagesPerDay: Math.ceil(TOTAL_PAGES / days),
    completedLog: {},
    totalPages: TOTAL_PAGES
  };

  await setPref(PLAN_KEY, plan);
  return plan;
}

export function totalCompletedPages(plan: KhatmaPlan): number {
  return Object.values(plan.completedLog).reduce((sum, v) => sum + v, 0);
}

export function progressPercent(plan: KhatmaPlan): number {
  return Math.min(100, Math.round((totalCompletedPages(plan) / plan.totalPages) * 100));
}

export function daysRemaining(plan: KhatmaPlan): number {
  const end = new Date(plan.endDate);
  const now = new Date();
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000));
}

export function todaysTarget(plan: KhatmaPlan): number {
  // Recompute a fair daily target from remaining pages / remaining days,
  // so a missed day redistributes the load instead of silently falling behind.
  const remainingPages = plan.totalPages - totalCompletedPages(plan);
  const remainingDays = Math.max(1, daysRemaining(plan) + 1); // include today
  return Math.max(1, Math.ceil(remainingPages / remainingDays));
}

export async function markTodayComplete(pages: number): Promise<KhatmaPlan | null> {
  const plan = await getPlan();
  if (!plan) return null;
  const today = toISODate(new Date());
  plan.completedLog[today] = (plan.completedLog[today] ?? 0) + pages;
  await setPref(PLAN_KEY, plan);
  return plan;
}

export async function postponeToday(): Promise<KhatmaPlan | null> {
  // No-op on the log (today's target simply rolls into tomorrow via todaysTarget's
  // recomputation), but we still persist a zero entry so history shows the day was seen.
  const plan = await getPlan();
  if (!plan) return null;
  const today = toISODate(new Date());
  if (!(today in plan.completedLog)) plan.completedLog[today] = 0;
  await setPref(PLAN_KEY, plan);
  return plan;
}

export async function clearPlan(): Promise<void> {
  await setPref(PLAN_KEY, null);
}
