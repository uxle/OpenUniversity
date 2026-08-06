// src/components/bookmarks/bookmark-folder.js
import { createEl } from "../../utils/dom.js";
import { createBookmarkList } from "./bookmark-list.js";

export function createBookmarkFolder(name, bookmarks) {
  return createEl("div", { class: "ou-stack" }, [
    createEl("h3", {}, [name]),
    createBookmarkList(bookmarks),
  ]);
}
