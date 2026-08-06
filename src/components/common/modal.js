// src/components/common/modal.js
import { createEl } from "../../utils/dom.js";
import { icon } from "../../utils/icon.js";
import { trapFocus, saveFocus, restoreFocus } from "../../accessibility/focus-manager.js";

/** @param {{ title: string, content: Node|string, onClose?: Function, actions?: Node[] }} opts */
export function openModal({ title, content, onClose, actions = [] }) {
  saveFocus();
  const close = () => {
    releaseFocusTrap();
    overlay.remove();
    document.removeEventListener("keydown", onKeydown);
    restoreFocus();
    onClose?.();
  };
  const onKeydown = (event) => { if (event.key === "Escape") close(); };

  const dialog = createEl("div", { class: "ou-modal", role: "dialog", "aria-modal": "true", "aria-label": title }, [
    createEl("div", { class: "ou-modal__header" }, [
      createEl("h2", { class: "ou-modal__title" }, [title]),
      createEl("button", { class: "ou-btn ou-btn--icon", "aria-label": "Close", on: { click: close } }, [icon("xmark")]),
    ]),
    createEl("div", { class: "ou-modal__body" }, [content]),
    actions.length ? createEl("div", { class: "ou-modal__footer" }, actions) : null,
  ]);

  const overlay = createEl("div", { class: "ou-modal-overlay", on: { click: (e) => { if (e.target === overlay) close(); } } }, [dialog]);
  document.body.appendChild(overlay);
  document.addEventListener("keydown", onKeydown);
  const releaseFocusTrap = trapFocus(dialog);

  return { close };
}
