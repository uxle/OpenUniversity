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
import { registerRoutes } from "./routes.js";
import { applyAccessibilitySettings } from "../accessibility/accessibility-settings.js";
import { setLocale } from "../i18n/i18n.js";
import { getPreference } from "../storage/user-storage.js";
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

  applyAccessibilitySettings();

  const theme = getPreference("theme", config.defaultTheme);
  document.documentElement.dataset.theme = theme;
  appStore.setState({ theme });

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

  log.info("OpenKnowledge app shell started");
}
