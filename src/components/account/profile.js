// src/components/account/profile.js — local-only profile display (see
// engines/account-engine.js: no auth backend exists yet).
import { createEl } from "../../utils/dom.js";
import { getLocalProfile } from "../../engines/account-engine.js";

export async function createProfileView() {
  const profile = await getLocalProfile();
  return createEl("div", { class: "ou-profile-header" }, [
    createEl("div", { class: "ou-stack" }, [
      createEl("h2", {}, [profile.displayName || "Anonymous learner"]),
      createEl("p", { class: "ou-text-sm" }, ["Local profile — not synced to any account yet."]),
    ]),
  ]);
}
