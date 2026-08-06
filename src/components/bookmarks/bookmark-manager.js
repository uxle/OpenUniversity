// src/components/bookmarks/bookmark-manager.js — page-level composition.
import { createEl, empty } from "../../utils/dom.js";
import { groupByFolder } from "../../engines/bookmark-engine.js";
import { createBookmarkFolder } from "./bookmark-folder.js";

export async function createBookmarkManager() {
  const container = createEl("div", { class: "ou-stack" });
  const groups = await groupByFolder();
  empty(container);
  Object.entries(groups).forEach(([folder, bookmarks]) => {
    container.appendChild(createBookmarkFolder(folder, bookmarks));
  });
  return container;
}
