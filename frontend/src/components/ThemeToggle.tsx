import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className={`group fixed top-4 right-4 sm:top-6 sm:right-6 z-[9998] p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xl transition-all duration-300 ${
        theme === 'light'
          ? 'bg-white border-2 border-gray-300 hover:bg-gray-50'
          : 'bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 border-2 border-emerald-400/50 hover:from-emerald-500/40 hover:to-emerald-600/30'
      }`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'light' ? 0 : 180 }}
        transition={{ duration: 0.3 }}
      >
        {theme === 'light' ? (
          <Moon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" strokeWidth={2.5} />
        ) : (
          <Sun className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-300" strokeWidth={2.5} />
        )}
      </motion.div>
      
      {/* Tooltip - Hidden on mobile */}
      <div className="hidden sm:block absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className={`rounded-xl px-3 py-2 shadow-xl whitespace-nowrap ${
          theme === 'light' ? 'bg-gray-900 text-white' : 'bg-white/10 backdrop-blur-md border border-white/20 text-white'
        }`}>
          <p className="text-sm font-semibold">{theme === 'light' ? 'Mode sombre' : 'Mode clair'}</p>
        </div>
      </div>
    </motion.button>
  );
}
