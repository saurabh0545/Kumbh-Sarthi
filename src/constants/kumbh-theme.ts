/**
 * Kumbh Sarthi Design System
 * Colors, typography, spacing, and design tokens matching the Figma reference.
 */

export const KumbhColors = {
  // Core Brand Colors
  navy: '#123B5D',             // Deep Navy (Headers, important navigation)
  saffron: '#F47C20',          // Kumbh Saffron (Primary action, active states)
  gold: '#F4B942',             // Warm Gold (Secondary accent)
  cream: '#FFF9F0',            // Warm Cream (App background)
  white: '#FFFFFF',            // Cards & sheets

  // Semantic Design System tokens
  primary: '#123B5D',          // Deep Navy
  primaryAccent: '#F47C20',    // Kumbh Saffron
  secondaryAccent: '#F4B942',  // Warm Gold
  secondary: '#123B5D',
  primaryLight: '#F47C20',
  primaryDark: '#0D2B44',
  saffronPrimary: '#F47C20',

  // Backgrounds
  background: '#FFF9F0',       // Warm Cream
  backgroundCard: '#FFFFFF',   // Pure White
  card: '#FFFFFF',
  backgroundAlt: '#F5EEDB',

  // Safety Status Indicators
  statusLow: '#16A34A',        // Safe
  statusLowBg: '#DCFCE7',
  statusLowText: '#14532D',
  statusModerate: '#F59E0B',   // Warning
  statusModerateBg: '#FEF3C7',
  statusModerateText: '#92400E',
  statusHigh: '#DC2626',       // Critical
  statusHighBg: '#FEE2E2',
  statusHighText: '#991B1B',
  info: '#2563EB',             // Map / Information
  infoBg: '#DBEAFE',
  infoText: '#1E40AF',

  // Live / Demo badges
  liveBadge: '#DC2626',
  liveBadgeBg: '#FEE2E2',
  demoBadge: '#64748B',
  demoBadgeBg: '#F1F5F9',

  // Text
  textPrimary: '#123B5D',      // Deep Navy text
  textSecondary: '#4A5568',    // Muted slate
  textMuted: '#8C9BAE',
  textOnPrimary: '#FFFFFF',
  textOnSaffron: '#FFFFFF',

  // Borders
  border: '#EBE3D5',
  borderLight: '#F5EFE6',

  // Emergency & Safety
  emergency: '#DC2626',
  emergencyLight: '#EF4444',
  emergencyBg: '#FEF2F2',
  safeStatus: '#16A34A',
  safeStatusBg: '#DCFCE7',

  // Tab bar
  tabActive: '#F47C20',
  tabInactive: '#64748B',
  tabBackground: '#FFFFFF',

  // Overlay
  overlay: 'rgba(18, 59, 93, 0.4)',
} as const;

export const KumbhSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const KumbhRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

export const KumbhTypography = {
  heroTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
    lineHeight: 36,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 30,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 26,
  },
  h4: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodyMedium: {
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 22,
  },
  small: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  smallMedium: {
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 18,
  },
  caption: {
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  badge: {
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
    lineHeight: 14,
  },
} as const;

export const KumbhShadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;
