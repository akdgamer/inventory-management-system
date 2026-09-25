// Single source of truth for money formatting.
// Prices are stored in INR; a future currency-switching feature changes this
// module (plus a rate lookup) rather than every call site.
const LOCALE = 'en-IN';
const CURRENCY = 'INR';

const formatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Coerces anything non-numeric (undefined, null, "") to 0 so items without a
// price render as ₹0.00 rather than "NaN".
export function formatMoney(value) {
  const amount = Number(value);
  return formatter.format(Number.isFinite(amount) ? amount : 0);
}
