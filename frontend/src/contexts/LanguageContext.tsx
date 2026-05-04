import { createContext, useContext, useState, type ReactNode } from 'react';

export type Language = 'fr' | 'en';

interface LanguageContextType {
  lang: Language;
  toggle: () => void;
  t: (fr: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'fr',
  toggle: () => {},
  t: (fr) => fr,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(
    () => (localStorage.getItem('mboa-lang') as Language) || 'fr'
  );
  const toggle = () => setLang(l => {
    const next = l === 'fr' ? 'en' : 'fr';
    localStorage.setItem('mboa-lang', next);
    return next;
  });
  const t = (fr: string, en: string) => (lang === 'fr' ? fr : en);
  return (
    <LanguageContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
