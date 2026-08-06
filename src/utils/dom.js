// src/utils/dom.js — small DOM helpers, no framework.

export function qs(selector, root = document) {
  return root.querySelector(selector);
}

export function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

/**
 * Create an element without innerHTML — avoids injection risk when any
 * text content comes from user data (notes, contributed content).
 * @param {string} tag
 * @param {object} [attrs] - attributes; `class` accepts a string or array; `on` accepts { eventName: handler }
 * @param {(Node|string)[]} [children]
 */
export function createEl(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") {
      el.className = Array.isArray(value) ? value.filter(Boolean).join(" ") : value;
    } else if (key === "on" && value && typeof value === "object") {
      for (const [evt, handler] of Object.entries(value)) el.addEventListener(evt, handler);
    } else if (key === "dataset" && value && typeof value === "object") {
      for (const [dk, dv] of Object.entries(value)) el.dataset[dk] = dv;
    } else if (value === false || value === null || value === undefined) {
      // skip
    } else if (key.startsWith("aria-") || key === "role" || key === "for" || key === "type" || key === "tabindex") {
      el.setAttribute(key, value);
    } else {
      el[key] = value;
    }
  }
  for (const child of [].concat(children)) {
    if (child === null || child === undefined || child === false) continue;
    el.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
  }
  return el;
}

export function on(el, event, handler, opts) {
  el.addEventListener(event, handler, opts);
  return () => el.removeEventListener(event, handler, opts);
}

export function off(el, event, handler, opts) {
  el.removeEventListener(event, handler, opts);
}

export function empty(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
  return el;
}

export function mount(container, el) {
  empty(container);
  container.appendChild(el);
  return container;
}
