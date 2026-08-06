// src/services/contribution-service.js — local helper for the
// "Add a lesson -> validate -> submit" pipeline described in the README.
// Only the local-validate step can run without a backend/GitHub API;
// review/merge remain manual (a real pull request), so this stops at
// producing a validated, PR-ready summary rather than submitting anything.

import { validateRequired } from "../core/validator.js";

const CONTRIBUTION_TYPES = [
  "lesson", "mcq", "correction", "translation", "code", "design", "accessibility", "docs",
];

export function validateContribution(meta) {
  const errors = validateRequired(meta, ["type", "author"]);
  if (meta.type && !CONTRIBUTION_TYPES.includes(meta.type)) {
    errors.push(`Unknown contribution type "${meta.type}". Expected one of: ${CONTRIBUTION_TYPES.join(", ")}`);
  }
  return errors;
}

export function buildContributionSummary(meta) {
  const lines = [
    `Type: ${meta.type}`,
    `Author: ${meta.author}`,
  ];
  if (meta.subject) lines.push(`Subject: ${meta.subject}${meta.subSubject ? ` / ${meta.subSubject}` : ""}`);
  if (meta.description) lines.push("", meta.description);
  return lines.join("\n");
}
