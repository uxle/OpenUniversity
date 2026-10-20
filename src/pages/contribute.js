// src/pages/contribute.js — local-validate step of the contribution flow.
import { createEl, mount } from "../utils/dom.js";
import { createButton } from "../components/common/button.js";
import { prepareContribution } from "../engines/contribution-engine.js";

// Mirrors CONTRIBUTION_TYPES in services/contribution-service.js — a
// <select> instead of free text removes the most common validation
// failure (typos like "lessons" or "MCQ") before it can happen.
const TYPE_OPTIONS = [
  { value: "lesson", label: "Lesson — a new .zl lesson file" },
  { value: "mcq", label: "MCQ — quiz questions for a lesson" },
  { value: "correction", label: "Correction — fix existing content" },
  { value: "translation", label: "Translation — a lesson in another language" },
  { value: "code", label: "Code — engine/service improvements" },
  { value: "design", label: "Design — styling and layout" },
  { value: "accessibility", label: "Accessibility" },
  { value: "docs", label: "Docs" },
];

export async function render(container) {
  document.title = "Contribute — OpenKnowledge";
  const typeInput = createEl("select", { "aria-label": "Contribution type" },
    TYPE_OPTIONS.map((o) => createEl("option", { value: o.value }, [o.label]))
  );
  const authorInput = createEl("input", { type: "text", placeholder: "Your name or GitHub handle", "aria-label": "Author" });
  const descInput = createEl("textarea", { rows: 4, placeholder: "Describe your contribution — what it covers, which subject, anything reviewers should know.", "aria-label": "Description" });
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

  mount(container, createEl("div", { class: "ou-container ou-stack ou-stack--loose" }, [
    createEl("h1", {}, ["Contribute"]),
    createEl("p", { class: "ou-text-secondary", style: "max-width: 640px;" }, [
      "Writing a lesson is just authoring a ",
      createEl("code", {}, [".zl"]),
      " text file — headings, paragraphs, math, tables, diagrams and callouts in plain readable markup. This page checks your contribution details locally before you open a pull request; nothing is uploaded anywhere.",
    ]),
    createEl("div", { class: "ou-contribute__form" }, [
      createEl("label", { class: "ou-form-field" }, [
        createEl("span", { class: "ou-form-field__label" }, ["What are you contributing?"]),
        typeInput,
      ]),
      createEl("label", { class: "ou-form-field" }, [
        createEl("span", { class: "ou-form-field__label" }, ["Author"]),
        authorInput,
      ]),
      createEl("label", { class: "ou-form-field" }, [
        createEl("span", { class: "ou-form-field__label" }, ["Description"]),
        descInput,
      ]),
      submit,
    ]),
    output,
    createEl("h2", {}, ["Where things live"]),
    createEl("div", { class: "ou-stack" }, [
      createEl("p", { class: "ou-text-sm ou-text-secondary" }, [
        createEl("strong", {}, ["Workflows & conventions "]),
        "— see CONTRIBUTING.md in the repository root for the full process, and the ",
        createEl("code", {}, ["schemas/"]),
        " folder for the exact JSON shapes each content type must satisfy.",
      ]),
      createEl("p", { class: "ou-text-sm ou-text-secondary" }, [
        createEl("strong", {}, ["Lesson example "]),
        "— the ",
        createEl("code", {}, ["examples/"]),
        " folder contains a ready-to-copy lesson scaffold, and any existing ",
        createEl("code", {}, ["lessons/*.zl"]),
        " file doubles as living documentation of the format.",
      ]),
      createEl("p", { class: "ou-text-sm ou-text-secondary" }, [
        createEl("strong", {}, ["Validators "]),
        "— run ",
        createEl("code", {}, ["npm run validate:all"]),
        " locally; it checks registries, content schemas, links and duplicate IDs before CI does.",
      ]),
    ]),
  ]));
}
