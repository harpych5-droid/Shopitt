export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

const COUNTRY_CURRENCY: Record<string, Currency> = {
  ZM: { code: 'ZMW', symbol: 'K', name: 'Zambian Kwacha' },
  US: { code: 'USD', symbol: '$', name: 'US Dollar' },
  GB: { code: 'GBP', symbol: '£', name: 'British Pound' },
  EU: { code: 'EUR', symbol: '€', name: 'Euro' },
  NG: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  ZA: { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  KE: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  GH: { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' },
  TZ: { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
  UG: { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
  RW: { code: 'RWF', symbol: 'FRw', name: 'Rwandan Franc' },
  ET: { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr' },
  EG: { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
  MA: { code: 'MAD', symbol: 'DH', name: 'Moroccan Dirham' },
  IN: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  CN: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  JP: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  AU: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  CA: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  AE: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  SA: { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
};

// Map country names (from country picker) → currency
const COUNTRY_NAME_MAP: Record<string, string> = {
  'Zambia': 'ZM',
  'United States': 'US',
  'United Kingdom': 'GB',
  'Nigeria': 'NG',
  'South Africa': 'ZA',
  'Kenya': 'KE',
  'Ghana': 'GH',
  'Tanzania': 'TZ',
  'Uganda': 'UG',
  'Rwanda': 'RW',
  'Ethiopia': 'ET',
  'Egypt': 'EG',
  'Morocco': 'MA',
  'India': 'IN',
  'China': 'CN',
  'Japan': 'JP',
  'Australia': 'AU',
  'Canada': 'CA',
  'United Arab Emirates': 'AE',
  'Saudi Arabia': 'SA',
};

export const DEFAULT_CURRENCY: Currency = { code: 'ZMW', symbol: 'K', name: 'Zambian Kwacha' };

export function getCurrencyForCountry(countryName: string): Currency {
  const code = COUNTRY_NAME_MAP[countryName];
  return COUNTRY_CURRENCY[code] ?? DEFAULT_CURRENCY;
}

export function getCurrencyByCode(code: string): Currency {
  return Object.values(COUNTRY_CURRENCY).find(c => c.code === code) ?? DEFAULT_CURRENCY;
}

export function formatPrice(amount: number, currency: Currency): string {
  return `${currency.symbol}${amount.toLocaleString()}`;
}
