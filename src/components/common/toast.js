// src/components/common/toast.js — subscribes to app-wide error events
// and renders transient notifications; also exposes showToast() for
// direct success/info use.

import { createEl } from "../../utils/dom.js";
import { icon } from "../../utils/icon.js";
import { eventBus } from "../../core/event-bus.js";
import { EVENTS } from "../../app/constants.js";

const TYPE_ICON = {
  info: "circle-info",
  success: "circle-check",
  warning: "triangle-exclamation",
  error: "circle-xmark",
};

let region = null;

function ensureRegion() {
  if (region) return region;
  region = createEl("div", { class: "ou-toast-region", "aria-live": "polite", "aria-atomic": "false" });
  document.body.appendChild(region);
  return region;
}

/**
 * Removes a toast with an exit animation before destroying the element.
 * @param {HTMLElement} toastEl
 */
function dismissToast(toastEl) {
  if (toastEl.dataset.dismissing) return;
  toastEl.dataset.dismissing = "1";
  toastEl.classList.add("ou-toast--exiting");
  // Wait for the CSS exit animation to complete before removing
  toastEl.addEventListener("animationend", () => toastEl.remove(), { once: true });
  // Fallback: remove after 500ms even if animationend doesn't fire
  setTimeout(() => toastEl.remove(), 500);
}

/**
 * Show a toast notification.
 * @param {string} message
 * @param {"info"|"success"|"warning"|"error"} [type]
 * @param {{ duration?: number, title?: string }} [options]
 * @returns {HTMLElement} The toast element
 */
export function showToast(message, type = "info", { duration = 4000, title = "" } = {}) {
  const el = ensureRegion();

  const children = [
    icon(TYPE_ICON[type] || TYPE_ICON.info),
  ];

  // Optional title + message layout
  if (title) {
    children.push(
      createEl("div", { class: "ou-toast__body" }, [
        createEl("div", { class: "ou-toast__title" }, [title]),
        createEl("div", { class: "ou-toast__message" }, [message]),
      ])
    );
  } else {
    children.push(createEl("span", { class: "ou-toast__message" }, [message]));
  }

  const progressBar = createEl("div", { class: "ou-toast__progress" });
  // CSS animation duration must match JS duration
  progressBar.style.setProperty("--ou-toast-duration", `${duration}ms`);

  const toast = createEl("div", {
    class: ["ou-toast", `ou-toast--${type}`],
    role: "status",
  }, [...children, progressBar]);

  el.appendChild(toast);

  // Auto-dismiss with exit animation
  const timer = setTimeout(() => dismissToast(toast), duration);

  // Allow manual dismiss on click
  toast.addEventListener("click", () => {
    clearTimeout(timer);
    dismissToast(toast);
  });

  return toast;
}

export function initErrorToasts() {
  eventBus.on(EVENTS.APP_ERROR, (payload) => {
    showToast(payload.message, payload.level === "warn" ? "warning" : "error");
  });
}
