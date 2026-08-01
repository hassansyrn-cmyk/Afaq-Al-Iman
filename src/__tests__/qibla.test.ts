import { describe, it, expect } from 'vitest';
import {
  calculateQiblaBearing,
  angleDelta,
  circularMean,
  isAlignedWithQibla,
  HeadingSmoother,
} from '../services/qibla';

describe('calculateQiblaBearing', () => {
  it('returns a bearing between 0 and 360 for arbitrary coordinates', () => {
    const bearing = calculateQiblaBearing(24.4539, 54.3773); // Abu Dhabi
    expect(bearing).toBeGreaterThanOrEqual(0);
    expect(bearing).toBeLessThan(360);
  });

  it('points roughly south-east from Cairo toward Makkah', () => {
    const bearing = calculateQiblaBearing(30.0444, 31.2357); // Cairo
    expect(bearing).toBeGreaterThan(90);
    expect(bearing).toBeLessThan(160);
  });
});

describe('angleDelta', () => {
  it('handles the wrap-around between 359 and 0 correctly', () => {
    expect(angleDelta(1, 359)).toBeCloseTo(2, 5);
    expect(angleDelta(359, 1)).toBeCloseTo(-2, 5);
  });

  it('returns 0 for identical angles', () => {
    expect(angleDelta(180, 180)).toBe(0);
  });
});

describe('circularMean', () => {
  it('averages angles that straddle the 0/360 boundary without cancelling out', () => {
    const mean = circularMean([350, 10]);
    expect(mean).toBeGreaterThan(355);
    expect(mean).toBeLessThanOrEqual(360.0001);
  });

  it('returns 0 for an empty list instead of throwing', () => {
    expect(circularMean([])).toBe(0);
  });
});

describe('isAlignedWithQibla', () => {
  it('is true within tolerance', () => {
    expect(isAlignedWithQibla(100, 102, 3)).toBe(true);
  });

  it('is false outside tolerance', () => {
    expect(isAlignedWithQibla(100, 110, 3)).toBe(false);
  });

  it('handles alignment across the 0/360 wrap', () => {
    expect(isAlignedWithQibla(359, 1, 3)).toBe(true);
  });
});

describe('HeadingSmoother', () => {
  it('ignores tiny jitter within the dead zone', () => {
    const smoother = new HeadingSmoother(5, 2.5);
    const first = smoother.push(100);
    const second = smoother.push(100.5); // اهتزاز طفيف
    expect(second).toBe(first);
  });

  it('does not keep moving when the phone stays still', () => {
    const smoother = new HeadingSmoother(5, 2.5);
    smoother.push(200);
    const a = smoother.push(200);
    const b = smoother.push(200);
    expect(a).toBe(b);
  });

  it('handles the 359/0 wrap without a large jump', () => {
    const smoother = new HeadingSmoother(3, 1);
    smoother.push(358);
    smoother.push(359);
    const result = smoother.push(1);
    // يجب أن تبقى القيمة قريبة من منطقة 359/0/1 وليست قفزة إلى ~180
    const distanceFromZero = Math.min(result, 360 - result);
    expect(distanceFromZero).toBeLessThan(10);
  });
});
