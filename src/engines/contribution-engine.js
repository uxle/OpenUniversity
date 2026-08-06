// src/engines/contribution-engine.js — orchestrates the local-validate
// step of the contribution pipeline. See services/contribution-service.js
// for why submit/review/merge aren't automated here.

import { validateContribution, buildContributionSummary } from "../services/contribution-service.js";

export function prepareContribution(meta) {
  const errors = validateContribution(meta);
  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, summary: buildContributionSummary(meta) };
}
