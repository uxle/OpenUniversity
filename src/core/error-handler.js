// src/core/error-handler.js — central place errors flow through.
// Decoupled from UI: emits "app:error" on the shared event bus so any
// listener (e.g. components/common/toast.js) can react without this
// module importing UI code directly.

import { eventBus } from "./event-bus.js";
import { createLogger } from "./logger.js";

const log = createLogger("errors");

/**
 * @param {Error|string} error
 * @param {{ context?: string, silent?: boolean, level?: "warn"|"error" }} [opts]
 */
export function handleError(error, { context = "", silent = false, level = "error" } = {}) {
  const err = error instanceof Error ? error : new Error(String(error));
  log[level](context ? `${context}:` : "", err.message, err);
  if (!silent) {
    eventBus.emit("app:error", { message: err.message, context, level });
  }
  return err;
}

export function wrapAsync(fn, context) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      handleError(err, { context });
      return undefined;
    }
  };
}
