import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Heart, Library, Compass, Settings } from 'lucide-react';
import { useI18n } from '../i18n';

const items = [
  { to: '/', Icon: Home, labelKey: 'home' as const },
  { to: '/quran', Icon: BookOpen, labelKey: 'quran' as const },
  { to: '/azkar', Icon: Heart, labelKey: 'azkar' as const },
  { to: '/hadith', Icon: Library, labelKey: 'hadith' as const },
  { to: '/qibla', Icon: Compass, labelKey: 'qibla' as const },
  { to: '/settings', Icon: Settings, labelKey: 'settings' as const }
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
