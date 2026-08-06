// src/pages/about.js
import { createEl, mount } from "../utils/dom.js";

export async function render(container) {
  document.title = "About — OpenKnowledge";
  mount(container, createEl("div", { class: "ou-container ou-stack" }, [
    createEl("h1", {}, ["About OpenKnowledge"]),
    createEl("p", {}, ["An open-source, text-first education platform. No video courses required."]),
    createEl("a", { href: "https://github.com/uxle/OpenUniversity", class: "ou-link" }, ["View source on GitHub"]),
  ]));
}
