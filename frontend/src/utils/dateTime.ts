const MINUTE_SECONDS = 60;
const HOUR_SECONDS = 60 * MINUTE_SECONDS;
const DAY_SECONDS = 24 * HOUR_SECONDS;
const WEEK_SECONDS = 7 * DAY_SECONDS;

export function formatRelativeTime(date: string): string {
  const target = new Date(date);
  if (Number.isNaN(target.getTime())) {
    return "Unknown time";
  }

  const now = Date.now();
  const deltaSeconds = Math.floor((target.getTime() - now) / 1000);
  const absSeconds = Math.abs(deltaSeconds);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (absSeconds < 45) {
    return "Just now";
  }

  if (absSeconds < HOUR_SECONDS) {
    return rtf.format(Math.round(deltaSeconds / MINUTE_SECONDS), "minute");
  }

  if (absSeconds < DAY_SECONDS) {
    return rtf.format(Math.round(deltaSeconds / HOUR_SECONDS), "hour");
  }

  if (absSeconds < WEEK_SECONDS) {
    return rtf.format(Math.round(deltaSeconds / DAY_SECONDS), "day");
  }

  return rtf.format(Math.round(deltaSeconds / WEEK_SECONDS), "week");
}

export function formatFullTimestamp(date: string): string {
  const target = new Date(date);
  if (Number.isNaN(target.getTime())) {
    return "Invalid date";
  }

  const datePart = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(target);

  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(target);

  return `${datePart} at ${timePart}`;
}
