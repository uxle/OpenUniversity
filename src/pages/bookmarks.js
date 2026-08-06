// src/pages/bookmarks.js
import { createEl, mount } from "../utils/dom.js";
import { createBookmarkManager } from "../components/bookmarks/bookmark-manager.js";

export async function render(container) {
  document.title = "Bookmarks — OpenKnowledge";
  mount(container, createEl("div", { class: "ou-container ou-stack" }, [
    createEl("h1", {}, ["Bookmarks"]),
    await createBookmarkManager(),
  ]));
}
