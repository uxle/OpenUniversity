// src/app/routes.js — maps ROUTES patterns to page render functions.
//
// Each page module is imported lazily, on first navigation to its route
// — not eagerly at startup. Two reasons: (1) performance, no reason to
// fetch all 15 page bundles before the user sees anything; (2) isolation
// — if one page module (or something it imports) 404s or throws, only
// that route shows an error instead of crashing the entire app's startup.
// (Previously all 15 were imported via one Promise.all awaited in
// bootstrap.js — a single missing/broken file failed that whole
// Promise.all, which crashed startApp() itself, taking down navigation,
// the header, everything. Found via a real 404 in the field.)

import { ROUTES } from "./constants.js";
import { createEl, mount } from "../utils/dom.js";
import { handleError } from "../core/error-handler.js";

const routeTable = {
  [ROUTES.HOME]: () => import("../pages/home.js"),
  [ROUTES.SUBJECTS]: () => import("../pages/subjects.js"),
  [ROUTES.SUBJECT]: () => import("../pages/subject.js"),
  [ROUTES.SUB_SUBJECT]: () => import("../pages/sub-subject.js"),
  [ROUTES.LESSON]: () => import("../pages/lesson.js"),
  [ROUTES.MCQ]: () => import("../pages/mcq.js"),
  [ROUTES.SEARCH]: () => import("../pages/search.js"),
  [ROUTES.BOOKMARKS]: () => import("../pages/bookmarks.js"),
  [ROUTES.NOTES]: () => import("../pages/notes.js"),
  [ROUTES.PROGRESS]: () => import("../pages/progress.js"),
  [ROUTES.PROFILE]: () => import("../pages/profile.js"),
  [ROUTES.SETTINGS]: () => import("../pages/settings.js"),
  [ROUTES.ABOUT]: () => import("../pages/about.js"),
  [ROUTES.CONTRIBUTE]: () => import("../pages/contribute.js"),
};

function renderLoadError(container, pattern, err) {
  handleError(err, { context: `route ${pattern}`, silent: true });
  mount(container, createEl("div", { class: "ou-container ou-stack ou-empty-state" }, [
    createEl("h1", {}, ["This page couldn't load"]),
    createEl("p", { class: "ou-text-secondary" }, [
      `${pattern} failed to load (${err.message}). If you just downloaded/updated `,
      "the site, this usually means the extraction was incomplete — try re-downloading ",
      "and extracting fresh (delete the old folder first rather than merging).",
    ]),
    createEl("a", { href: "#/", class: "ou-link" }, ["Back to home"]),
  ]));
}

export async function registerRoutes(router, container) {
  for (const [pattern, loadModule] of Object.entries(routeTable)) {
    router.register(pattern, async (params) => {
      try {
        const { render } = await loadModule();
        await render(container, params);
      } catch (err) {
        renderLoadError(container, pattern, err);
      }
    });
  }

  router.notFound(async (params) => {
    try {
      const { render } = await import("../pages/not-found.js");
      await render(container, params);
    } catch (err) {
      renderLoadError(container, "not-found", err);
    }
  });
}
