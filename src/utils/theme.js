// src/utils/theme.js — single source of truth for toggling light/dark.
// Extracted from the header toggle so the command palette can offer the
// same action without duplicating (and drifting from) this sequence:
// dataset → persisted preference → store → a11y reapply (high-contrast
// layers on top of the new base) → theme-color meta → announcement.

import { setPreference } from "../storage/user-storage.js";
import { applyAccessibilitySettings } from "../accessibility/accessibility-settings.js";
import { announce } from "../accessibility/screen-reader.js";
import { appStore } from "../app/state.js";

export function currentTheme() {
  return appStore.getState().theme === "dark" ? "dark" : "light";
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  setPreference("theme", theme);
  appStore.setState({ theme });
  // Re-run so the high-contrast layer (when enabled) reapplies on top of
  // the new base theme instead of being silently wiped.
  applyAccessibilitySettings();
  const meta = document.getElementById("theme-color-meta");
  if (meta) meta.content = theme === "dark" ? "#141a24" : "#f7f5f0";
  announce(`${theme === "dark" ? "Dark" : "Light"} mode enabled`);
}

export function toggleTheme() {
  const next = currentTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}
