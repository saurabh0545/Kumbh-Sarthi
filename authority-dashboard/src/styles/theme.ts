export const theme = {
  colors: {
    // Primary Brand
    navy: {
      DEFAULT: '#123B5D',
      dark: '#0A2540',
      darker: '#071A2D',
      light: '#1B4D79',
      surface: '#0F2C46',
      border: 'rgba(255, 255, 255, 0.08)',
    },
    saffron: {
      DEFAULT: '#F47C20',
      light: '#FF9447',
      dark: '#D9650E',
      glow: 'rgba(244, 124, 32, 0.18)',
    },
    gold: {
      DEFAULT: '#F4B942',
      light: '#F8CE70',
      dark: '#DA9E2A',
    },
    cream: {
      DEFAULT: '#FFF9F0',
      dark: '#F5ECE0',
    },
    // Status & Utility Colors (ONLY for status)
    status: {
      green: {
        text: '#15803D',
        bg: '#DCFCE7',
        border: '#86EFAC',
        solid: '#16A34A',
      },
      amber: {
        text: '#B45309',
        bg: '#FEF3C7',
        border: '#FCD34D',
        solid: '#F59E0B',
      },
      red: {
        text: '#B91C1C',
        bg: '#FEE2E2',
        border: '#FCA5A5',
        solid: '#DC2626',
      },
      blue: {
        text: '#1D4ED8',
        bg: '#DBEAFE',
        border: '#93C5FD',
        solid: '#2563EB',
      },
    },
    neutral: {
      bg: '#F4F6F9',
      card: '#FFFFFF',
      border: '#E2E8F0',
      textPrimary: '#0F172A',
      textSecondary: '#475569',
      textMuted: '#94A3B8',
    },
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  borderRadius: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '18px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    card: '0 1px 3px 0 rgba(18, 59, 93, 0.06), 0 1px 2px -1px rgba(18, 59, 93, 0.06)',
    cardHover: '0 4px 12px -2px rgba(18, 59, 93, 0.12), 0 2px 4px -2px rgba(18, 59, 93, 0.06)',
    modal: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  },
};
