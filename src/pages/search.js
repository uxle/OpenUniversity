// src/pages/search.js
import { createEl, mount, empty } from "../utils/dom.js";
import { search } from "../engines/search-engine.js";
import { listSubjects } from "../engines/subject-engine.js";
import { createSearchBox } from "../components/search/search-box.js";
import { createSearchFilters } from "../components/search/search-filters.js";
import { createSearchResults } from "../components/search/search-results.js";
import { createSearchHistoryList } from "../components/search/search-history.js";

export async function render(container) {
  document.title = "Search — OpenKnowledge";
  const resultsEl = createEl("div");
  let activeSubject = null;
  let lastQuery = "";

  async function runSearch(query) {
    lastQuery = query;
    const results = await search(query);
    const filtered = activeSubject ? results.filter((r) => r.subjectId === activeSubject) : results;
    empty(resultsEl);
    resultsEl.appendChild(createSearchResults(filtered));
  }

  const box = createSearchBox(runSearch);
  const subjects = await listSubjects().catch(() => []);
  const filters = createSearchFilters(subjects, (subjectId) => { activeSubject = subjectId; runSearch(lastQuery); });
  const history = createSearchHistoryList((q) => runSearch(q));

  mount(container, createEl("div", { class: "ou-container ou-stack" }, [
    createEl("h1", {}, ["Search"]),
    box, filters, history, resultsEl,
  ]));
}
