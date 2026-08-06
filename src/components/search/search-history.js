// src/components/search/search-history.js — recent searches, local-only.
import { createEl } from "../../utils/dom.js";
import { getItem, setItem } from "../../storage/local-storage.js";

const KEY = "search-history";
const MAX_ENTRIES = 10;

export function getSearchHistory() {
  return getItem(KEY, []);
}

export function addSearchHistoryEntry(query) {
  const history = [query, ...getSearchHistory().filter((q) => q !== query)].slice(0, MAX_ENTRIES);
  setItem(KEY, history);
  return history;
}

export function createSearchHistoryList(onSelect) {
  const history = getSearchHistory();
  if (!history.length) return createEl("div");
  return createEl("div", { class: "ou-cluster" }, history.map((q) =>
    createEl("button", { class: "ou-btn ou-btn--sm ou-btn--secondary", on: { click: () => onSelect(q) } }, [q])
  ));
}
