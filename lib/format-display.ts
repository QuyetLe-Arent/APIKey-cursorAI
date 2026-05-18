/** Fixed locale so SSR and client render identical strings (avoids hydration mismatch). */
const DISPLAY_LOCALE = "en-US";

const DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(DISPLAY_LOCALE, DATE_TIME_OPTIONS);
}

export function formatInteger(value: number): string {
  return value.toLocaleString(DISPLAY_LOCALE);
}
