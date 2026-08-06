// src/pages/contribute.js — local-validate step of the contribution flow.
import { createEl, mount } from "../utils/dom.js";
import { createButton } from "../components/common/button.js";
import { prepareContribution } from "../engines/contribution-engine.js";

export async function render(container) {
  document.title = "Contribute — OpenKnowledge";
  const typeInput = createEl("input", { type: "text", placeholder: "Type (lesson, mcq, docs…)", "aria-label": "Contribution type" });
  const authorInput = createEl("input", { type: "text", placeholder: "Your name", "aria-label": "Author" });
  const descInput = createEl("textarea", { rows: 4, placeholder: "Describe your contribution", "aria-label": "Description" });
  const output = createEl("pre", { class: "ou-contribute__output" });

  const submit = createButton({
    label: "Validate",
    onClick: () => {
      const result = prepareContribution({ type: typeInput.value, author: authorInput.value, description: descInput.value });
      output.textContent = result.ok
        ? `Looks good. Suggested PR description:\n\n${result.summary}`
        : `Fix these before opening a PR:\n- ${result.errors.join("\n- ")}`;
    },
  });

  mount(container, createEl("div", { class: "ou-container ou-stack" }, [
    createEl("h1", {}, ["Contribute"]),
    createEl("p", {}, ["This checks your contribution locally before you open a pull request. See CONTRIBUTING.md for the full workflow."]),
    createEl("div", { class: "ou-contribute__form" }, [typeInput, authorInput, descInput, submit]),
    output,
  ]));
}
