// src/components/account/account-settings.js
import { createEl } from "../../utils/dom.js";
import { updateLocalProfile } from "../../engines/account-engine.js";
import { showToast } from "../common/toast.js";

export function createAccountSettingsForm(profile) {
  const nameInput = createEl("input", {
    type: "text", name: "displayName", value: profile.displayName || "",
    "aria-label": "Display name", autocomplete: "name",
  });

  async function handleSubmit(e) {
    e.preventDefault();
    await updateLocalProfile({ displayName: nameInput.value.trim() });
    showToast("Profile updated", "success");
  }

  return createEl("form", { class: "ou-account-form", on: { submit: handleSubmit } }, [
    nameInput,
    createEl("button", { type: "submit", class: "ou-btn ou-btn--primary" }, ["Save"]),
  ]);
}
