import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageToggle() {
  const { lang, toggle } = useLanguage();
  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors select-none"
      title={lang === 'fr' ? 'Switch to English' : 'Passer en Français'}
    >
      <span className={lang === 'fr' ? 'text-green-700' : 'text-gray-400'}>FR</span>
      <span className="text-gray-300">|</span>
      <span className={lang === 'en' ? 'text-red-700' : 'text-gray-400'}>EN</span>
    </button>
  );
}
