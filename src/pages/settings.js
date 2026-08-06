// src/pages/settings.js
import { createEl, mount } from "../utils/dom.js";
import { getLocalProfile } from "../engines/account-engine.js";
import { createAccountSettingsForm } from "../components/account/account-settings.js";
import { getAccessibilitySettings, setAccessibilitySetting } from "../accessibility/accessibility-settings.js";

export async function render(container) {
  document.title = "Settings — OpenKnowledge";
  const profile = await getLocalProfile();
  const a11y = getAccessibilitySettings();

  const reducedMotionToggle = createEl("label", { class: "ou-cluster" }, [
    createEl("input", {
      type: "checkbox", checked: !!a11y.reducedMotion,
      on: { change: (e) => setAccessibilitySetting("reducedMotion", e.target.checked) },
    }),
    "Reduce motion",
  ]);
  const highContrastToggle = createEl("label", { class: "ou-cluster" }, [
    createEl("input", {
      type: "checkbox", checked: !!a11y.highContrast,
      on: { change: (e) => setAccessibilitySetting("highContrast", e.target.checked) },
    }),
    "High contrast",
  ]);

  mount(container, createEl("div", { class: "ou-container ou-stack" }, [
    createEl("h1", {}, ["Settings"]),
    createAccountSettingsForm(profile),
    createEl("h2", {}, ["Accessibility"]),
    reducedMotionToggle,
    highContrastToggle,
  ]));
}
