// src/components/account/login-form.js — UI placeholder for Phase 8.
// There is no auth backend to submit to yet; the form renders and
// validates locally but explains that sign-in isn't wired up.
import { createEl } from "../../utils/dom.js";
import { accountsBackendAvailable } from "../../engines/account-engine.js";
import { showToast } from "../common/toast.js";

export function createLoginForm() {
  const email = createEl("input", {
    type: "email", name: "email", placeholder: "Email…", "aria-label": "Email",
    autocomplete: "email", inputmode: "email", spellcheck: "false", required: true,
  });
  const password = createEl("input", {
    type: "password", name: "password", placeholder: "Password…", "aria-label": "Password",
    autocomplete: "current-password", required: true,
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!accountsBackendAvailable()) {
      showToast("Accounts aren't available yet — this build is offline-only.", "info");
      return;
    }
  }

  return createEl("form", { class: "ou-account-form", on: { submit: handleSubmit } }, [
    email, password,
    createEl("button", { type: "submit", class: "ou-btn ou-btn--primary" }, ["Sign in"]),
    createEl("p", { class: "ou-text-sm" }, ["No account system exists yet — see README Phase 8."]),
  ]);
}
