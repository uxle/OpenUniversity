// src/services/zolto-service.js — compiles lesson source via the real
// Zolto engine adapter, with a small compile cache (lesson source rarely
// changes within a session).

import { compileLesson, parseLesson } from "../engines/zolto/zolto-engine.js";
import { createCache } from "../core/cache.js";
import { createLogger } from "../core/logger.js";

const log = createLogger("zolto-service");
const compileCache = createCache();

export async function compileLessonSource(source, opts = {}) {
  const cacheKey = source; // source text itself is a fine cache key at this scale
  return compileCache.getOrSet(cacheKey, () => {
    try {
      return compileLesson(source, opts);
    } catch (err) {
      // compile() has a no-throw guarantee per Zolto's docs; this catch is
      // a safety net in case the adapter or import itself fails (e.g.
      // `zolto` not yet installed via npm).
      log.error("Zolto compile failed", err);
      return `<p class="ou-lesson-error">Could not render this lesson. (${err.message})</p>`;
    }
  });
}

export function parseLessonSource(source) {
  return parseLesson(source);
}

export function clearCompileCache() {
  compileCache.clear();
}
