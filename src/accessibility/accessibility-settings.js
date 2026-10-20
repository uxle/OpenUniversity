// src/accessibility/accessibility-settings.js — persisted a11y prefs,
// applied as attributes on <html> so src/styles/accessibility.css can hook them.

import { getPreference, setPreference } from "../storage/user-storage.js";
import { prefersReducedMotion, prefersHighContrast } from "../utils/accessibility.js";

const DEFAULTS = { reducedMotion: null, highContrast: null, textSize: "md" };

export function getAccessibilitySettings() {
  return {
    reducedMotion: getPreference("a11y:reducedMotion", DEFAULTS.reducedMotion),
    highContrast: getPreference("a11y:highContrast", DEFAULTS.highContrast),
    textSize: getPreference("a11y:textSize", DEFAULTS.textSize),
  };
}

export function setAccessibilitySetting(key, value) {
  setPreference(`a11y:${key}`, value);
  applyAccessibilitySettings();
}

/** Resolve stored override, falling back to the OS-level media query. */
export function applyAccessibilitySettings(root = document.documentElement) {
  const settings = getAccessibilitySettings();
  const reducedMotion = settings.reducedMotion ?? prefersReducedMotion();
  const highContrast = settings.highContrast ?? prefersHighContrast();
  root.dataset.a11yReducedMotion = String(reducedMotion);
  root.dataset.a11yTextSize = settings.textSize;

  // High contrast is a *layer* on top of the user's chosen light/dark
  // theme, not a replacement for it. While enabled, we render
  // "high-contrast" but remember the underlying theme; when disabled we
  // restore it. Previously the flag only ever overwrote dataset.theme —
  // switching high contrast OFF left every page stuck in high contrast
  // until you manually picked a theme again (and boot applied it before
  // the stored theme, silently cancelling it instead).
  if (highContrast) {
    if (root.dataset.theme !== "high-contrast") {
      root.dataset.preHcTheme = root.dataset.theme || getPreference("theme", "light");
      root.dataset.theme = "high-contrast";
    }
  } else if (root.dataset.theme === "high-contrast") {
    root.dataset.theme = root.dataset.preHcTheme || getPreference("theme", "light");
    delete root.dataset.preHcTheme;
  }
}
