// src/components/layout/menu-sheet.js — the app's single navigation menu,
// opened from the header's right-side bars button.
//
// Design contract (from the mobile UI/UX direction):
//   - FULL-SCREEN on phones/tablets: solid page background, zero blur,
//     zero transparency — content sits in a roomy single column with
//     large, calm tap rows.
//   - On desktop (≥900px) the same content becomes a right-side sheet
//     (fluid: adapts with the viewport, same component, no fork).
//   - The theme toggle sits in the sheet's top-right corner as a bare
//     icon — no circles anywhere (soft rounded squares only).
//   - Sections: primary destinations first, then secondary pages —
//     arrangement/hierarchy first, decoration last.
//
// Behavior: Escape closes, scrim closes (desktop), route change closes,
// body scroll locks while open, focus moves in on open and returns to
// the trigger on close, and the current route's row is highlighted.
import { createEl } from "../../utils/dom.js";
import { icon } from "../../utils/icon.js";
import { createThemeToggleButton } from "./theme-toggle.js";
import { eventBus } from "../../core/event-bus.js";
import { EVENTS } from "../../app/constants.js";

const PRIMARY_LINKS = [
  { label: "Home", path: "/", iconName: "house" },
  { label: "Subjects", path: "/subjects", iconName: "book-open" },
  { label: "Search", path: "/search", iconName: "magnifying-glass" },
  { label: "Progress", path: "/progress", iconName: "chart-line" },
];

const MORE_LINKS = [
  { label: "Bookmarks", path: "/bookmarks", iconName: "bookmark" },
  { label: "Notes", path: "/notes", iconName: "note-sticky" },
  { label: "Profile", path: "/profile", iconName: "user" },
  { label: "Settings", path: "/settings", iconName: "gear" },
  { label: "About", path: "/about", iconName: "circle-info" },
  { label: "Contribute", path: "/contribute", iconName: "code-branch" },
];

function currentPath() {
  // Router hashes look like "#/subjects/mathematics" or "" for home.
  const hash = location.hash.replace(/^#/, "");
  return hash === "" ? "/" : hash;
}

export function createMenuSheet(trigger) {
  const closeBtn = createEl("button", {
    type: "button",
    class: "ou-btn ou-btn--icon ou-btn--bare",
    "aria-label": "Close menu",
    dataset: { menuClose: "" },
  }, [icon("xmark")]);

  const bar = createEl("div", { class: "ou-menu__bar" }, [
    createEl("span", { class: "ou-menu__brand", "aria-hidden": "true" }, ["Menu"]),
    createEl("div", { class: "ou-menu__bar-actions" }, [
      createThemeToggleButton(),
      closeBtn,
    ]),
  ]);

  const sectionLabel = (text) => createEl("p", { class: "ou-menu__section-label" }, [text]);
  const row = ({ label, path, iconName }) => createEl("a", {
    href: `#${path}`,
    class: "ou-menu__link",
    dataset: { menuRoute: path },
    on: { click: () => close() },
  }, [
    icon(iconName),
    createEl("span", {}, [label]),
    icon("chevron-right", { class: "ou-menu__chev" }),
  ]);

  const nav = createEl("nav", { class: "ou-menu__nav", "aria-label": "Site menu" }, [
    sectionLabel("Menu"),
    ...PRIMARY_LINKS.map(row),
    sectionLabel("More"),
    ...MORE_LINKS.map(row),
  ]);

  const panel = createEl("div", { class: "ou-menu__panel" }, [bar, nav]);

  const overlay = createEl("div", {
    class: "ou-menu",
    id: "ou-menu-sheet",
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "Menu",
    hidden: true,
  }, [
    createEl("div", { class: "ou-menu__scrim", dataset: { menuClose: "" } }),
    panel,
  ]);

  function markCurrentRoute() {
    const path = currentPath();
    overlay.querySelectorAll(".ou-menu__link").forEach((link) => {
      if (link.dataset.menuRoute === path) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function onKeydown(event) {
    if (event.key === "Escape") { close(); return; }
    // Minimal focus wrap: keep Tab cycling inside the sheet while open.
    if (event.key !== "Tab") return;
    const focusables = panel.querySelectorAll("a[href], button:not([disabled])");
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  function open() {
    markCurrentRoute();
    overlay.hidden = false;
    document.body.classList.add("ou-menu-open");
    document.addEventListener("keydown", onKeydown);
    trigger.setAttribute("aria-expanded", "true");
    closeBtn.focus();
  }

  function close() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove("ou-menu-open");
    document.removeEventListener("keydown", onKeydown);
    trigger.setAttribute("aria-expanded", "false");
    // The header persists across routes; only <main> is replaced. Without
    // returning focus, keyboard users would be stranded after navigation.
    trigger.focus({ preventScroll: true });
  }

  overlay.addEventListener("click", (event) => {
    if (event.target.closest("[data-menu-close]")) close();
  });

  // Wire the header trigger here (the sheet owns its open/close state):
  // click toggles — open when closed, close when open.
  trigger.addEventListener("click", () => {
    if (overlay.hidden) open();
    else close();
  });

  // The header persists across route changes — never let the sheet stay
  // open over the next page (same failure mode the old dropdown had).
  eventBus.on(EVENTS.ROUTE_CHANGED, close);

  // Append to <body>, not the header: the sticky header creates its own
  // stacking context (z 200), which would pin the sheet UNDER the bottom
  // nav (same z, later DOM order). At body level the sheet's z-modal wins.
  document.body.appendChild(overlay);

  return { overlay, open, close };
}
