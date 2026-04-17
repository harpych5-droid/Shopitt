// Currency mapping based on country name
export const COUNTRY_CURRENCY_MAP: Record<string, { code: string; symbol: string; name: string }> = {
  Zambia: { code: 'ZMW', symbol: 'K', name: 'Zambian Kwacha' },
  Zimbabwe: { code: 'ZWL', symbol: 'Z$', name: 'Zimbabwean Dollar' },
  'South Africa': { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  Kenya: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  Nigeria: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  Ghana: { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' },
  Tanzania: { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
  Uganda: { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
  Ethiopia: { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr' },
  'United States': { code: 'USD', symbol: '$', name: 'US Dollar' },
  'United Kingdom': { code: 'GBP', symbol: '£', name: 'British Pound' },
  Germany: { code: 'EUR', symbol: '€', name: 'Euro' },
  France: { code: 'EUR', symbol: '€', name: 'Euro' },
  Italy: { code: 'EUR', symbol: '€', name: 'Euro' },
  Spain: { code: 'EUR', symbol: '€', name: 'Euro' },
  China: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  Japan: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  India: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  Canada: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  Australia: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  Brazil: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  Mexico: { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
  'Saudi Arabia': { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  'United Arab Emirates': { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  Egypt: { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
  Morocco: { code: 'MAD', symbol: 'MAD', name: 'Moroccan Dirham' },
  Botswana: { code: 'BWP', symbol: 'P', name: 'Botswana Pula' },
  Namibia: { code: 'NAD', symbol: 'N$', name: 'Namibian Dollar' },
  Mozambique: { code: 'MZN', symbol: 'MT', name: 'Mozambican Metical' },
  Malawi: { code: 'MWK', symbol: 'MK', name: 'Malawian Kwacha' },
  Rwanda: { code: 'RWF', symbol: 'FRw', name: 'Rwandan Franc' },
  Senegal: { code: 'XOF', symbol: 'CFA', name: 'West African CFA' },
};

export function getCurrencyForCountry(country: string): { code: string; symbol: string; name: string } {
  return COUNTRY_CURRENCY_MAP[country] || { code: 'USD', symbol: '$', name: 'US Dollar' };
}

export function formatPrice(amount: number, country: string): string {
  const { symbol } = getCurrencyForCountry(country);
  if (amount >= 1000) {
    return `${symbol}${amount.toLocaleString()}`;
  }
  return `${symbol}${amount}`;
}
