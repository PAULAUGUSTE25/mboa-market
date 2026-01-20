// Theme utility functions for consistent styling across the app

export const getThemeStyles = (theme: 'light' | 'dark') => ({
  // Background gradients
  background: theme === 'light'
    ? 'from-emerald-100/90 via-teal-100/85 to-amber-100/90'
    : 'from-green-950/85 via-teal-950/80 to-amber-950/85',
  
  // Animated background blobs
  blobs: theme === 'light'
    ? 'opacity-30'
    : 'opacity-20',
  
  blobColors: theme === 'light'
    ? ['bg-emerald-200', 'bg-amber-200', 'bg-teal-200']
    : ['bg-green-400', 'bg-amber-400', 'bg-teal-400'],
  
  // Header/Navigation
  header: theme === 'light'
    ? 'backdrop-blur-md bg-white/70 border-b border-gray-200 shadow-lg'
    : 'backdrop-blur-md bg-white/10 border-b border-white/20 shadow-xl',
  
  // Text colors
  text: {
    primary: theme === 'light' ? 'text-gray-900' : 'text-white',
    secondary: theme === 'light' ? 'text-gray-600' : 'text-gray-400',
    muted: theme === 'light' ? 'text-gray-500' : 'text-white/60',
    link: theme === 'light' ? 'text-gray-700 hover:text-gray-900' : 'text-white/70 hover:text-white',
  },
  
  // Cards
  card: theme === 'light'
    ? 'backdrop-blur-md bg-white/95 border-2 border-emerald-300 shadow-xl'
    : 'bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-lg',
  
  // Modals
  modal: {
    overlay: theme === 'light'
      ? 'bg-black/40 backdrop-blur-sm'
      : 'bg-black/70 backdrop-blur-md',
    content: theme === 'light'
      ? 'backdrop-blur-xl bg-white/95 border border-gray-200'
      : 'backdrop-blur-xl bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-white/20',
    header: theme === 'light'
      ? 'border-b border-gray-200'
      : 'border-b border-white/10',
  },
  
  // Inputs
  input: theme === 'light'
    ? 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-emerald-500'
    : 'backdrop-blur-md bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-emerald-500/50',
  
  // Buttons
  button: {
    primary: 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700',
    secondary: theme === 'light'
      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
      : 'backdrop-blur-md bg-white/10 hover:bg-white/20 text-white border border-white/20',
    ghost: theme === 'light'
      ? 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
      : 'hover:bg-white/10 text-white/70 hover:text-white',
  },
  
  // Badges/Pills
  badge: {
    emerald: theme === 'light'
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    amber: theme === 'light'
      ? 'bg-amber-50 text-amber-700 border border-amber-200'
      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  },
  
  // Message bubbles (chat)
  message: {
    sent: theme === 'light'
      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white'
      : 'bg-gradient-to-br from-emerald-500/90 to-emerald-600/80 text-white border border-emerald-400/30',
    received: theme === 'light'
      ? 'bg-white text-gray-900 border border-gray-200'
      : 'backdrop-blur-md bg-white/20 text-white border border-white/30',
  },
  
  // Dividers
  divider: theme === 'light' ? 'border-gray-200' : 'border-white/10',
  
  // Icons
  icon: {
    primary: theme === 'light' ? 'text-emerald-600' : 'text-emerald-400',
    secondary: theme === 'light' ? 'text-gray-600' : 'text-white/70',
  },
});

// Helper function to get theme-aware class names
export const themeClass = (theme: 'light' | 'dark', lightClass: string, darkClass: string) => {
  return theme === 'light' ? lightClass : darkClass;
};
