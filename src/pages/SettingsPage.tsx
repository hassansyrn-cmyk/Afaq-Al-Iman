import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useTheme } from '../context/ThemeContext';
import TopBar from '../components/TopBar';
import { ChevronIcon } from '../components/Icons';

const SettingsPage: React.FC = () => {
  const { t, lang, setLang } = useI18n();
  const { mode, setMode } = useTheme();

  return (
    <div className="page">
      <TopBar title={t.settings.title} />

      <div className="section-title">{t.settings.language}</div>
      <div className="card row" style={{ gap: 8 }}>
        <button className={`chip${lang === 'ar' ? ' active' : ''}`} style={{ flex: 1 }} onClick={() => setLang('ar')}>العربية</button>
        <button className={`chip${lang === 'en' ? ' active' : ''}`} style={{ flex: 1 }} onClick={() => setLang('en')}>English</button>
      </div>

      <div className="section-title">{t.settings.theme}</div>
      <div className="card row" style={{ gap: 8 }}>
        <button className={`chip${mode === 'light' ? ' active' : ''}`} style={{ flex: 1 }} onClick={() => setMode('light')}>{t.settings.light}</button>
        <button className={`chip${mode === 'dark' ? ' active' : ''}`} style={{ flex: 1 }} onClick={() => setMode('dark')}>{t.settings.dark}</button>
        <button className={`chip${mode === 'system' ? ' active' : ''}`} style={{ flex: 1 }} onClick={() => setMode('system')}>{t.settings.system}</button>
      </div>

      <div className="section-title">{t.settings.title}</div>
      <div className="stack">
        <Link to="/settings/prayer" className="card row" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
          <span>{t.settings.prayerSettings}</span>
          <ChevronIcon size={18} />
        </Link>
        <Link to="/settings/notifications" className="card row" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
          <span>{t.settings.notificationSettings}</span>
          <ChevronIcon size={18} />
        </Link>
      </div>

      <div className="section-title">{t.settings.about}</div>
      <div className="card stack">
        <div className="row"><span>{t.app.name}</span><span className="hint">{t.settings.version} 1.0.0</span></div>
        <p className="hint">{t.quran.sourceNotice}</p>
        <p className="hint">{t.hadith.sourceNotice}</p>
      </div>
    </div>
  );
};

export default SettingsPage;
