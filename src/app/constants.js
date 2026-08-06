// src/app/constants.js — shared string constants (event names, storage
// domains). Centralized so a rename doesn't require hunting through every
// module.

export const EVENTS = {
  THEME_CHANGED: "theme:changed",
  ROUTE_CHANGED: "route:changed",
  PROGRESS_UPDATED: "progress:updated",
  BOOKMARK_ADDED: "bookmark:added",
  BOOKMARK_REMOVED: "bookmark:removed",
  NOTE_SAVED: "note:saved",
  APP_ERROR: "app:error",
};

export const THEMES = ["light", "dark", "high-contrast"];

export const DEFAULT_LESSON_LANGUAGE = "en";

// Languages the UI offers a switcher for. A lesson not yet translated into
// the chosen language falls back to DEFAULT_LESSON_LANGUAGE automatically
// (see services/content-service.js) rather than erroring.
export const SUPPORTED_LESSON_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "es", label: "Español" },
];

export const ROUTES = {
  HOME: "/",
  SUBJECTS: "/subjects",
  SUBJECT: "/subjects/:subjectId",
  SUB_SUBJECT: "/subjects/:subjectId/:subSubjectId",
  LESSON: "/subjects/:subjectId/:subSubjectId/lessons/:lessonId",
  MCQ: "/subjects/:subjectId/:subSubjectId/mcq/:lessonId",
  SEARCH: "/search",
  BOOKMARKS: "/bookmarks",
  NOTES: "/notes",
  PROGRESS: "/progress",
  PROFILE: "/profile",
  SETTINGS: "/settings",
  ABOUT: "/about",
  CONTRIBUTE: "/contribute",
};
