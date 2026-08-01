import React, { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n';
import { useSettings } from '../context/SettingsContext';
import SectionHero from '../components/SectionHero';
import { calculateQiblaDirection } from '../services/prayerTimes';

const QiblaPage: React.FC = () => {
  const { t } = useI18n();
  const { prayerSettings } = useSettings();
  const bearing = Math.round(calculateQiblaDirection(prayerSettings.latitude, prayerSettings.longitude));

  const [heading, setHeading] = useState<number | null>(null);
  const [hasSensor, setHasSensor] = useState<boolean | null>(null);
  const [permissionNeeded, setPermissionNeeded] = useState(false);
  const hist = useRef<number[]>([]);
  const locked = useRef<number | null>(null);

  useEffect(() => {
    // Smoothed heading: circular moving average over the last readings, then a damped
    // approach toward that average so the needle doesn't jitter — same technique used
    // in an earlier prototype of this app, which felt noticeably steadier in testing.
    const handler = (e: any) => {
      let r: number | null =
        typeof e.webkitCompassHeading === 'number' ? e.webkitCompassHeading : typeof e.alpha === 'number' ? (360 - e.alpha) % 360 : null;
      if (r === null) return;
      setHasSensor(true);
      const screenAngle = (window.screen as any)?.orientation?.angle ?? 0;
      r = (r + screenAngle + 360) % 360;

      hist.current.push(r);
      if (hist.current.length > 15) hist.current.shift();
      const sx = hist.current.reduce((s, a) => s + Math.sin((a * Math.PI) / 180), 0);
      const cx = hist.current.reduce((s, a) => s + Math.cos((a * Math.PI) / 180), 0);
      const avg = ((Math.atan2(sx, cx) * 180) / Math.PI + 360) % 360;

      if (locked.current === null) locked.current = avg;
      const d = ((avg - locked.current + 540) % 360) - 180;
      if (Math.abs(d) >= 2.2) locked.current = (locked.current + d * 0.22 + 360) % 360;
      setHeading(locked.current);
    };

    const DOE = (window as any).DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission === 'function') {
      setPermissionNeeded(true);
      return;
    }
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientationabsolute', handler, true);
      window.addEventListener('deviceorientation', handler, true);
      const timeout = setTimeout(() => setHasSensor((prev) => prev ?? false), 2500);
      return () => {
        window.removeEventListener('deviceorientationabsolute', handler, true);
        window.removeEventListener('deviceorientation', handler, true);
        clearTimeout(timeout);
      };
    }
    setHasSensor(false);
  }, []);

  const requestIOSPermission = async () => {
    try {
      const DOE = (window as any).DeviceOrientationEvent;
      const result = await DOE.requestPermission();
      if (result === 'granted') {
        setPermissionNeeded(false);
      } else {
        setHasSensor(false);
      }
    } catch {
      setHasSensor(false);
    }
  };

  const delta = heading === null ? 0 : ((bearing - heading + 540) % 360) - 180;
  const aligned = heading !== null && Math.abs(delta) < 4;

  return (
    <div className="page">
      <SectionHero image="/images/qibla/qibla-hero.webp" title={t.qibla.title} subtitle={t.qibla.calibrate} />

      <div className="content">
        <div className="glass center-msg" style={aligned ? { borderColor: 'var(--gold)' } : undefined}>
          <div style={{ position: 'relative', width: 220, height: 220 }}>
            <svg viewBox="0 0 220 220" width="220" height="220" style={{ transform: `rotate(${-(heading ?? 0)}deg)`, transition: 'transform 200ms ease' }}>
              <circle cx="110" cy="110" r="100" fill="none" stroke="var(--line)" strokeWidth="2" />
              {Array.from({ length: 36 }, (_, i) => (
                <line key={i} x1="110" y1="14" x2="110" y2="26" stroke="var(--muted)" strokeWidth="2" transform={`rotate(${i * 10} 110 110)`} />
              ))}
              <text x="110" y="30" textAnchor="middle" fontSize="12" fill="var(--muted)">N</text>
              <g transform={`rotate(${bearing} 110 110)`}>
                <circle cx="110" cy="26" r="7" fill="var(--gold)" />
              </g>
            </svg>
            <div style={{ position: 'absolute', top: 0, insetInlineStart: '50%', transform: 'translateX(-50%)', color: 'var(--green)', fontSize: 20 }}>▲</div>
          </div>

          <h2 style={{ margin: 0 }}>{bearing}°</h2>
          <span className="hint">{aligned ? t.qibla.title : t.qibla.degrees}</span>

          {permissionNeeded && (
            <button className="btn btn-primary" onClick={requestIOSPermission}>{t.common.ok}</button>
          )}

          {hasSensor === false && (
            <p className="hint">{t.qibla.noSensor} {bearing}°</p>
          )}
        </div>

        <div className="glass stack">
          <p className="hint">{t.qibla.calibrate}</p>
          <p className="hint">{t.qibla.avoidMetal}</p>
        </div>
      </div>
    </div>
  );
};

export default QiblaPage;
