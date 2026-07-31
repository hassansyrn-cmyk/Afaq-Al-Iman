import React, { useEffect, useState } from 'react';

const CountdownTimer: React.FC<{ target: Date }> = ({ target }) => {
  const [remaining, setRemaining] = useState(() => target.getTime() - Date.now());

  useEffect(() => {
    const id = setInterval(() => setRemaining(target.getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  const clamped = Math.max(0, remaining);
  const h = Math.floor(clamped / 3600000);
  const m = Math.floor((clamped % 3600000) / 60000);
  const s = Math.floor((clamped % 60000) / 1000);
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 800, fontSize: 28, letterSpacing: 1 }}>
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  );
};

export default CountdownTimer;
