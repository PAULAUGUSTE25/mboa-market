import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full backdrop-blur-md border transition-all duration-300 flex items-center justify-center group hover:scale-110 active:scale-95"
      style={{
        background: theme === 'dark' 
          ? 'rgba(255, 255, 255, 0.1)' 
          : 'rgba(255, 255, 255, 0.9)',
        borderColor: theme === 'dark'
          ? 'rgba(255, 255, 255, 0.2)'
          : 'rgba(0, 0, 0, 0.15)',
        boxShadow: theme === 'dark'
          ? '0 4px 12px rgba(0, 0, 0, 0.3)'
          : '0 4px 20px rgba(0, 0, 0, 0.15)',
      }}
      aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
    >
      {theme === 'dark' ? (
        <Sun 
          className="w-5 h-5 text-yellow-300 transition-transform group-hover:rotate-90" 
          strokeWidth={2}
        />
      ) : (
        <Moon 
          className="w-5 h-5 text-slate-700 transition-transform group-hover:-rotate-12" 
          strokeWidth={2}
        />
      )}
    </button>
  );
}
