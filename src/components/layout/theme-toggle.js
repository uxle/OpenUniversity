// src/components/layout/theme-toggle.js — one theme-toggle button builder
// shared by the header AND the full-screen menu sheet, so both icons can
// never drift apart. Each button re-renders its glyph from the app store:
// applyTheme() → appStore.setState({ theme }) → every subscriber swaps its
// own icon, so toggling from either place updates BOTH buttons.
import { createEl } from "../../utils/dom.js";
import { icon } from "../../utils/icon.js";
import { currentTheme, toggleTheme } from "../../utils/theme.js";
import { appStore } from "../../app/state.js";

const THEME_ICON = { light: "sun", dark: "moon" };

export function createThemeToggleButton() {
  const button = createEl("button", {
    class: "ou-btn ou-btn--icon ou-btn--bare",
    type: "button",
    "aria-label": "Toggle dark mode",
    dataset: { themeToggle: "" }, // createEl maps dataset → real data-* attrs
    on: { click: () => toggleTheme() }, // glyph swap happens in the subscriber
  });

  let iconEl = icon(THEME_ICON[currentTheme()]);
  iconEl.dataset.iconKey = THEME_ICON[currentTheme()];
  button.appendChild(iconEl);

  appStore.subscribe((state) => {
    const wanted = THEME_ICON[state.theme === "dark" ? "dark" : "light"];
    if (iconEl.dataset.iconKey === wanted) return;
    const fresh = icon(wanted);
    fresh.dataset.iconKey = wanted;
    button.replaceChild(fresh, iconEl);
    iconEl = fresh;
  });

  return button;
}
