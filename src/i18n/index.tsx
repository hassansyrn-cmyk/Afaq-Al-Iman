import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import ar from './ar';
import en from './en';
import type { TranslationShape } from './ar';
import { getPref, setPref } from '../utils/storage';

export type Lang = 'ar' | 'en';

const dictionaries: Record<Lang, TranslationShape> = { ar, en };

interface I18nContextValue {
  lang: Lang;
  dir: 'rtl' | 'ltr';
  t: TranslationShape;
  setLang: (l: Lang) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const LANG_KEY = 'afaq.language';

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>('ar');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await getPref(LANG_KEY);
      if (saved === 'ar' || saved === 'en') setLangState(saved);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    void setPref(LANG_KEY, l);
  };

  const value = useMemo<I18nContextValue>(
    () => ({ lang, dir: lang === 'ar' ? 'rtl' : 'ltr', t: dictionaries[lang], setLang }),
    [lang]
  );

  if (!ready) return null;

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
