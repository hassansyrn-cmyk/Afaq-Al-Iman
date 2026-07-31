import React from 'react';
import { useI18n } from '../i18n';

const TopBar: React.FC<{ title: string; right?: React.ReactNode }> = ({ title, right }) => {
  const { lang, setLang } = useI18n();
  return (
    <div className="top-bar">
      <h1>{title}</h1>
      <div className="row" style={{ gap: 8 }}>
        {right}
        <button className="chip" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} aria-label="toggle language">
          {lang === 'ar' ? 'EN' : 'ع'}
        </button>
      </div>
    </div>
  );
};

export default TopBar;
