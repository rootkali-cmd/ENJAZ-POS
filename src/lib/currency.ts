export const CURRENCY_SYMBOLS: Record<string, string> = {
  SAR: "ر.س",
  AED: "د.إ",
  EGP: "ج.م",
  USD: "$",
}

export const CURRENCY_NAMES: Record<string, string> = {
  SAR: "ريال سعودي",
  AED: "درهم إماراتي",
  EGP: "جنيه مصري",
  USD: "دولار أمريكي",
}

export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] || currency
}

export function formatCurrency(amount: number, currency: string = "SAR"): string {
  const symbol = getCurrencySymbol(currency)
  return `${amount.toLocaleString()} ${symbol}`
}
