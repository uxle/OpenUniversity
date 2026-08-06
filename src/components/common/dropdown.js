// src/components/common/dropdown.js
import { createEl, on } from "../../utils/dom.js";

/** @param {{ label: string, items: { label: string, onSelect: Function }[] }} opts */
export function createDropdown({ label, items }) {
  const menu = createEl("div", { class: "ou-dropdown__menu", role: "menu", hidden: true },
    items.map((item) => createEl("button", {
      class: "ou-dropdown__item", role: "menuitem",
      on: { click: () => { item.onSelect(); close(); } },
    }, [item.label]))
  );

  function close() { menu.hidden = true; document.removeEventListener("click", onOutsideClick); }
  function onOutsideClick(event) { if (!wrapper.contains(event.target)) close(); }

  const trigger = createEl("button", {
    class: "ou-btn ou-btn--secondary", "aria-haspopup": "menu", "aria-expanded": "false",
    on: {
      click: () => {
        menu.hidden = !menu.hidden;
        trigger.setAttribute("aria-expanded", String(!menu.hidden));
        if (!menu.hidden) document.addEventListener("click", onOutsideClick);
      },
    },
  }, [label]);

  const wrapper = createEl("div", { class: "ou-dropdown" }, [trigger, menu]);
  return wrapper;
}
