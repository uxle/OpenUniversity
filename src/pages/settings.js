// src/pages/settings.js
import { createEl, mount } from "../utils/dom.js";
import { getLocalProfile } from "../engines/account-engine.js";
import { createAccountSettingsForm } from "../components/account/account-settings.js";
import { getAccessibilitySettings, setAccessibilitySetting } from "../accessibility/accessibility-settings.js";

// v2: each concern is one card (common region) and each toggle states what
// it does in one line, so nobody has to try it to find out (recognition
// over recall). Labels, controls and settings keys are unchanged.
function createToggle({ label, hint, checked, onChange }) {
  return createEl("label", { class: "ou-settings-toggle" }, [
    createEl("input", { type: "checkbox", checked: !!checked, on: { change: (e) => onChange(e.target.checked) } }),
    createEl("span", { class: "ou-settings-toggle__text" }, [
      createEl("strong", {}, [label]),
      createEl("small", {}, [hint]),
    ]),
  ]);
}

export async function render(container) {
  document.title = "Settings — OpenKnowledge";
  const profile = await getLocalProfile();
  const a11y = getAccessibilitySettings();

  const reducedMotionToggle = createToggle({
    label: "Reduce motion",
    hint: "Turns off animations and transitions across the app.",
    checked: a11y.reducedMotion,
    onChange: (v) => setAccessibilitySetting("reducedMotion", v),
  });
  const highContrastToggle = createToggle({
    label: "High contrast",
    hint: "Black background, white text and yellow accents for maximum legibility.",
    checked: a11y.highContrast,
    onChange: (v) => setAccessibilitySetting("highContrast", v),
  });

  mount(container, createEl("div", { class: "ou-container ou-stack" }, [
    createEl("h1", {}, ["Settings"]),
    createEl("section", { class: "ou-card ou-settings-card" }, [createAccountSettingsForm(profile)]),
    createEl("section", { class: "ou-card ou-settings-card" }, [
      createEl("h2", {}, ["Accessibility"]),
      reducedMotionToggle,
      highContrastToggle,
    ]),
  ]));
}
