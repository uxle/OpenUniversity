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
  if (highContrast) root.dataset.theme = "high-contrast";
  root.dataset.a11yTextSize = settings.textSize;
}
