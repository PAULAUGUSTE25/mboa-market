/**
 * Couleurs officielles de MBOA Market
 * Palette Olive Premium (#3F441C) - Naturelle, élégante et sophistiquée
 */

export const COLORS = {
  // Olive Premium - Couleur signature MBOA
  agriculture: {
    primary: '#3F441C',      // Olive principal
    dark: '#353916',         // Olive foncé
    light: '#4A4F23',        // Olive clair
    gradient: 'linear-gradient(to right, #3F441C, #353916)',
    gradientDiagonal: 'linear-gradient(to bottom right, #3F441C, #353916)',
  },
  
  // Olive Premium - Uniformité totale pour élevage
  elevage: {
    primary: '#3F441C',      // Olive principal
    dark: '#353916',         // Olive foncé
    light: '#4A4F23',        // Olive clair
    gradient: 'linear-gradient(to right, #3F441C, #353916)',
    gradientDiagonal: 'linear-gradient(to bottom right, #3F441C, #353916)',
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
