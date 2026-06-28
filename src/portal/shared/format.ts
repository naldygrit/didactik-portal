import type { LicenseType } from './types';

export function money(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function licenseTypeLabel(type: LicenseType): string {
  return type === 'exclusive' ? 'Exclusive' : 'Non-exclusive';
}
