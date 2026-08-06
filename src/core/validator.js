// src/core/validator.js — lightweight, dependency-free structural
// validation. Not a full JSON-Schema implementation — checks the subset
// of `schemas/*.schema.json` rules that matter at runtime (required
// fields + basic types). Full validation for CI lives in tools/validate-content.js.

export function validateRequired(data, requiredFields) {
  const errors = [];
  for (const field of requiredFields) {
    if (data == null || data[field] === undefined || data[field] === null || data[field] === "") {
      errors.push(`Missing required field: "${field}"`);
    }
  }
  return errors;
}

export function validateType(data, field, expectedType) {
  const value = data?.[field];
  if (value === undefined) return null;
  const actual = Array.isArray(value) ? "array" : typeof value;
  if (actual !== expectedType) {
    return `Field "${field}" should be ${expectedType}, got ${actual}`;
  }
  return null;
}

/** Matches schemas/mcq.schema.json's question shape. */
export function validateMcqQuestion(question) {
  const errors = validateRequired(question, ["id", "question", "options", "correct", "rationale"]);
  if (Array.isArray(question.options) && question.options.length < 2) {
    errors.push("options must contain at least 2 choices");
  }
  if (Number.isInteger(question.correct) && Array.isArray(question.options)) {
    if (question.correct < 0 || question.correct >= question.options.length) {
      errors.push("correct must be a valid index into options");
    }
  }
  return errors;
}

export function isValid(errors) {
  return errors.length === 0;
}
