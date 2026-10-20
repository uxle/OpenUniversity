// src/components/account/account-settings.js
import { createEl } from "../../utils/dom.js";
import { updateLocalProfile } from "../../engines/account-engine.js";
import { showToast } from "../common/toast.js";

export function createAccountSettingsForm(profile) {
  // A visible <label> wrapping the input (click-to-focus included), plus
  // a hint line. Previously the field had only an aria-label, which
  // rendered as a bare, apparently-purposeless empty textbox on the
  // Settings page — first-time users had no idea what to type into it.
  const nameInput = createEl("input", {
    type: "text", name: "displayName", value: profile.displayName || "",
    id: "account-display-name", autocomplete: "name",
    placeholder: "e.g. Asha K.",
  });

  async function handleSubmit(e) {
    e.preventDefault();
    await updateLocalProfile({ displayName: nameInput.value.trim() });
    showToast("Profile updated", "success");
  }

  return createEl("form", { class: "ou-account-form", on: { submit: handleSubmit } }, [
    createEl("h2", {}, ["Profile"]),
    createEl("label", { class: "ou-form-field", for: "account-display-name" }, [
      createEl("span", { class: "ou-form-field__label" }, ["Display name"]),
      nameInput,
      createEl("span", { class: "ou-form-field__hint" }, [
        "Stored only on this device. Used to greet you — nothing is synced anywhere.",
      ]),
    ]),
    createEl("button", { type: "submit", class: "ou-btn ou-btn--primary" }, ["Save"]),
  ]);
}
