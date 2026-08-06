// src/components/common/dialog.js — confirm/alert built on top of modal.js
import { createEl } from "../../utils/dom.js";
import { openModal } from "./modal.js";
import { createButton } from "./button.js";

export function confirmDialog({ title = "Are you sure?", message, confirmLabel = "Confirm", cancelLabel = "Cancel" }) {
  return new Promise((resolve) => {
    let settled = false;
    const settle = (value) => { if (!settled) { settled = true; resolve(value); modal.close(); } };
    const modal = openModal({
      title,
      content: createEl("p", {}, [message]),
      onClose: () => settle(false),
      actions: [
        createButton({ label: cancelLabel, variant: "secondary", onClick: () => settle(false) }),
        createButton({ label: confirmLabel, variant: "danger", onClick: () => settle(true) }),
      ],
    });
  });
}

export function alertDialog({ title = "Notice", message }) {
  return new Promise((resolve) => {
    const modal = openModal({
      title,
      content: createEl("p", {}, [message]),
      onClose: resolve,
      actions: [],
    });
    modal.actions = [];
  });
}
