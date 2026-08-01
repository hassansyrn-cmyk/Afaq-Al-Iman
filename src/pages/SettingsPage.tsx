import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Moon, Sun, Monitor } from 'lucide-react';
import { useI18n } from '../i18n';
import { useTheme } from '../context/ThemeContext';
import TopBar from '../components/TopBar';

const SettingsPage: React.FC = () => {
  const { t, lang, setLang } = useI18n();
  const { mode, setMode } = useTheme();

  return (
    <div className="page">
      <TopBar title={t.settings.title} />
      <div className="content">
        <div className="section-title" style={{ marginTop: 0 }}>{t.settings.language}</div>
        <div className="glass row" style={{ gap: 8 }}>
          <button className={`chip${lang === 'ar' ? ' active' : ''}`} style={{ flex: 1 }} onClick={() => setLang('ar')}>العربية</button>
          <button className={`chip${lang === 'en' ? ' active' : ''}`} style={{ flex: 1 }} onClick={() => setLang('en')}>English</button>
        </div>

        <div className="section-title">{t.settings.theme}</div>
        <div className="glass row" style={{ gap: 8 }}>
          <button className={`chip${mode === 'light' ? ' active' : ''}`} style={{ flex: 1 }} onClick={() => setMode('light')}><Sun size={13} /> {t.settings.light}</button>
          <button className={`chip${mode === 'dark' ? ' active' : ''}`} style={{ flex: 1 }} onClick={() => setMode('dark')}><Moon size={13} /> {t.settings.dark}</button>
          <button className={`chip${mode === 'system' ? ' active' : ''}`} style={{ flex: 1 }} onClick={() => setMode('system')}><Monitor size={13} /> {t.settings.system}</button>
        </div>

        <div className="section-title">{t.settings.title}</div>
        <div className="list">
          <Link to="/settings/prayer" className="list-row" style={{ gridTemplateColumns: '1fr auto' }}>
            <span style={{ fontWeight: 700 }}>{t.settings.prayerSettings}</span>
            <ChevronLeft size={18} />
          </Link>
          <Link to="/settings/notifications" className="list-row" style={{ gridTemplateColumns: '1fr auto' }}>
            <span style={{ fontWeight: 700 }}>{t.settings.notificationSettings}</span>
            <ChevronLeft size={18} />
          </Link>
        </div>

        <div className="section-title">{t.settings.about}</div>
        <div className="glass stack">
          <div className="row"><span style={{ fontWeight: 700 }}>{t.app.name}</span><span className="hint">{t.settings.version} 1.0.0</span></div>
          <p className="hint">{t.quran.sourceNotice}</p>
          <p className="hint">{t.hadith.sourceNotice}</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
