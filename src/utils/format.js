// src/utils/format.js — display formatting helpers.

export function formatPercent(value, { decimals = 0 } = {}) {
  if (!Number.isFinite(value)) return "0%";
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatNumber(value, locale = "en") {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat(locale).format(value);
}

/** @param {number} ms */
export function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

export function formatScore(correct, total) {
  if (!total) return "0 / 0";
  return `${correct} / ${total} (${formatPercent(correct / total)})`;
}
