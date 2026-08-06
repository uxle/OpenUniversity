// src/components/search/search-box.js
import { createEl } from "../../utils/dom.js";
import { icon } from "../../utils/icon.js";
import { debounce } from "../../utils/debounce.js";
import { addSearchHistoryEntry } from "./search-history.js";

/** @param {(query: string) => void} onSearch */
export function createSearchBox(onSearch, { debounceMs = 250 } = {}) {
  function runSearch(value) {
    if (value.trim()) addSearchHistoryEntry(value.trim());
    onSearch(value);
  }
  const debounced = debounce(runSearch, debounceMs);

  const input = createEl("input", {
    type: "search", placeholder: "Search lessons…", "aria-label": "Search lessons",
    autocomplete: "off", spellcheck: "true",
    on: {
      input: (e) => debounced(e.target.value),
      keydown: (e) => { if (e.key === "Enter") runSearch(e.target.value); },
    },
  });

  return createEl("div", { class: "ou-search-box" }, [icon("magnifying-glass"), input]);
}
