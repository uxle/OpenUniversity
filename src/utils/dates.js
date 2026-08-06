// src/utils/dates.js — date helpers used by progress/streak features.

const DAY_MS = 24 * 60 * 60 * 1000;

export function toDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

export function daysBetween(a, b) {
  const start = new Date(toDateKey(a instanceof Date ? a : new Date(a)));
  const end = new Date(toDateKey(b instanceof Date ? b : new Date(b)));
  return Math.round((end - start) / DAY_MS);
}

export function isSameDay(a, b) {
  return toDateKey(a instanceof Date ? a : new Date(a)) === toDateKey(b instanceof Date ? b : new Date(b));
}

export function isConsecutiveDay(previous, current) {
  return daysBetween(previous, current) === 1;
}

export function timeAgo(date, now = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const seconds = Math.max(0, Math.round((now - d) / 1000));
  const steps = [
    [60, "s"], [60, "m"], [24, "h"], [7, "d"], [4.345, "w"], [12, "mo"], [Infinity, "y"],
  ];
  let value = seconds;
  let unit = "s";
  for (const [factor, label] of steps) {
    if (value < factor) { unit = label; break; }
    value = Math.floor(value / factor);
    unit = label;
  }
  if (unit === "s" && value < 5) return "just now";
  return `${value}${unit} ago`;
}

export function formatDate(date, locale = "en") {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric" }).format(d);
}
