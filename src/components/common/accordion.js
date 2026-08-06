// src/components/common/accordion.js
import { createEl } from "../../utils/dom.js";

/** @param {{ items: { title: string, content: string|Node }[] }} opts */
export function createAccordion({ items }) {
  const sections = items.map(({ title, content }) => {
    const body = createEl("div", { class: "ou-accordion__body", hidden: true }, [content]);
    const button = createEl("button", {
      class: "ou-accordion__trigger", "aria-expanded": "false",
      on: { click: () => {
        const expanded = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", String(!expanded));
        body.hidden = expanded;
      } },
    }, [title]);
    return createEl("div", { class: "ou-accordion__item" }, [button, body]);
  });
  return createEl("div", { class: "ou-accordion" }, sections);
}
