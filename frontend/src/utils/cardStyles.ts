// Utility pour les styles de cartes visibles en light/dark mode
// Inspiré des styles de HomePage

export const getCardStyles = (theme: 'light' | 'dark', color: 'olive' | 'amber' | 'red' | 'emerald' = 'olive') => {
  if (theme === 'light') {
    const colorMap: Record<string, string> = {
      olive: '#3F441C',
      amber: '#F59E0B',
      red: '#B71C1C',
      emerald: '#059669'
    };
    return {
      background: '#FFFFFF',
      borderColor: colorMap[color] || '#3F441C',
      borderWidth: '3px',
    };
  }
  
  return {
    background: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: '1px',
  };
};

export const getTextStyles = (theme: 'light' | 'dark') => {
  if (theme === 'light') {
    return {
      title: '#0F172A',
      subtitle: '#1E293B',
      body: '#334155',
      muted: '#475569',
    };
  }
  
  return {
    title: '#FFFFFF',
    subtitle: '#D1D5DB',
    body: 'rgba(209, 213, 219, 0.9)',
    muted: 'rgba(255, 255, 255, 0.6)',
  };
};

export const getInputStyles = (theme: 'light' | 'dark', hasError: boolean = false) => {
  if (theme === 'light') {
    return {
      background: 'rgba(255, 255, 255, 0.98)',
      borderColor: hasError ? '#EF4444' : '#94A3B8',
      color: '#0F172A',
      placeholderColor: '#64748B',
      focusBorderColor: hasError ? '#DC2626' : '#3F441C',
    };
  }
  
  return {
    background: 'rgba(255, 255, 255, 0.15)',
    borderColor: hasError ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.2)',
    color: '#FFFFFF',
    placeholderColor: 'rgba(255, 255, 255, 0.6)',
    focusBorderColor: hasError ? '#EF4444' : '#3F441C',
  };
};

export const getButtonStyles = (theme: 'light' | 'dark', variant: 'primary' | 'secondary' = 'primary', color: 'olive' | 'amber' | 'red' | 'emerald' = 'olive') => {
  if (theme === 'light') {
    if (variant === 'primary') {
      const colorMap: Record<string, { bg: string; shadow: string }> = {
        olive: { bg: '#3F441C', shadow: 'rgba(63, 68, 28, 0.5)' },
        amber: { bg: '#F59E0B', shadow: 'rgba(245, 158, 11, 0.5)' },
        red: { bg: '#B71C1C', shadow: 'rgba(183, 28, 28, 0.5)' },
        emerald: { bg: '#059669', shadow: 'rgba(5, 150, 105, 0.5)' }
      };
      const colorStyle = colorMap[color] || colorMap.olive;
      return {
        background: colorStyle.bg,
        borderColor: colorStyle.bg,
        color: '#FFFFFF',
        boxShadow: `0 4px 20px ${colorStyle.shadow}`,
      };
    }
    
    return {
      background: 'rgba(255, 255, 255, 0.98)',
      borderColor: '#475569',
      color: '#1E293B',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    };
  }
  
  if (variant === 'primary') {
    const darkColorMap: Record<string, { bg: string; border: string; text: string }> = {
      olive: { bg: 'rgba(63, 68, 28, 0.2)', border: 'rgba(63, 68, 28, 0.3)', text: '#7A7D5C' },
      amber: { bg: 'rgba(251, 191, 36, 0.2)', border: 'rgba(251, 191, 36, 0.3)', text: '#FCD34D' },
      red: { bg: 'rgba(183, 28, 28, 0.2)', border: 'rgba(183, 28, 28, 0.3)', text: '#EF5350' }
    };
    const colorStyle = darkColorMap[color] || darkColorMap.olive;
    return {
      background: colorStyle.bg,
      borderColor: colorStyle.border,
      color: colorStyle.text,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    };
  }
  
  return {
    background: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: '#D1D5DB',
    boxShadow: 'none',
  };
};
