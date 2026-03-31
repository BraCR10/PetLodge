export const Colors = {
  // Primary colors
  primary: '#030213',
  primaryLight: '#1a0f3d',
  primaryDark: '#000000',

  // Background & Surface
  background: '#ffffff',
  surface: '#f9f9f9',
  card: '#ffffff',

  // Text
  text: '#030213',
  textSecondary: '#666666',
  textTertiary: '#999999',

  // States
  success: '#10b981',
  error: '#d4183d',
  warning: '#f59e0b',
  info: '#3b82f6',

  // Borders
  border: '#e5e7eb',
  borderLight: '#f3f4f6',

  // Specific
  teal: '#0d9488',
  blue: '#3b82f6',
  indigo: '#6366f1',
  purple: '#8b5cf6',
  amber: '#f59e0b',
  red: '#ef4444',

  // Dark mode
  dark: {
    background: '#030213',
    surface: '#1a1a2e',
    card: '#2d2d44',
    text: '#ffffff',
    textSecondary: '#b0b0b0',
    border: '#404060',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
};
