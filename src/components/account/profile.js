// src/components/account/profile.js — local-only profile display (see
// engines/account-engine.js: no auth backend exists yet).
import { createEl } from "../../utils/dom.js";
import { getLocalProfile } from "../../engines/account-engine.js";
import { icon } from "../../utils/icon.js";

/** Up to two initials from a display name ("Asha K." → "AK"). */
function initialsOf(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export async function createProfileView() {
  const profile = await getLocalProfile();
  const name = profile.displayName || "";
  // Empty name → generic person glyph so the avatar never renders as an
  // empty blue circle.
  const avatarContent = initialsOf(name) || icon("user", { label: "Anonymous learner" });

  return createEl("div", { class: "ou-profile-header" }, [
    createEl("div", { class: "ou-profile-avatar", "aria-hidden": "true" }, [avatarContent]),
    createEl("div", { class: "ou-stack" }, [
      createEl("h2", { style: "margin: 0;" }, [name || "Anonymous learner"]),
      createEl("p", { class: "ou-text-sm ou-text-secondary" }, ["Local profile — not synced to any account yet."]),
    ]),
  ]);
}
