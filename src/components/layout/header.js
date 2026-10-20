// src/components/layout/header.js — minimal sticky header: brand + a
// palette/search trigger + a "more" menu for secondary pages + theme
// toggle. Primary navigation (Home/Subjects/Search/Progress) lives in
// the bottom nav at every screen width — see
// components/layout/mobile-navigation.js — so the header only ever holds
// small icon buttons and can't overflow.
import { createEl } from "../../utils/dom.js";
import { icon } from "../../utils/icon.js";
import { currentTheme, toggleTheme } from "../../utils/theme.js";
import { eventBus } from "../../core/event-bus.js";
import { EVENTS } from "../../app/constants.js";

const THEME_ICON = { light: "sun", dark: "moon" };

function createThemeToggle() {
  // Inline SVG icons are swapped by re-rendering, not className (the old
  // `fa-solid fa-…` class shuffle died with the FA dependency).
  const iconEl = icon(THEME_ICON[currentTheme()]);
  return createEl("button", {
    class: "ou-btn ou-btn--icon ou-btn--secondary",
    type: "button",
    "aria-label": "Toggle dark mode",
    on: {
      click: () => {
        iconEl.replaceWith(icon(THEME_ICON[toggleTheme()]));
      },
    },
  }, [iconEl]);
}

const MORE_LINKS = [
  { href: "#/bookmarks", label: "Bookmarks", iconName: "bookmark" },
  { href: "#/notes", label: "Notes", iconName: "note-sticky" },
  { href: "#/profile", label: "Profile", iconName: "user" },
  { href: "#/settings", label: "Settings", iconName: "gear" },
  { href: "#/about", label: "About", iconName: "circle-info" },
  { href: "#/contribute", label: "Contribute", iconName: "code-branch" },
];

function createMoreMenu() {
  const menu = createEl("div", { class: "ou-dropdown__menu", role: "menu", hidden: true },
    MORE_LINKS.map((item) => createEl("a", {
      href: item.href, class: "ou-dropdown__item", role: "menuitem",
      on: { click: close },
    }, [icon(item.iconName), createEl("span", {}, [item.label])]))
  );

  function close() { menu.hidden = true; trigger.setAttribute("aria-expanded", "false"); document.removeEventListener("click", onOutsideClick); }
  function onOutsideClick(event) { if (!wrapper.contains(event.target)) close(); }

  // The header persists across route changes (only <main> is replaced),
  // so without this the menu could stay open, sitting on top of whatever
  // page loads next and silently blocking clicks there. Found exactly
  // this way in testing — a "later" click failing for no visible reason.
  eventBus.on(EVENTS.ROUTE_CHANGED, close);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  const trigger = createEl("button", {
    type: "button", class: "ou-btn ou-btn--icon ou-btn--secondary",
    "aria-haspopup": "menu", "aria-expanded": "false", "aria-label": "More",
    on: {
      click: () => {
        const opening = menu.hidden;
        menu.hidden = !opening;
        trigger.setAttribute("aria-expanded", String(opening));
        if (opening) document.addEventListener("click", onOutsideClick);
      },
    },
  }, [icon("ellipsis")]);

  const wrapper = createEl("div", { class: "ou-dropdown" }, [trigger, menu]);
  return wrapper;
}

export function createHeader(palette = null) {
  // Search trigger: on desktop it shows the Ctrl+K affordance and opens
  // the command palette; on narrow screens it collapses to an icon (the
  // full Search page stays available from the bottom nav either way).
  const searchBtn = createEl("button", {
    type: "button",
    class: "ou-btn ou-btn--secondary ou-navbar__search-trigger",
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
      createMoreMenu(),
      createThemeToggle(),
    ]),
  ]);
}
