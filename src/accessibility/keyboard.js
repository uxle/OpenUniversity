// src/accessibility/keyboard.js — global shortcuts + roving tabindex.

const shortcuts = new Map(); // "ctrl+k" -> handler
let listening = false;

function normalizeCombo(event) {
  const parts = [];
  if (event.ctrlKey || event.metaKey) parts.push("ctrl");
  if (event.shiftKey) parts.push("shift");
  if (event.altKey) parts.push("alt");
  parts.push(event.key.toLowerCase());
  return parts.join("+");
}

function handleKeydown(event) {
  const handler = shortcuts.get(normalizeCombo(event));
  if (handler) {
    event.preventDefault();
    handler(event);
  }
}

/** @param {string} combo e.g. "ctrl+k" @param {(e: KeyboardEvent) => void} handler */
export function registerShortcut(combo, handler) {
  if (!listening) {
    document.addEventListener("keydown", handleKeydown);
    listening = true;
  }
  shortcuts.set(combo.toLowerCase(), handler);
  return () => shortcuts.delete(combo.toLowerCase());
}

/** Arrow-key navigation within a group of items (e.g. MCQ options, tabs). */
export function rovingTabIndex(container, itemSelector) {
  function items() {
    return Array.from(container.querySelectorAll(itemSelector));
  }
  container.addEventListener("keydown", (event) => {
    if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(event.key)) return;
    const list = items();
    const currentIndex = list.indexOf(document.activeElement);
    if (currentIndex === -1) return;
    event.preventDefault();
    const delta = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (currentIndex + delta + list.length) % list.length;
    list[nextIndex].focus();
  });
}
