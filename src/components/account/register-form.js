// src/components/account/register-form.js — same caveat as login-form.js.
import { createEl } from "../../utils/dom.js";
import { accountsBackendAvailable } from "../../engines/account-engine.js";
import { showToast } from "../common/toast.js";

export function createRegisterForm() {
  const name = createEl("input", {
    type: "text", name: "name", placeholder: "Display name", "aria-label": "Display name",
    autocomplete: "name",
  });
  const email = createEl("input", {
    type: "email", name: "email", placeholder: "Email…", "aria-label": "Email",
    autocomplete: "email", inputmode: "email", spellcheck: "false", required: true,
  });
  const password = createEl("input", {
    type: "password", name: "password", placeholder: "Password…", "aria-label": "Password",
    autocomplete: "new-password", required: true,
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!accountsBackendAvailable()) {
      showToast("Accounts aren't available yet — try Settings to set a local display name instead.", "info");
      return;
    }
  }

  return createEl("form", { class: "ou-account-form", on: { submit: handleSubmit } }, [
    name, email, password,
    createEl("button", { type: "submit", class: "ou-btn ou-btn--primary" }, ["Create account"]),
  ]);
}
