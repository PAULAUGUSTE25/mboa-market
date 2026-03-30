import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="group fixed top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 z-[9998] p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl transition-all duration-300"
      style={{
        backgroundColor: theme === 'light' ? '#FFFFFF' : 'rgba(46, 125, 50, 0.2)',
        border: theme === 'light' ? '2px solid #D1D5DB' : '2px solid rgba(46, 125, 50, 0.5)'
      }}
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
