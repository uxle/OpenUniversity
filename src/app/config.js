// src/app/config.js — runtime configuration & feature flags.

export const config = {
  dataBasePath: "src/subjects",
  registryPath: "src/data/subject-registry.json",
  searchIndexPath: "src/data/search-index.json",
  defaultTheme: "light",
  defaultLocale: "en",
  debug: false,
  // Set to a real endpoint to enable on-the-fly translation for lessons
  // without a pre-written .<lang>.zl file — see translation-service.js.
  // null means: pre-translated files only.
  translationEndpoint: null,
  features: {
    // Backend-dependent roadmap items — off until Phase 8 exists.
    accountsBackend: false,
    cloudSync: false,
  },
};
