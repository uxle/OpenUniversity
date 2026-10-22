// src/components/common/command-palette.js — Ctrl/Cmd+K quick launcher.
//
// A knowledge base lives and dies by "how fast can I get to X". The
// palette gives every page a one-shortcut jump: lessons (ranked by the
// same engine the Search page uses), subjects, and app actions (theme,
// random lesson, destinations) — no mouse required.
//
// Interaction contract (VS Code / Raycast conventions):
//   Ctrl+K / Cmd+K  toggle (also "/" when not typing in a field)
//   ↑ / ↓           move selection (clamped)
//   Enter           activate selection
//   Esc             close
// Click/tap works everywhere too; the palette is also opened by the
// header search button, so no keyboard is needed to reach it.
//
// Accessibility: role=dialog + aria-modal, input has aria-controls to the
// listbox, options expose aria-selected and the input tracks
// aria-activedescendant; focus returns to the trigger on close.

import { createEl, empty } from "../../utils/dom.js";
import { icon } from "../../utils/icon.js";
import { toggleTheme } from "../../utils/theme.js";
import { listSubjects, listLessons } from "../../engines/subject-engine.js";
import { search } from "../../engines/search-engine.js";
import { eventBus } from "../../core/event-bus.js";
import { EVENTS } from "../../app/constants.js";
import { createLogger } from "../../core/logger.js";

const log = createLogger("command-palette");

const MAX_ACTIONS = 4;
const MAX_SUBJECTS = 4;
const MAX_LESSONS = 7;

/** Non-content destinations & actions, matched against the raw query. */
const ACTIONS = [
  { label: "Go to Home", iconName: "house", href: "#/" },
  { label: "Browse subjects", iconName: "book-open", href: "#/subjects" },
  { label: "Take a mock test", iconName: "clipboard-list", href: "#/mock-tests" },
  { label: "View my progress", iconName: "chart-line", href: "#/progress" },
  { label: "Open bookmarks", iconName: "bookmark", href: "#/bookmarks" },
  { label: "Open notes", iconName: "note-sticky", href: "#/notes" },
  { label: "Full search page", iconName: "magnifying-glass", href: "#/search" },
  { label: "Contribute a lesson", iconName: "code-branch", href: "#/contribute" },
  { label: "Settings", iconName: "gear", href: "#/settings" },
  { label: "Toggle light / dark theme", iconName: "moon", run: () => toggleTheme() },
  { label: "Surprise me — open a random lesson", iconName: "sparkles", run: openRandomLesson },
];

async function openRandomLesson() {
  try {
    const subjects = await listSubjects();
    const flat = subjects.filter((s) => (s.lessonCount ?? 0) > 0);
    if (!flat.length) return;
    const subject = flat[Math.floor(Math.random() * flat.length)];
    const lessons = await listLessons(subject.id, undefined);
    if (!lessons.length) return;
    const lesson = lessons[Math.floor(Math.random() * lessons.length)];
    location.hash = `#/subjects/${subject.id}/lessons/${lesson}`;
  } catch (err) {
    log.warn("random lesson failed:", err);
  }
}

/**
 * Subsequence fuzzy match — returns a relevance score or -1. Deliberately
 * simple: candidates are ≤ ~320 short strings per keystroke, so an
 * indexOf-based score beats pulling in a real fuzzy library (which this
 * repo's zero-dependency rule forbids anyway).
 */
function fuzzyScore(query, text) {
  if (!query) return 0;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  const direct = t.indexOf(q);
  if (direct === 0) return 1000;
  if (direct > 0) return 700 - Math.min(direct, 100);
  // Word-boundary initials ("cs" → "Computer Science")
  const words = t.split(/\s+/);
  let qi = 0;
  let score = 300;
  for (const word of words) {
    if (qi >= q.length) break;
    if (word[0] === q[qi]) { score += 60; qi++; }
    else if (word.includes(q[qi])) { score += 20; qi++; }
  }
  return qi === q.length ? score : -1;
}

export function createCommandPalette() {
  let subjectsCache = null;
  let open = false;
  let items = [];
  let selected = 0;
  let searchSeq = 0;
  let lastTrigger = null;

  const input = createEl("input", {
    class: "ou-cmdk__input",
    type: "text",
    placeholder: "Search lessons, subjects, actions…",
    "aria-label": "Command palette search",
    "aria-controls": "cmdk-list",
    autocomplete: "off",
    spellcheck: "false",
  });

  const listEl = createEl("div", {
    class: "ou-cmdk__list",
    id: "cmdk-list",
    role: "listbox",
    "aria-label": "Command results",
  });

  const panel = createEl("div", { class: "ou-cmdk__panel", role: "dialog", "aria-modal": "true", "aria-label": "Command palette" }, [
    createEl("div", { class: "ou-cmdk__head" }, [
      icon("magnifying-glass", { class: "ou-cmdk__glass" }),
      input,
      createEl("button", {
        class: "ou-cmdk__esc", type: "button", "aria-label": "Close command palette",
        on: { click: () => close() },
      }, [icon("xmark"), createEl("span", {}, ["esc"])]),
    ]),
    listEl,
    createEl("div", { class: "ou-cmdk__foot", "aria-hidden": "true" }, [
      createEl("span", {}, ["↑↓ navigate"]),
      createEl("span", {}, ["↵ open"]),
      createEl("span", {}, ["esc close"]),
    ]),
  ]);

  const overlay = createEl("div", { class: "ou-cmdk", hidden: true }, [panel]);

  function select(index) {
    if (!items.length) return;
    selected = Math.max(0, Math.min(items.length - 1, index));
    const nodes = listEl.querySelectorAll("[role='option']");
    nodes.forEach((n, i) => {
      n.setAttribute("aria-selected", String(i === selected));
      if (i === selected) {
        input.setAttribute("aria-activedescendant", n.id);
        n.scrollIntoView({ block: "nearest" });
      }
    });
  }

  function makeRow(item, id) {
    return createEl("div", {
      class: "ou-cmdk__item", role: "option", id,
      "aria-selected": "false",
      on: {
        mouseenter: () => select(items.indexOf(item)),
        click: () => activate(item),
      },
    }, [
      icon(item.iconName),
      createEl("span", { class: "ou-cmdk__label" }, [item.label]),
      item.hint ? createEl("span", { class: "ou-cmdk__hint" }, [item.hint]) : null,
    ]);
  }

  /**
   * Full (re)render. Groups: Actions, Subjects, Lessons (optional —
   * appended once the async search resolves).
   */
  function render(query, lessons = []) {
    empty(listEl);
    items = [];
    let optionId = 0;

    const addGroup = (title, entries) => {
      if (!entries.length) return;
      listEl.appendChild(createEl("div", { class: "ou-cmdk__group" }, [title]));
      for (const item of entries) {
        const row = makeRow(item, `cmdk-opt-${optionId++}`);
        listEl.appendChild(row);
        items.push(item);
      }
    };

    const q = query.trim();

    const actionHits = (q
      ? ACTIONS
          .map((a) => ({ a, s: fuzzyScore(q, a.label) }))
          .filter(({ s }) => s >= 0)
          .sort((x, y) => y.s - x.s)
          .slice(0, MAX_ACTIONS)
          .map(({ a }) => a)
      : ACTIONS.slice(0, 5)
    );

    const subjectHits = (subjectsCache ?? [])
      .map((s) => ({ s, score: q ? fuzzyScore(q, s.title) : 0 }))
      .filter(({ score }) => score >= 0)
      .sort((x, y) => y.score - x.score)
      .slice(0, q ? MAX_SUBJECTS : 0)
      .map(({ s }) => ({
        label: s.title, iconName: "book", href: `#/subjects/${s.id}`,
        hint: `${s.lessonCount ?? 0} lessons`,
      }));

    addGroup("Actions", actionHits);
    addGroup("Subjects", subjectHits);
    addGroup("Lessons", lessons);

    if (!items.length) {
      listEl.appendChild(createEl("div", { class: "ou-cmdk__empty" }, ["No matches — try fewer letters."]));
    }
    select(0);
  }

  function activate(item) {
    close();
    if (item.run) { item.run(); return; }
    if (item.href) location.hash = item.href.startsWith("#") ? item.href.slice(1) : item.href;
  }

  /** Lessons come from the same ranked engine the Search page uses. */
  async function runLessonSearch(query) {
    const seq = ++searchSeq;
    try {
      const results = await search(query, { limit: MAX_LESSONS });
      if (seq !== searchSeq || !open) return;
      const lessonItems = results.map((r) => ({
        label: r.title,
        iconName: "book",
        hint: r.subject,
        href: r.subSubjectId
          ? `#/subjects/${r.subjectId}/${r.subSubjectId}/lessons/${r.lessonId}`
          : `#/subjects/${r.subjectId}/lessons/${r.lessonId}`,
      }));
      render(query, lessonItems);
    } catch (err) {
      if (seq === searchSeq) log.warn("palette lesson search failed:", err);
    }
  }

  function onInput() {
    const q = input.value;
    render(q);
    if (q.trim().length >= 2) runLessonSearch(q);
  }

  function onKeydown(e) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      select(selected + (e.key === "ArrowDown" ? 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (items[selected]) activate(items[selected]);
    }
  }

  function openPalette(trigger) {
    lastTrigger = trigger ?? document.activeElement;
    open = true;
    overlay.hidden = false;
    input.value = "";
    render("");
    requestAnimationFrame(() => input.focus());
    document.body.style.overflow = "hidden";
  }

  function close() {
    if (!open) return;
    open = false;
    overlay.hidden = true;
    document.body.style.overflow = "";
    input.removeAttribute("aria-activedescendant");
    if (lastTrigger && typeof lastTrigger.focus === "function") lastTrigger.focus();
    lastTrigger = null;
  }

  function toggle() {
    open ? close() : openPalette();
  }

  // Global shortcuts: Ctrl/Cmd+K anywhere; "/" only when not typing.
  function onGlobalKey(e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      toggle();
      return;
    }
    if (!open && e.key === "/" && !isTypingTarget(e.target)) {
      e.preventDefault();
      openPalette();
    }
  }

  function isTypingTarget(el) {
    return el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable === true);
  }

  document.addEventListener("keydown", onGlobalKey);
  input.addEventListener("input", onInput);
  input.addEventListener("keydown", onKeydown);
  // Click on the darkened backdrop (not the panel) closes.
  overlay.addEventListener("mousedown", (e) => { if (e.target === overlay) close(); });
  // Close when a navigation happens (palette actions navigate via hash).
  eventBus.on(EVENTS.ROUTE_CHANGED, close);
  // Other components (e.g. the home hero search) can request the palette
  // without importing this module — keeps pages decoupled from the shell.
  eventBus.on(EVENTS.PALETTE_OPEN, () => openPalette());

  // Warm the subject list once, off the critical path — the palette works
  // without it (actions + lessons), subjects just enrich it.
  listSubjects().then((s) => { subjectsCache = s; }).catch(() => { subjectsCache = []; });

  return {
    el: overlay,
    toggle,
    open: () => openPalette(),
    close,
  };
}
