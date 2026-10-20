// src/app/bootstrap.js — builds the persistent app shell (header, route
// outlet, bottom nav) once, then hands the route outlet to the router so
// only that region re-renders on navigation. No sidebar — see layout.css
// for why (a real mobile bug report traced back to that complexity).

import { router } from "../core/router.js";
import { eventBus } from "../core/event-bus.js";
import { handleError } from "../core/error-handler.js";
import { createLogger, setLogLevel } from "../core/logger.js";
import { createEl, mount } from "../utils/dom.js";
import { markActiveNavLink } from "../utils/active-nav.js";
import { config } from "./config.js";
import { appStore } from "./state.js";
import { EVENTS } from "./constants.js";
import { registerRoutes, prefetchPrimaryRoutes } from "./routes.js";
import { applyAccessibilitySettings } from "../accessibility/accessibility-settings.js";
import { setLocale } from "../i18n/i18n.js";
import { getPreference, setPreference } from "../storage/user-storage.js";
import { createHeader } from "../components/layout/header.js";
import { createFooter } from "../components/layout/footer.js";
import { createMobileNavigation } from "../components/layout/mobile-navigation.js";
import { initErrorToasts } from "../components/common/toast.js";

const log = createLogger("bootstrap");

export async function startApp(containerSelector = "#app") {
  if (config.debug) setLogLevel("debug");

  const root = document.querySelector(containerSelector);
  if (!root) {
    handleError(new Error(`startApp: no element matches "${containerSelector}"`));
    return;
  }

  const theme = resolveInitialTheme();
  document.documentElement.dataset.theme = theme;
  appStore.setState({ theme });
  // Applied AFTER the stored theme is on <html>: high-contrast layers on
  // top of that base and must see it (see accessibility-settings.js).
  applyAccessibilitySettings();
  applyThemeColorMeta(theme);

  await setLocale(getPreference("locale", config.defaultLocale));

  initErrorToasts();
  eventBus.on(EVENTS.APP_ERROR, (payload) => log.error("app:error", payload));

  const outlet = createEl("main", { class: "ou-app-shell__main", id: "route-outlet", tabindex: "-1" });
  const bottomNav = createMobileNavigation();
  const shell = createEl("div", { class: "ou-app-shell" }, [
    createEl("a", { href: "#route-outlet", class: "ou-skip-link" }, ["Skip to content"]),
    createHeader(),
    outlet,
    createFooter(),
    bottomNav,
  ]);
  mount(root, shell);

  eventBus.on(EVENTS.ROUTE_CHANGED, ({ path }) => {
    outlet.focus();
    markActiveNavLink(bottomNav, path);
  });
  markActiveNavLink(bottomNav, router.currentPath());

  await registerRoutes(router, outlet);
  router.start();

  prefetchShellData();
  registerSearchShortcut();
  watchSystemTheme();
  registerServiceWorker();

  log.info("OpenKnowledge app shell started");
}

/**
 * Initial theme: stored preference → system preference → config default.
 * First-time visitors with a dark OS used to get a blinding white page
 * despite <meta name="color-scheme"> advertising light dark support.
 * The stored value stays authoritative once the user has toggled.
 */
function resolveInitialTheme() {
  const stored = getPreference("theme", null);
  if (stored === "light" || stored === "dark") return stored;
  if (typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return config.defaultTheme;
}

/**
 * Follow OS-level theme changes live, but only while the user hasn't
 * chosen an explicit theme themselves (stored preference wins forever
 * after the first manual toggle).
 */
function watchSystemTheme() {
  if (typeof window.matchMedia !== "function") return;
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onChange = (event) => {
    if (getPreference("theme", null) !== null) return;
    const next = event.matches ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    appStore.setState({ theme: next });
    applyAccessibilitySettings();
    applyThemeColorMeta(next);
  };
  media.addEventListener?.("change", onChange);
}

/** Keep the browser chrome / taskbar tint in sync with the active theme. */
function applyThemeColorMeta(theme) {
  const meta = document.getElementById("theme-color-meta");
  if (meta) meta.content = theme === "dark" ? "#000000" : "#fbfbfd";
}

/**
 * "/" focuses search from anywhere (GitHub-style). Guards against firing
 * while typing in any editable field. If we're not on the search page
 * yet, navigate there first, then focus the box once it renders (the
 * page module loads async, so poll briefly rather than assume).
 */
function registerSearchShortcut() {
  document.addEventListener("keydown", (event) => {
    if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
    const target = event.target;
    if (target instanceof Element && target.closest("input, textarea, select, [contenteditable]")) return;
    event.preventDefault();
    if (!router.currentPath().startsWith("/search")) {
      location.hash = "/search";
    }
    focusSearchBoxWhenReady();
  });
}

function focusSearchBoxWhenReady(attemptsLeft = 20) {
  const input = document.querySelector(".ou-search-box input[type='search']");
  if (input) {
    input.focus();
    return;
  }
  if (attemptsLeft > 0) {
    setTimeout(() => focusSearchBoxWhenReady(attemptsLeft - 1), 100);
  }
}

/**
 * Offline support (see sw.js at the repo root). Registered only over
 * http(s): the site also supports file:// runs from an unzipped
 * download, where service workers don't exist — register() would throw.
 * Fires after the shell is up so a slow SW install never delays paint.
 */
function registerServiceWorker() {
  if (!location.protocol.startsWith("http") || !("serviceWorker" in navigator)) return;
  const registerNow = () => {
    navigator.serviceWorker.register("./sw.js").then((registration) => {
      // Let the user know a freshly deployed version is ready instead
      // of it silently waiting for every tab to be closed.
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        worker?.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            import("../components/common/toast.js")
              .then(({ showToast }) => showToast("A new version is available — refresh to update.", "info"))
              .catch(() => {});
          }
        });
      });
    }).catch((err) => {
      log.warn(`service worker registration failed: ${err.message}`);
    });
  };
  // startApp is async (awaits locale/IDB setup), so the load event can
  // already be in the past by the time we get here — a bare addEventListener
  // would then never fire and the SW would never register.
  if (document.readyState === "complete") {
    registerNow();
  } else {
    window.addEventListener("load", registerNow);
  }
}

/**
 * Warm the caches the first navigation will hit, while the shell paints.
 * The primary-nav page modules are dynamic imports — the first click on
 * a nav tab otherwise pays the full module fetch before anything renders
 * (the "laggy first tap" feel). This runs during idle time, after the
 * initial render, so it never competes with real work.
 */
function prefetchShellData() {
  if (typeof window === "undefined") return;
  const warm = () => {
    prefetchPrimaryRoutes();
    // The search index (~270 KB, memory-cached by search-service once
    // loaded) is hit the moment the user opens Search or types a query;
    // warming it during idle makes the first search instantaneous
    // instead of a visible round-trip pause.
    import("../services/search-service.js")
      .then((m) => m.warmSearchIndex?.())
      .catch(() => {});
  };
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(warm, { timeout: 2000 });
  } else {
    window.setTimeout(warm, 0);
  }
}
