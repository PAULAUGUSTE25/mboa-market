/**
 * Couleurs officielles de MBOA Market
 * Utiliser ces constantes pour garantir la cohérence des couleurs dans toute l'application
 */

export const COLORS = {
  // Vert agricole principal
  agriculture: {
    primary: '#2E7D32',
    dark: '#1B5E20',
    light: '#4CAF50',
    gradient: 'linear-gradient(to right, #2E7D32, #1B5E20)',
    gradientDiagonal: 'linear-gradient(to bottom right, #2E7D32, #1B5E20)',
  },
  
  // Amber pour élevage
  elevage: {
    primary: '#F59E0B',
    dark: '#D97706',
    light: '#FBBF24',
    gradient: 'linear-gradient(to right, #F59E0B, #D97706)',
    gradientDiagonal: 'linear-gradient(to bottom right, #F59E0B, #D97706)',
  },
  
  // Rouge pour alertes/erreurs
  red: '#B71C1C',
  
  // Texte
  textDark: '#0F172A',
  textLight: '#FFFFFF',
  textMuted: '#475569',
};

// Fonction pour obtenir les couleurs selon le domaine
export type Domain = 'agriculture' | 'elevage' | 'all';

export const getDomainColors = (domain: Domain) => {
  if (domain === 'elevage') {
    return COLORS.elevage;
  }
  // Par défaut, agriculture (y compris pour 'all')
  return COLORS.agriculture;
};

// Fonction pour obtenir les classes Tailwind selon le domaine
export const getDomainClasses = (domain: Domain) => {
  if (domain === 'elevage') {
    return {
      bg: 'bg-elevage',
      bgHover: 'hover:bg-elevage-dark',
      bgLight: 'bg-elevage/10',
      text: 'text-elevage',
      textLight: 'text-elevage-light',
      border: 'border-elevage',
      ring: 'ring-elevage',
    };
  }
  return {
    bg: 'bg-agriculture',
    bgHover: 'hover:bg-agriculture-dark',
    bgLight: 'bg-agriculture/10',
    text: 'text-agriculture',
    textLight: 'text-agriculture-light',
    border: 'border-agriculture',
    ring: 'ring-agriculture',
  };
};
