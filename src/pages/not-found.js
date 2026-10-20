// src/pages/not-found.js
import { createEl, mount } from "../utils/dom.js";
import { icon } from "../utils/icon.js";

export async function render(container) {
  document.title = "Page not found — OpenKnowledge";
  mount(container, createEl("div", { class: "ou-container ou-stack ou-empty-state" }, [
    icon("compass", { class: "ou-empty-state__icon" }),
    createEl("h1", {}, ["Page not found"]),
    createEl("p", { class: "ou-text-secondary" }, [
      "This page doesn't exist — it may have been moved, or the link is out of date.",
    ]),
    createEl("div", { class: "ou-cluster", style: "justify-content: center;" }, [
      createEl("a", { href: "#/", class: "ou-btn ou-btn--primary" }, [
        icon("house"), "Back to home",
      ]),
      createEl("a", { href: "#/search", class: "ou-btn ou-btn--secondary" }, [
        icon("magnifying-glass"), "Search a topic",
      ]),
      createEl("a", { href: "#/subjects", class: "ou-btn ou-btn--ghost" }, [
        icon("book-open"), "Browse subjects",
      ]),
    ]),
  ]));
}
