import React from 'react';
import { NavLink } from 'react-router-dom';
import { useI18n } from '../i18n';
import { HomeIcon, QuranIcon, AzkarIcon, HadithIcon, QiblaIcon, SettingsIcon } from './Icons';

const items = [
  { to: '/', Icon: HomeIcon, labelKey: 'home' as const },
  { to: '/quran', Icon: QuranIcon, labelKey: 'quran' as const },
  { to: '/azkar', Icon: AzkarIcon, labelKey: 'azkar' as const },
  { to: '/hadith', Icon: HadithIcon, labelKey: 'hadith' as const },
  { to: '/qibla', Icon: QiblaIcon, labelKey: 'qibla' as const },
  { to: '/settings', Icon: SettingsIcon, labelKey: 'settings' as const }
];

const BottomNav: React.FC = () => {
  const { t } = useI18n();
  return (
    <nav className="bottom-nav">
      {items.map(({ to, Icon, labelKey }) => (
        <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <Icon />
          <span>{t.nav[labelKey]}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
