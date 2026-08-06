// src/accessibility/focus-manager.js — focus save/restore for modals & routing.

import { getFocusable } from "../utils/accessibility.js";

const focusStack = [];

export function saveFocus() {
  focusStack.push(document.activeElement);
}

export function restoreFocus() {
  const el = focusStack.pop();
  if (el && typeof el.focus === "function") el.focus();
}

export function focusFirst(container) {
  const [first] = getFocusable(container);
  first?.focus();
}

/** Basic focus trap for modal dialogs; returns a cleanup function. */
export function trapFocus(container) {
  function handleKeydown(event) {
    if (event.key !== "Tab") return;
    const focusable = getFocusable(container);
    if (focusable.length === 0) return;
    const [first] = focusable;
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  container.addEventListener("keydown", handleKeydown);
  focusFirst(container);
  return () => container.removeEventListener("keydown", handleKeydown);
}
