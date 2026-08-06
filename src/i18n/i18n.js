// src/i18n/i18n.js — small translate() helper. Loads locale JSON via
// core/loader.js at runtime; does not define locale content itself
// (see src/i18n/en.json, hi.json).

import { loadJSON } from "../core/loader.js";
import { getPreference, setPreference } from "../storage/user-storage.js";
import { createLogger } from "../core/logger.js";

const log = createLogger("i18n");
const LOCALE_PATHS = { en: "src/i18n/en.json", hi: "src/i18n/hi.json" };

let currentLocale = getPreference("locale", "en");
let currentStrings = {};

export function getLocale() {
  return currentLocale;
}

export async function setLocale(locale) {
  if (!(locale in LOCALE_PATHS)) {
    log.warn(`unknown locale "${locale}", falling back to "en"`);
    locale = "en";
  }
  currentLocale = locale;
  setPreference("locale", locale);
  try {
    currentStrings = await loadJSON(LOCALE_PATHS[locale]);
  } catch (err) {
    log.warn(`failed to load locale "${locale}"`, err);
    currentStrings = {};
  }
  return currentStrings;
}

/** @param {string} key @param {Record<string,string|number>} [params] */
export function t(key, params = {}) {
  let str = currentStrings[key] ?? key;
  for (const [param, value] of Object.entries(params)) {
    str = str.replaceAll(`{${param}}`, String(value));
  }
  return str;
}
