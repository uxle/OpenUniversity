// src/core/logger.js — namespaced, leveled console logger.

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3, silent: 4 };
let currentLevel = LEVELS.info;

export function setLogLevel(level) {
  if (level in LEVELS) currentLevel = LEVELS[level];
}

export function createLogger(namespace) {
  const log = (level, ...args) => {
    if (LEVELS[level] < currentLevel) return;
    const fn = level === "debug" ? console.debug : level === "warn" ? console.warn
      : level === "error" ? console.error : console.log;
    fn(`[${namespace}]`, ...args);
  };
  return {
    debug: (...a) => log("debug", ...a),
    info: (...a) => log("info", ...a),
    warn: (...a) => log("warn", ...a),
    error: (...a) => log("error", ...a),
  };
}

export const logger = createLogger("app");
