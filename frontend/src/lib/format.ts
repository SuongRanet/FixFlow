const localeMap: Record<string, string> = {
  en: "en-GB",
  km: "km-KH",
  zh: "zh-CN",
};

const toLocale = (language: string) =>
  localeMap[language.split("-")[0]] ?? "en-GB";

/** "24 Sep 2026, 14:05" in the active language. */
export const formatDateTime = (value: string | undefined, language: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(toLocale(language), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const formatDate = (value: string | undefined, language: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(toLocale(language), {
    dateStyle: "medium",
  }).format(date);
};

/** "3 h ago" style label for notification lists. */
export const formatRelative = (value: string | undefined, language: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(toLocale(language), {
    numeric: "auto",
  });

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
  ];

  for (const [unit, unitSeconds] of units) {
    if (Math.abs(seconds) >= unitSeconds) {
      return formatter.format(Math.round(seconds / unitSeconds), unit);
    }
  }

  return formatter.format(seconds, "second");
};

/** COUNT(*) arrives as a string; render 0 rather than NaN when absent. */
export const toCount = (value: string | number | undefined) => {
  const parsed = Number(value ?? 0);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const formatFileSize = (bytes: number) => {
  if (!bytes) return "0 KB";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const initialsOf = (first?: string, last?: string) =>
  `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?";
