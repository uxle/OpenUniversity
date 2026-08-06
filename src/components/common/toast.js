// src/components/common/toast.js — subscribes to app-wide error events
// and renders transient notifications; also exposes showToast() for
// direct success/info use.

import { createEl } from "../../utils/dom.js";
import { icon } from "../../utils/icon.js";
import { eventBus } from "../../core/event-bus.js";
import { EVENTS } from "../../app/constants.js";

const TYPE_ICON = { info: "circle-info", success: "circle-check", warning: "triangle-exclamation", error: "circle-xmark" };

let region = null;

function ensureRegion() {
  if (region) return region;
  region = createEl("div", { class: "ou-toast-region", "aria-live": "polite" });
  document.body.appendChild(region);
  return region;
}

/** @param {string} message @param {"info"|"success"|"warning"|"error"} [type] */
export function showToast(message, type = "info", { duration = 4000 } = {}) {
  const el = ensureRegion();
  const toast = createEl("div", { class: ["ou-toast", `ou-toast--${type}`] }, [
    icon(TYPE_ICON[type] || TYPE_ICON.info),
    createEl("span", {}, [message]),
  ]);
  el.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
  return toast;
}

export function initErrorToasts() {
  eventBus.on(EVENTS.APP_ERROR, (payload) => {
    showToast(payload.message, payload.level === "warn" ? "warning" : "error");
  });
}
