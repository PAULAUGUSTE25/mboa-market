/**
 * Configuration du thème MBOA - Couleurs Premium Uniformes
 * Palette Indigo: Neutre, professionnelle, élégante
 * Fonctionne pour Agriculture ET Élevage
 */

export const THEME_COLORS = {
  // Couleur principale
  primary: {
    50: '#F5F5F0',   // Backgrounds très légers
    100: '#EEEEE5',  // Backgrounds légers
    200: '#C7D2FE',  // Borders, hover states
    300: '#A5B4FC',  // Disabled states
    400: '#818CF8',  // Accent, highlights
    500: '#4A4F23',  // Primary light
    600: '#3F441C',  // PRIMARY - Couleur principale
    700: '#353916',  // Primary dark, hover
    800: '#3730A3',  // Primary darker
    900: '#312E81',  // Primary darkest
  },
  
  // Couleurs de statut (gardent leur signification universelle)
  success: {
    light: '#D1FAE5',
    DEFAULT: '#3F441C',
    dark: '#353916',
  },
  
  warning: {
    light: '#FEF3C7',
    DEFAULT: '#F59E0B',
    dark: '#D97706',
  },
  
  error: {
    light: '#FEE2E2',
    DEFAULT: '#EF4444',
    dark: '#DC2626',
  },
  
  info: {
    light: '#DBEAFE',
    DEFAULT: '#3B82F6',
    dark: '#2563EB',
  },
  
  // Couleurs neutres (grays)
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  }
}

// Classes Tailwind à utiliser partout
export const THEME_CLASSES = {
  // Boutons
  button: {
    primary: 'bg-[#3F441C] hover:bg-[#353916] text-white',
    secondary: 'bg-[#EEEEE5] hover:bg-[#D9DAC8] text-[#353916]',
    outline: 'border-2 border-[#3F441C] text-[#3F441C] hover:bg-[#F5F5F0]',
  },
  
  // Badges
  badge: {
    primary: 'bg-[#EEEEE5] text-[#353916]',
    success: 'bg-[#EEEEE5] text-[#353916]',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
  },
  
  // Liens
  link: 'text-[#3F441C] hover:text-[#353916]',
  
  // Backgrounds
  background: {
    primary: 'bg-[#F5F5F0]',
    card: 'bg-white',
  },
  
  // Borders
  border: {
    primary: 'border-[#3F441C]',
    light: 'border-[#D9DAC8]',
  },
  
  // Text
  text: {
    primary: 'text-[#3F441C]',
    dark: 'text-[#353916]',
    light: 'text-[#F5F5F0]0',
  },
  
  // Icons
  icon: {
    primary: 'text-[#3F441C]',
    light: 'text-[#7A7D5C]',
  }
}

export default THEME_COLORS
