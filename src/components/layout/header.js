// src/components/layout/header.js — minimal sticky header: brand on the
// left; on the right, three BARE icon actions (no circles, no chrome —
// soft rounded squares appear only as hover/active affordances):
//   [ search (≥720px only) ]  [ menu ]
// Search lives in the bottom nav on phones (thumb zone), so the header
// copy only appears where the bottom nav drops its Search tab (≥720px).
// The light/dark toggle lives in the menu sheet, not the header.
// The menu button sits at the top-right corner and opens the full-screen
// menu sheet (see menu-sheet.js) — the old "More" dropdown is gone.
// Primary navigation ALSO lives in the bottom nav at every screen width
// (see components/layout/mobile-navigation.js).
import { createEl } from "../../utils/dom.js";
import { icon } from "../../utils/icon.js";
import { createMenuSheet } from "./menu-sheet.js";

export function createHeader(palette = null) {
  // Search trigger: on desktop it shows the Ctrl+K affordance and opens
  // the command palette; on narrow screens it collapses to a bare icon
  // (the pill chrome comes back with the label at ≥720px — see navbar.css).
  const searchBtn = createEl("button", {
    type: "button",
    class: "ou-btn ou-navbar__search-trigger",
    "aria-label": palette ? "Open command palette (Ctrl+K)" : "Open search",
    on: {
      click: (e) => {
        if (palette) palette.open(e.currentTarget);
        else location.hash = "/search";
      },
    },
  }, [
    icon("magnifying-glass"),
    createEl("span", { class: "ou-navbar__search-label" }, ["Search"]),
    createEl("kbd", { class: "ou-navbar__kbd" }, ["Ctrl K"]),
  ]);

  // Menu trigger — rightmost action, right-side menu per the design brief.
  const menuTrigger = createEl("button", {
    type: "button",
    class: "ou-btn ou-btn--icon ou-btn--bare ou-navbar__menu-trigger",
    "aria-label": "Open menu",
    "aria-haspopup": "dialog",
    "aria-expanded": "false",
    "aria-controls": "ou-menu-sheet",
  }, [icon("bars")]);

  createMenuSheet(menuTrigger);

  return createEl("header", { class: "ou-navbar ou-app-shell__header" }, [
    createEl("a", { href: "#/", class: "ou-navbar__brand", translate: "no" }, [
      createEl("img", {
        src: "public/icons/icon-192.png", alt: "", class: "ou-navbar__logo",
        width: "32", height: "32",
        on: { error: (e) => { e.target.style.display = "none"; } },
      }),
      createEl("span", { class: "ou-navbar__brand-text" }, ["OpenKnowledge"]),
    ]),
    createEl("div", { class: "ou-navbar__actions" }, [
      searchBtn,
      menuTrigger,
    ]),
  ]);
}
