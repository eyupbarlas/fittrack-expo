// FitTrack Design System — all colors, spacing, typography in one place

export const Colors = {
  primary: '#6366F1',       // Indigo
  primaryDark: '#4F46E5',
  primaryLight: '#A5B4FC',
  secondary: '#10B981',     // Emerald — success/complete
  secondaryDark: '#059669',
  accent: '#F59E0B',        // Amber — highlights
  danger: '#EF4444',        // Red — delete/warning
  dangerLight: '#FEE2E2',
  background: '#0F0F23',    // Deep dark background
  surface: '#1A1A3E',       // Card surface
  surfaceLight: '#252550',  // Lighter card
  border: '#2D2D6B',
  text: {
    primary: '#F1F5F9',
    secondary: '#94A3B8',
    muted: '#64748B',
    inverse: '#0F0F23',
  },
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const Shadows = {
  sm: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
};
