import React from 'react';

type IconProps = { size?: number; className?: string };
const base = (size = 22) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const });

export const HomeIcon: React.FC<IconProps> = ({ size, className }) => (
  <svg {...base(size)} className={className}><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" /></svg>
);
export const QuranIcon: React.FC<IconProps> = ({ size, className }) => (
  <svg {...base(size)} className={className}><path d="M4 5.5C6 4.5 9 4.5 12 6c3-1.5 6-1.5 8-.5v13c-2-1-5-1-8 .5-3-1.5-6-1.5-8-.5Z" /><path d="M12 6v13" /></svg>
);
export const AzkarIcon: React.FC<IconProps> = ({ size, className }) => (
  <svg {...base(size)} className={className}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="4.3" r="1.4" /><circle cx="18.6" cy="8" r="1.4" /><circle cx="18.6" cy="16" r="1.4" /><circle cx="12" cy="19.7" r="1.4" /><circle cx="5.4" cy="16" r="1.4" /><circle cx="5.4" cy="8" r="1.4" /></svg>
);
export const HadithIcon: React.FC<IconProps> = ({ size, className }) => (
  <svg {...base(size)} className={className}><path d="M4 5h16v11H8l-4 4V5Z" /><path d="M8 9h8M8 12.5h5" /></svg>
);
export const QiblaIcon: React.FC<IconProps> = ({ size, className }) => (
  <svg {...base(size)} className={className}><circle cx="12" cy="12" r="9" /><path d="M12 12 16 7l-2 8-2-3-2 3 2-8Z" fill="currentColor" stroke="none" /></svg>
);
export const SettingsIcon: React.FC<IconProps> = ({ size, className }) => (
  <svg {...base(size)} className={className}><circle cx="12" cy="12" r="3.2" /><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.4-2-3.4-2.3.8a7.7 7.7 0 0 0-2.6-1.5L14 2.5h-4l-.5 2.5a7.7 7.7 0 0 0-2.6 1.5l-2.3-.8-2 3.4 2 1.4a7.6 7.6 0 0 0 0 3l-2 1.4 2 3.4 2.3-.8a7.7 7.7 0 0 0 2.6 1.5l.5 2.6h4l.5-2.6a7.7 7.7 0 0 0 2.6-1.5l2.3.8 2-3.4-2-1.4Z" /></svg>
);
export const BellIcon: React.FC<IconProps> = ({ size, className }) => (
  <svg {...base(size)} className={className}><path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10Z" /><path d="M9.5 18a2.5 2.5 0 0 0 5 0" /></svg>
);
export const BookmarkIcon: React.FC<IconProps> = ({ size, className }) => (
  <svg {...base(size)} className={className}><path d="M6 3.5h12v18l-6-4-6 4v-18Z" /></svg>
);
export const SearchIcon: React.FC<IconProps> = ({ size, className }) => (
  <svg {...base(size)} className={className}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>
);
export const ChevronIcon: React.FC<IconProps & { dir?: 'start' | 'end' }> = ({ size, className }) => (
  <svg {...base(size)} className={className}><path d="m9 6 6 6-6 6" /></svg>
);
export const LocationIcon: React.FC<IconProps> = ({ size, className }) => (
  <svg {...base(size)} className={className}><path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" /><circle cx="12" cy="9" r="2.4" /></svg>
);
export const CheckIcon: React.FC<IconProps> = ({ size, className }) => (
  <svg {...base(size)} className={className}><path d="M4 12.5 9 17l11-11" /></svg>
);
export const CompassIcon: React.FC<IconProps> = ({ size, className }) => (
  <svg {...base(size)} className={className}><circle cx="12" cy="12" r="9.2" /><path d="M15.5 8.5 13 13l-4.5 2.5L11 11l4.5-2.5Z" /></svg>
);
export const ShareIcon: React.FC<IconProps> = ({ size, className }) => (
  <svg {...base(size)} className={className}><circle cx="18" cy="5" r="2.2" /><circle cx="6" cy="12" r="2.2" /><circle cx="18" cy="19" r="2.2" /><path d="M8 10.8 16 6.2M8 13.2l8 4.6" /></svg>
);
export const HeartIcon: React.FC<IconProps & { filled?: boolean }> = ({ size, className, filled }) => (
  <svg {...base(size)} fill={filled ? 'currentColor' : 'none'} className={className}><path d="M12 20.5s-7.5-4.7-9.7-9.2C.6 7.8 2.4 4.5 5.8 4A5 5 0 0 1 12 7a5 5 0 0 1 6.2-3c3.4.5 5.2 3.8 3.5 7.3-2.2 4.5-9.7 9.2-9.7 9.2Z" /></svg>
);
