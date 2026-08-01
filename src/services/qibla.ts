// حسابات بوصلة القبلة — منطق رياضي بحت قابل للاختبار بدون DOM أو مستشعرات.

export const KAABA_COORDINATES = { lat: 21.4224779, lng: 39.8251832 };

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/** يحسب اتجاه القبلة (Great-circle bearing) بالدرجات من الشمال (0-360). */
export function calculateQiblaBearing(lat: number, lng: number): number {
  const phi1 = toRad(lat);
  const phi2 = toRad(KAABA_COORDINATES.lat);
  const deltaLambda = toRad(KAABA_COORDINATES.lng - lng);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  const bearing = toDeg(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

/** الفرق الزاوي الأقصر بين اتجاهين (يعالج الانتقال بين 359 و0). */
export function angleDelta(a: number, b: number): number {
  let diff = (a - b) % 360;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff;
}

/** يحسب المتوسط الدائري (circular mean) لمجموعة قراءات بوصلة بالدرجات. */
export function circularMean(anglesDeg: number[]): number {
  if (anglesDeg.length === 0) return 0;
  let sumSin = 0;
  let sumCos = 0;
  for (const a of anglesDeg) {
    sumSin += Math.sin(toRad(a));
    sumCos += Math.cos(toRad(a));
  }
  const meanRad = Math.atan2(sumSin / anglesDeg.length, sumCos / anglesDeg.length);
  return (toDeg(meanRad) + 360) % 360;
}

/** مرشّح تمرير منخفض (Low-pass) بسيط للانتقال السلس بين قراءتين، يعالج التفاف 0/360. */
export function lowPassAngle(previous: number, next: number, alpha = 0.15): number {
  const delta = angleDelta(next, previous);
  return (previous + alpha * delta + 360) % 360;
}

/**
 * نافذة متحركة (rolling window) لقراءات البوصلة: تحتفظ بآخر N قراءة
 * وتُرجع متوسطها الدائري، مع منطقة ميتة (dead zone) تمنع الاهتزاز الطفيف.
 */
export class HeadingSmoother {
  private window: number[] = [];
  private lastOutput: number | null = null;

  constructor(
    private readonly windowSize = 8,
    private readonly deadZoneDeg = 2.5,
  ) {}

  push(rawHeading: number): number {
    this.window.push(rawHeading);
    if (this.window.length > this.windowSize) this.window.shift();
    const mean = circularMean(this.window);

    if (this.lastOutput == null) {
      this.lastOutput = mean;
      return mean;
    }
    if (Math.abs(angleDelta(mean, this.lastOutput)) < this.deadZoneDeg) {
      return this.lastOutput; // تجاهل الاهتزاز الطفيف داخل المنطقة الميتة
    }
    this.lastOutput = lowPassAngle(this.lastOutput, mean);
    return this.lastOutput;
  }

  reset(): void {
    this.window = [];
    this.lastOutput = null;
  }
}

/** هل الهاتف محاذٍ لاتجاه القبلة ضمن هامش تسامح؟ */
export function isAlignedWithQibla(
  deviceHeading: number,
  qiblaBearing: number,
  toleranceDeg = 3,
): boolean {
  return Math.abs(angleDelta(deviceHeading, qiblaBearing)) <= toleranceDeg;
}
