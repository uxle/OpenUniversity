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
  PALETTE_OPEN: "palette:open",
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
  // "Flat" subjects (no subSubjects — e.g. reasoning, economics, geography,
  // history: see src/subjects/*/index.json + details.zl) keep their
  // lessons directly under the subject, with no sub-subject segment.
  // content-service.js already treats subSubjectId as optional when
  // building fetch paths; these routes are the matching optional-segment
  // patterns on the UI side, reusing pages/lesson.js and pages/mcq.js
  // unchanged (subSubjectId simply arrives as undefined). Router matching
  // is exact-segment-count (see core/router.js), so these can't collide
  // with SUB_SUBJECT/LESSON/MCQ above despite the shared prefix.
  SUBJECT_LESSON: "/subjects/:subjectId/lessons/:lessonId",
  SUBJECT_MCQ: "/subjects/:subjectId/mcq/:lessonId",
  SEARCH: "/search",
  BOOKMARKS: "/bookmarks",
  NOTES: "/notes",
  PROGRESS: "/progress",
  PROFILE: "/profile",
  SETTINGS: "/settings",
  ABOUT: "/about",
  CONTRIBUTE: "/contribute",
};
