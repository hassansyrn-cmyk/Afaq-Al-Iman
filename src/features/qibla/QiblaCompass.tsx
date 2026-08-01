import { useEffect, useRef, useState } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import {
  calculateQiblaBearing,
  angleDelta,
  isAlignedWithQibla,
  HeadingSmoother,
} from '../../services/qibla';

type SensorState = 'checking' | 'available' | 'unavailable' | 'denied';

interface Props {
  cityLat: number | null;
  cityLng: number | null;
}

/** يقرأ اتجاه الجهاز من DeviceOrientationEvent (يدعم إصدارات أندرويد وiOS المختلفة). */
function readCompassHeading(event: DeviceOrientationEvent): number | null {
  const webkitHeading = (event as unknown as { webkitCompassHeading?: number }).webkitCompassHeading;
  if (typeof webkitHeading === 'number') return webkitHeading; // iOS Safari
  if (event.absolute && event.alpha != null) return (360 - event.alpha) % 360; // أندرويد (Absolute)
  if (event.alpha != null) return (360 - event.alpha) % 360; // أفضل تقدير متاح
  return null;
}

export function QiblaCompass({ cityLat, cityLng }: Props) {
  const [sensorState, setSensorState] = useState<SensorState>('checking');
  const [heading, setHeading] = useState<number | null>(null);
  const [aligned, setAligned] = useState(false);
  const smootherRef = useRef(new HeadingSmoother());
  const lastUiUpdateRef = useRef(0);
  const wasAlignedRef = useRef(false);

  const hasCoords = cityLat != null && cityLng != null;
  const bearing = hasCoords ? calculateQiblaBearing(cityLat!, cityLng!) : null;

  useEffect(() => {
    let cancelled = false;

    async function start() {
      const DOE = window.DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      };

      if (typeof DOE?.requestPermission === 'function') {
        try {
          const result = await DOE.requestPermission();
          if (cancelled) return;
          if (result !== 'granted') {
            setSensorState('denied');
            return;
          }
        } catch {
          setSensorState('denied');
          return;
        }
      }

      if (!('DeviceOrientationEvent' in window)) {
        setSensorState('unavailable');
        return;
      }

      setSensorState('available');
    }

    start();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (sensorState !== 'available') return;

    const smoother = smootherRef.current;
    smoother.reset();

    const handler = (event: DeviceOrientationEvent) => {
      const raw = readCompassHeading(event);
      if (raw == null) return;

      const smoothed = smoother.push(raw);

      // تحديث الواجهة بحد أقصى ~10 مرات/ثانية بدل كل حدث مستشعر
      const now = performance.now();
      if (now - lastUiUpdateRef.current < 100) return;
      lastUiUpdateRef.current = now;

      setHeading(smoothed);

      if (bearing != null) {
        const isNowAligned = isAlignedWithQibla(smoothed, bearing);
        setAligned(isNowAligned);
        if (isNowAligned && !wasAlignedRef.current) {
          Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
        }
        wasAlignedRef.current = isNowAligned;
      }
    };

    const eventName = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
    window.addEventListener(eventName, handler as EventListener);

    return () => {
      window.removeEventListener(eventName, handler as EventListener);
      smoother.reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sensorState, bearing]);

  if (!hasCoords) {
    return (
      <div className="glass qibla-card">
        <h2>القبلة</h2>
        <p className="muted">حدّد المدينة أو فعّل الموقع الجغرافي لعرض اتجاه القبلة.</p>
      </div>
    );
  }

  if (sensorState === 'unavailable' || sensorState === 'denied') {
    return (
      <div className="glass qibla-card">
        <h2>القبلة</h2>
        <p>
          درجة القبلة من الشمال:{' '}
          <b>{bearing!.toFixed(1)}°</b>
        </p>
        <p className="muted">
          {sensorState === 'denied'
            ? 'تم رفض إذن مستشعر الاتجاه، لذلك لا يمكن عرض بوصلة حيّة. هذه هي الدرجة الثابتة فقط.'
            : 'مستشعر البوصلة غير متوفر على هذا الجهاز. هذه هي الدرجة الثابتة فقط، بدون حركة وهمية.'}
        </p>
      </div>
    );
  }

  const remaining = bearing != null && heading != null ? Math.abs(angleDelta(bearing, heading)) : null;

  return (
    <div className="glass qibla-card">
      <h2>القبلة</h2>
      <div className={`compass-dial ${aligned ? 'aligned' : ''}`}>
        <div className="compass-marks">
          <span className="mark n">N</span>
          <span className="mark e">E</span>
          <span className="mark s">S</span>
          <span className="mark w">W</span>
        </div>
        <div
          className="compass-needle"
          style={{ transform: `rotate(${heading != null && bearing != null ? bearing - heading : 0}deg)` }}
          aria-label="اتجاه القبلة"
        >
          🕋
        </div>
        <div className="compass-fixed-pointer" />
      </div>

      <p>
        درجة القبلة: <b>{bearing!.toFixed(1)}°</b> من الشمال
        {heading != null && <> — اتجاه الهاتف: <b>{heading.toFixed(1)}°</b></>}
      </p>
      {remaining != null && <p className="muted">الفرق المتبقي: {remaining.toFixed(1)}°</p>}
      {aligned && <p className="qibla-aligned-msg">أنت باتجاه القبلة</p>}

      <details className="qibla-help">
        <summary>معايرة البوصلة</summary>
        <p className="muted">
          حرّك الهاتف على شكل الرقم 8 عدة مرات لمعايرة المستشعر، وابتعد عن الأجسام المعدنية
          والأغطية المغناطيسية للحصول على قراءة أدق.
        </p>
      </details>
    </div>
  );
}
