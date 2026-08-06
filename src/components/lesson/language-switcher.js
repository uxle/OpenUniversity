// src/components/lesson/language-switcher.js — per-lesson translation
// switcher. Loads a pre-translated `.zl`/`.json` file if one exists
// (services/content-service.js handles the fallback), and shows a clear
// notice rather than silently serving the wrong language when it doesn't.
//
// Note: icon fonts don't render inside native <option> text, so the globe
// icon sits beside the <select> instead of inside each option.

import { createEl } from "../../utils/dom.js";
import { icon } from "../../utils/icon.js";
import { SUPPORTED_LESSON_LANGUAGES, DEFAULT_LESSON_LANGUAGE } from "../../app/constants.js";

/**
 * @param {string} currentLang
 * @param {(lang: string) => void} onChange
 */
export function createLanguageSwitcher(currentLang, onChange) {
  const select = createEl("select", {
    class: "ou-btn ou-btn--secondary ou-btn--sm",
    "aria-label": "Translate this lesson",
    on: { change: (e) => onChange(e.target.value) },
  }, SUPPORTED_LESSON_LANGUAGES.map(({ code, label }) =>
    createEl("option", { value: code, selected: code === currentLang }, [label])
  ));

  return createEl("label", { class: "ou-cluster" }, [
    icon("language"),
    select,
  ]);
}

/** Shown when the requested language isn't translated yet and English was served instead. */
export function createTranslationFallbackNotice(requestedLang) {
  const lang = SUPPORTED_LESSON_LANGUAGES.find((l) => l.code === requestedLang);
  return createEl("div", { class: "ou-card ou-cluster", role: "status" }, [
    icon("circle-info"),
    createEl("span", {}, [
      `This lesson isn't translated into ${lang?.label || requestedLang} yet — showing ${
        SUPPORTED_LESSON_LANGUAGES.find((l) => l.code === DEFAULT_LESSON_LANGUAGE)?.label
      }. `,
      createEl("a", { href: "#/contribute", class: "ou-link" }, ["Contribute a translation →"]),
    ]),
  ]);
}
