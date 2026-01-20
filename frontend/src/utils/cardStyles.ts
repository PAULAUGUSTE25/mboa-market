// Utility pour les styles de cartes visibles en light/dark mode
// Inspiré des styles de HomePage

export const getCardStyles = (theme: 'light' | 'dark', color: 'emerald' | 'amber' = 'emerald') => {
  if (theme === 'light') {
    return {
      background: '#FFFFFF',
      borderColor: color === 'emerald' ? '#10B981' : '#F59E0B',
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
      focusBorderColor: hasError ? '#DC2626' : '#10B981',
    };
  }
  
  return {
    background: 'rgba(255, 255, 255, 0.15)',
    borderColor: hasError ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.2)',
    color: '#FFFFFF',
    placeholderColor: 'rgba(255, 255, 255, 0.6)',
    focusBorderColor: hasError ? '#EF4444' : '#10B981',
  };
};

export const getButtonStyles = (theme: 'light' | 'dark', variant: 'primary' | 'secondary' = 'primary', color: 'emerald' | 'amber' = 'emerald') => {
  if (theme === 'light') {
    if (variant === 'primary') {
      return {
        background: color === 'emerald' 
          ? 'linear-gradient(to right, #059669, #047857)'
          : 'linear-gradient(to right, #D97706, #B45309)',
        borderColor: color === 'emerald' ? '#047857' : '#B45309',
        color: '#FFFFFF',
        boxShadow: color === 'emerald'
          ? '0 4px 20px rgba(5, 150, 105, 0.5)'
          : '0 4px 20px rgba(217, 119, 6, 0.5)',
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
    return {
      background: color === 'emerald'
        ? 'rgba(16, 185, 129, 0.2)'
        : 'rgba(251, 191, 36, 0.2)',
      borderColor: color === 'emerald'
        ? 'rgba(16, 185, 129, 0.3)'
        : 'rgba(251, 191, 36, 0.3)',
      color: color === 'emerald' ? '#34D399' : '#FCD34D',
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
