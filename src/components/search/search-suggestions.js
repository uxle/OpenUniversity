// src/components/search/search-suggestions.js — prefix suggestions drawn
// from recent search history (a full typeahead index isn't built yet).
import { createEl } from "../../utils/dom.js";
import { getSearchHistory } from "./search-history.js";

export function getSuggestions(prefix, limit = 5) {
  const lower = prefix.toLowerCase();
  if (!lower) return [];
  return getSearchHistory().filter((q) => q.toLowerCase().startsWith(lower)).slice(0, limit);
}

export function createSuggestionsList(prefix, onSelect) {
  const suggestions = getSuggestions(prefix);
  return createEl("ul", { role: "list" }, suggestions.map((s) =>
    createEl("li", {}, [createEl("button", { class: "ou-dropdown__item", on: { click: () => onSelect(s) } }, [s])])
  ));
}
