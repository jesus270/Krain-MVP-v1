export function formatNumber(
  number: number | undefined | null,
  locale: string = "en-US",
) {
  if (number === undefined || number === null) {
    return "0";
  }
  return number.toLocaleString(locale);
}
