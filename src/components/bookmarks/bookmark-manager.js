// src/components/bookmarks/bookmark-manager.js — page-level composition.
import { createEl, empty } from "../../utils/dom.js";
import { groupByFolder } from "../../engines/bookmark-engine.js";
import { createBookmarkFolder } from "./bookmark-folder.js";
import { createEmptyState } from "../common/empty-state.js";

export async function createBookmarkManager() {
  const container = createEl("div", { class: "ou-stack" });
  const groups = await groupByFolder();
  empty(container);
  // With no bookmarks the page used to render nothing but the "Bookmarks"
  // heading — a dead end with no hint about how bookmarks get created.
  // The lesson page's bookmark button is the only entry point, so point
  // learners back at their subjects and mention the icon to look for.
  const entries = Object.entries(groups);
  if (!entries.length) {
    return createEmptyState({
      message: "No bookmarks yet. Open any lesson and tap the bookmark icon to save it here for quick access.",
      iconName: "bookmark",
      actionLabel: "Browse subjects",
      onAction: () => { location.hash = "/subjects"; },
    });
  }
  entries.forEach(([folder, bookmarks]) => {
    container.appendChild(createBookmarkFolder(folder, bookmarks));
  });
  return container;
}
