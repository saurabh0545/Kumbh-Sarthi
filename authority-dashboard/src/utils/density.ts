import { DensityLevel } from '../types';

export function normalizeDensity(density: string): DensityLevel {
  const upper = (density || '').toUpperCase();
  if (upper === 'HIGH' || upper === 'CRITICAL') return 'HIGH';
  if (upper === 'MEDIUM' || upper === 'MODERATE') return 'MEDIUM';
  return 'LOW';
}

export function getDensityColor(density: string): {
  color: string;
  bg: string;
  border: string;
  badgeBg: string;
  badgeText: string;
} {
  const norm = normalizeDensity(density);
  if (norm === 'HIGH') {
    return {
      color: '#DC2626',
      bg: '#FEF2F2',
      border: '#FCA5A5',
      badgeBg: '#FEE2E2',
      badgeText: '#B91C1C',
    };
  }
  if (norm === 'MEDIUM') {
    return {
      color: '#F59E0B',
      bg: '#FFFBEB',
      border: '#FCD34D',
      badgeBg: '#FEF3C7',
      badgeText: '#B45309',
    };
  }
  return {
    color: '#16A34A',
    bg: '#F0FDF4',
    border: '#86EFAC',
    badgeBg: '#DCFCE7',
    badgeText: '#15803D',
  };
}

export function getDensityPercentage(count: number, capacity: number): number {
  if (!capacity || capacity <= 0) return 0;
  return Math.min(Math.round((count / capacity) * 100), 100);
}
