// Type definitions for the Mboa Market theme system

export type ThemeMode = 'light' | 'dark';

export interface ThemePalette {
  primary: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  surface: {
    main: string;
    glass: string;
    glassBorder: string;
  };
  background: {
    default: string;
    paper: string;
    gradient: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    hint: string;
  };
  border: {
    light: string;
    main: string;
    dark: string;
  };
  shadow: {
    sm: string;
    md: string;
    lg: string;
  };
}

export interface Theme {
  mode: ThemeMode;
  palette: ThemePalette;
  spacing: (factor: number) => string;
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    pill: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
}

// Light theme configuration - Doux et Apaisant (pas de blanc agressif)
export const lightTheme: Theme = {
  mode: 'light',
  palette: {
    primary: {
      main: '#52B788', // Vert doux pastel
      light: '#74C69D',
      dark: '#40916C',
      contrastText: '#FFFFFF',
    },
    surface: {
      main: '#EAE5DC', // Crème légèrement assombri
      glass: 'rgba(234, 229, 220, 0.82)', // Glassmorphism crème
      glassBorder: 'rgba(190, 180, 165, 0.28)', // Bordure subtile
    },
    background: {
      default: '#EDEAE3', // Crème doux assombri
      paper: '#EAE5DC', // Crème
      gradient: 'linear-gradient(135deg, #EDEAE3 0%, #EAE5DC 50%, #E5E0D5 100%)', // Gradient crème
    },
    text: {
      primary: '#2D3748', // Gris foncé doux (pas noir)
      secondary: '#718096', // Gris moyen doux
      disabled: '#A0AEC0',
      hint: '#CBD5E0',
    },
    border: {
      light: 'rgba(0, 0, 0, 0.05)',
      main: 'rgba(0, 0, 0, 0.08)', // Bordures très subtiles
      dark: 'rgba(0, 0, 0, 0.15)',
    },
    shadow: {
      sm: '0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      md: '0 4px 12px 0 rgba(0, 0, 0, 0.08)', // Ombres douces
      lg: '0 8px 24px 0 rgba(0, 0, 0, 0.1)',
    },
  },
  spacing: (factor: number) => `${factor * 0.25}rem`,
  borderRadius: {
    sm: '0.375rem', // 6px
    md: '0.5rem', // 8px
    lg: '0.75rem', // 12px
    xl: '1rem', // 16px
    pill: '9999px',
  },
  typography: {
    fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
};

// Dark theme configuration
export const darkTheme: Theme = {
  mode: 'dark',
  palette: {
    primary: {
      main: '#3F441C',
      light: '#34D399',
      dark: '#353916',
      contrastText: '#FFFFFF',
    },
    surface: {
      main: 'rgba(30, 41, 59, 0.9)', // slate-800 with opacity
      glass: 'rgba(30, 41, 59, 0.7)',
      glassBorder: 'rgba(255, 255, 255, 0.1)',
    },
    background: {
      default: '#0F172A', // slate-900
      paper: '#1E293B', // slate-800
      gradient: 'linear-gradient(135deg, #064E3B 0%, #065F46 50%, #047857 100%)', // Vert foncé
    },
    text: {
      primary: '#F8FAFC', // slate-50
      secondary: '#CBD5E1', // slate-300
      disabled: '#64748B', // slate-500
      hint: '#475569', // slate-600
    },
    border: {
      light: 'rgba(255, 255, 255, 0.05)',
      main: 'rgba(255, 255, 255, 0.1)',
      dark: 'rgba(255, 255, 255, 0.2)',
    },
    shadow: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
    },
  },
  spacing: (factor: number) => `${factor * 0.25}rem`,
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    pill: '9999px',
  },
  typography: {
    fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
};
