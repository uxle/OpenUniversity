// src/services/translation-service.js — pluggable machine-translation hook
// for lessons that don't have a pre-written `.lang.zl` file.
//
// Honest limitation: this sandbox has no network access, so there's no
// real translation API wired in here — faking translated output would be
// worse than not having this feature. `config.translationEndpoint` is
// null by default; set it to a real endpoint (e.g. your own proxy in
// front of a translation API — never ship an API key to the browser
// directly) to enable on-the-fly translation for lessons that only exist
// in English. Until then, callers should treat every response as
// "unavailable" and rely on the pre-translated `.lang.zl` files instead
// (see content-service.js).

import { config } from "../app/config.js";

export function machineTranslationAvailable() {
  return Boolean(config.translationEndpoint);
}

/**
 * @param {string} text
 * @param {string} targetLang
 * @returns {Promise<{ ok: boolean, text?: string, reason?: string }>}
 */
export async function translateText(text, targetLang) {
  if (!machineTranslationAvailable()) {
    return { ok: false, reason: "No translation endpoint configured (see translation-service.js)." };
  }
  const res = await fetch(config.translationEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, targetLang }),
  });
  if (!res.ok) return { ok: false, reason: `Translation request failed (${res.status})` };
  const { translatedText } = await res.json();
  return { ok: true, text: translatedText };
}
