import { describe, it, expect, beforeEach } from 'vitest';
import { KhatmaRepository } from '../repositories/khatma/KhatmaRepository';

describe('KhatmaRepository', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates a plan with pagesPerDay covering all 604 pages', () => {
    const repo = new KhatmaRepository();
    const plan = repo.createPlan(30);
    expect(plan.pagesPerDay * plan.totalDays).toBeGreaterThanOrEqual(604);
  });

  it('prevents recording completion twice for the same day', () => {
    const repo = new KhatmaRepository();
    let plan = repo.createPlan(30);
    plan = repo.recordTodayCompletion(plan);
    expect(() => repo.recordTodayCompletion(plan)).toThrow();
  });

  it('undo removes only the last completion record', () => {
    const repo = new KhatmaRepository();
    let plan = repo.createPlan(604); // يوم واحد = صفحة واحدة، يسهّل التوقع
    plan = repo.recordTodayCompletion(plan);
    expect(plan.history).toHaveLength(1);

    plan = repo.undoLastCompletion(plan);
    expect(plan.history).toHaveLength(0);
  });

  it('never lets the percentage exceed 100', () => {
    const repo = new KhatmaRepository();
    // خطة بيوم واحد فقط تعني pagesPerDay = 604 نظرياً
    const plan = repo.createPlan(1);
    const progress = repo.getProgress(plan);
    expect(progress.percent).toBeLessThanOrEqual(100);
    expect(progress.todayEndPage).toBeLessThanOrEqual(604);
    expect(progress.todayStartPage).toBeLessThanOrEqual(604);
  });

  it('caps start/end page at 604 even with an artificially large history', () => {
    const repo = new KhatmaRepository();
    const plan = repo.createPlan(1);
    const bloated = {
      ...plan,
      history: [
        { date: '2020-01-01', pagesRead: 700, startPage: 1, endPage: 604 },
      ],
    };
    const progress = repo.getProgress(bloated);
    expect(progress.pagesRead).toBeLessThanOrEqual(604);
    expect(progress.percent).toBeLessThanOrEqual(100);
  });
});
