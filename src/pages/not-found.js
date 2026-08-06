// src/pages/not-found.js
import { createEl, mount } from "../utils/dom.js";
import { icon } from "../utils/icon.js";

export async function render(container) {
  document.title = "Page not found — OpenKnowledge";
  mount(container, createEl("div", { class: "ou-container ou-stack ou-empty-state" }, [
    icon("compass", { class: "ou-empty-state__icon" }),
    createEl("h1", {}, ["404"]),
    createEl("p", {}, ["This page doesn't exist yet."]),
    createEl("a", { href: "#/", class: "ou-link" }, ["Back to home"]),
  ]));
}
