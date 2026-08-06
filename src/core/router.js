// src/core/router.js — minimal hash-based router. Hash routing needs no
// server rewrite rules, which keeps the "no backend required" goal intact
// for static hosting.

import { createLogger } from "./logger.js";
import { eventBus } from "./event-bus.js";

const log = createLogger("router");

export function createRouter() {
  const routes = []; // { pattern: RegExp, keys: string[], handler: fn }
  let notFoundHandler = null;
  let currentUnlisten = null;

  function compile(pattern) {
    const keys = [];
    const regexSource = pattern
      .replace(/\/:([a-zA-Z0-9_]+)/g, (_, key) => {
        keys.push(key);
        return "/([^/]+)";
      });
    return { regex: new RegExp(`^${regexSource}$`), keys };
  }

  function register(pattern, handler) {
    const { regex, keys } = compile(pattern);
    routes.push({ regex, keys, handler });
  }

  function notFound(handler) {
    notFoundHandler = handler;
  }

  function currentPath() {
    return (location.hash || "#/").slice(1) || "/";
  }

  function resolve(path = currentPath()) {
    const [pathname] = path.split("?");
    for (const route of routes) {
      const match = pathname.match(route.regex);
      if (match) {
        const params = {};
        route.keys.forEach((key, i) => { params[key] = decodeURIComponent(match[i + 1]); });
        return { handler: route.handler, params };
      }
    }
    return notFoundHandler ? { handler: notFoundHandler, params: {} } : null;
  }

  function dispatch() {
    const result = resolve();
    if (!result) {
      log.warn(`no route matched: ${currentPath()}`);
      return;
    }
    result.handler(result.params);
    // String literal (not importing app/constants.js's EVENTS here) to
    // keep core/ from depending on app/ — must stay in sync with
    // EVENTS.ROUTE_CHANGED ("route:changed").
    eventBus.emit("route:changed", { path: currentPath() });
  }

  function start() {
    dispatch();
    const listener = () => dispatch();
    window.addEventListener("hashchange", listener);
    currentUnlisten = () => window.removeEventListener("hashchange", listener);
  }

  function stop() {
    currentUnlisten?.();
  }

  function navigate(path) {
    location.hash = path.startsWith("/") ? path : `/${path}`;
  }

  return { register, notFound, start, stop, navigate, currentPath, resolve };
}

export const router = createRouter();
