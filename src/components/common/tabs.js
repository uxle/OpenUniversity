// src/components/common/tabs.js
import { createEl, empty } from "../../utils/dom.js";
import { uid } from "../../utils/ids.js";

/** @param {{ tabs: { label: string, render: (panel: HTMLElement) => void }[] }} opts */
export function createTabs({ tabs }) {
  const panel = createEl("div", { class: "ou-tabs__panel" });
  const groupId = uid("tabs");

  function select(index) {
    tabButtons.forEach((btn, i) => btn.setAttribute("aria-selected", String(i === index)));
    empty(panel);
    tabs[index].render(panel);
  }

  const tabButtons = tabs.map((tab, i) => createEl("button", {
    class: "ou-tabs__tab", role: "tab", "aria-selected": String(i === 0), id: `${groupId}-tab-${i}`,
    on: { click: () => select(i) },
  }, [tab.label]));

  const list = createEl("div", { class: "ou-tabs__list", role: "tablist" }, tabButtons);
  const wrapper = createEl("div", { class: "ou-tabs" }, [list, panel]);
  select(0);
  return wrapper;
}
