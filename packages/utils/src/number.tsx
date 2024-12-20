export function formatNumber(number: number, locale: string = "en-US") {
  return number.toLocaleString(locale);
}
