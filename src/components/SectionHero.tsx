import React from 'react';
import { Languages } from 'lucide-react';
import { useI18n } from '../i18n';

interface SectionHeroProps {
  image: string;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  tall?: boolean;
  topRight?: React.ReactNode;
  children?: React.ReactNode;
}

const SectionHero: React.FC<SectionHeroProps> = ({ image, title, subtitle, eyebrow, tall, topRight, children }) => {
  const { lang, setLang } = useI18n();
  return (
    <section
      className={`section-hero${tall ? ' tall' : ''}`}
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(2,28,23,0.90) 0%, rgba(4,49,40,0.62) 52%, rgba(4,49,40,0.18) 100%), url("${image}")`
      }}
    >
      <div className="section-hero-top">
        <div style={{ flex: 1 }}>{topRight}</div>
        <button
          className="chip"
          style={{ background: 'rgba(255,255,255,0.14)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', flexShrink: 0 }}
          onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
          aria-label="toggle language"
        >
          <Languages size={13} /> {lang === 'ar' ? 'EN' : 'ع'}
        </button>
      </div>
      <div className="section-hero-content">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
        {children}
      </div>
    </section>
  );
};

export default SectionHero;
