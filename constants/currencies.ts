import { Currency } from '@/types';

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CUSTOM', symbol: '', name: 'Custom Symbol' },
];

export function getCurrencySymbol(currencyCode: string, customSymbol?: string): string {
  if (currencyCode === 'CUSTOM' && customSymbol) {
    return customSymbol;
  }
  const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
  return currency?.symbol || '$';
}

export function getCurrencyName(currencyCode: string): string {
  const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
  return currency?.name || 'Unknown';
}

export function formatAmount(amount: number, currencySymbol: string): string {
  return `${currencySymbol}${(amount / 100).toFixed(2)}`;
}
