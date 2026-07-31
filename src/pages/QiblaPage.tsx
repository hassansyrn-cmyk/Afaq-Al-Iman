import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { useSettings } from '../context/SettingsContext';
import TopBar from '../components/TopBar';
import { calculateQiblaDirection } from '../services/prayerTimes';
import { CompassIcon } from '../components/Icons';

const QiblaPage: React.FC = () => {
  const { t } = useI18n();
  const { prayerSettings } = useSettings();
  const [heading, setHeading] = useState<number | null>(null);
  const [hasSensor, setHasSensor] = useState<boolean | null>(null);
  const [permissionNeeded, setPermissionNeeded] = useState(false);

  const qiblaDeg = calculateQiblaDirection(prayerSettings.latitude, prayerSettings.longitude);

  useEffect(() => {
    let active = true;

    const handler = (e: DeviceOrientationEvent) => {
      if (!active) return;
      const anyEvent = e as any;
      const compassHeading = anyEvent.webkitCompassHeading ?? (e.alpha !== null ? 360 - e.alpha : null);
      if (compassHeading !== null) {
        setHasSensor(true);
        setHeading(compassHeading);
      }
    };

    const DOE = (window as any).DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission === 'function') {
      setPermissionNeeded(true);
    } else if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handler, true);
      const timeout = setTimeout(() => setHasSensor((prev) => prev ?? false), 2500);
      return () => {
        active = false;
        window.removeEventListener('deviceorientation', handler, true);
        clearTimeout(timeout);
      };
    } else {
      setHasSensor(false);
    }

    return () => {
      active = false;
    };
  }, []);

  const requestIOSPermission = async () => {
    try {
      const DOE = (window as any).DeviceOrientationEvent;
      const result = await DOE.requestPermission();
      if (result === 'granted') {
        setPermissionNeeded(false);
        window.addEventListener(
          'deviceorientation',
          (e: any) => {
            const compassHeading = e.webkitCompassHeading ?? (e.alpha !== null ? 360 - e.alpha : null);
            if (compassHeading !== null) {
              setHasSensor(true);
              setHeading(compassHeading);
            }
          },
          true
        );
      }
    } catch {
      setHasSensor(false);
    }
  };

  const needleRotation = heading !== null ? qiblaDeg - heading : qiblaDeg;

  return (
    <div className="page">
      <TopBar title={t.qibla.title} />

      <div className="card center-msg">
        <div style={{ position: 'relative', width: 220, height: 220 }}>
          <svg viewBox="0 0 220 220" width="220" height="220">
            <circle cx="110" cy="110" r="100" fill="none" stroke="var(--border)" strokeWidth="2" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <line
                key={deg}
                x1="110" y1="14" x2="110" y2="26"
                stroke="var(--text-secondary)" strokeWidth="2"
                transform={`rotate(${deg} 110 110)`}
              />
            ))}
            <text x="110" y="30" textAnchor="middle" fontSize="12" fill="var(--text-secondary)">N</text>
          </svg>
          <div
            style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: `rotate(${needleRotation}deg)`, transition: 'transform 200ms ease'
            }}
          >
            <CompassIcon size={90} className="quran-text" />
          </div>
        </div>

        <div style={{ fontSize: 26, fontWeight: 800 }}>{Math.round(qiblaDeg)}°</div>
        <span className="hint">{t.qibla.degrees}</span>

        {permissionNeeded && (
          <button className="btn btn-primary" onClick={requestIOSPermission}>{t.common.ok}</button>
        )}

        {hasSensor === false && (
          <p className="hint">{t.qibla.noSensor} {Math.round(qiblaDeg)}°</p>
        )}
      </div>

      <div className="card stack" style={{ marginTop: 12 }}>
        <p className="hint">{t.qibla.calibrate}</p>
        <p className="hint">{t.qibla.avoidMetal}</p>
      </div>
    </div>
  );
};

export default QiblaPage;
