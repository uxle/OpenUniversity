// src/components/layout/mobile-navigation.js — the app's primary
// navigation, visible at every screen width (not just mobile — see the
// reference design this follows). Kept simple on purpose: 4 tabs.
// Everything else lives behind the header's "more" menu.
import { createEl } from "../../utils/dom.js";
import { icon } from "../../utils/icon.js";

const TABS = [
  { label: "Home", path: "/", iconName: "house" },
  { label: "Subjects", path: "/subjects", iconName: "book-open" },
  { label: "Search", path: "/search", iconName: "magnifying-glass" },
  { label: "Progress", path: "/progress", iconName: "chart-line" },
];

export function createMobileNavigation() {
  return createEl("nav", { class: "ou-mobile-nav", "aria-label": "Primary" },
    TABS.map((tab) => createEl("a", { href: `#${tab.path}`, class: "ou-mobile-nav__item" }, [
      icon(tab.iconName),
      createEl("span", {}, [tab.label]),
    ]))
  );
}
