// src/pages/about.js
import { createEl, mount } from "../utils/dom.js";
import { icon } from "../utils/icon.js";

const PRINCIPLES = [
  {
    iconName: "unlock",
    title: "Free, forever",
    body: "No accounts, no paywalls, no tracking. Every lesson and quiz is open to anyone with a browser — knowledge is everyone's right.",
  },
  {
    iconName: "align-left",
    title: "Text-first",
    body: "Plain, readable text instead of videos and ads. Lessons download in kilobytes, work on slow connections, and respect your attention.",
  },
  {
    iconName: "code-branch",
    title: "Open source",
    body: "Licensed Apache-2.0 and built from human-readable content files. Anyone can read, fix, extend, or fork the entire project.",
  },
  {
    iconName: "wifi-slash",
    title: "Offline-friendly",
    body: "A service worker caches what you've visited, so lessons and quizzes keep working on flights, patchy networks, and data-capped plans.",
  },
];

const STACK = [
  ["Content", "Zolto (.zl) — human-readable lesson files with headings, math, tables, diagrams and callouts"],
  ["App", "Vanilla ES modules — no framework, no build step, no bundler"],
  ["Storage", "IndexedDB + localStorage — your progress, notes and bookmarks stay on your device"],
  ["Quality", "JSON schemas, content validators, link & duplicate checkers, Playwright smoke tests"],
];

function createPrincipleCard({ iconName, title, body }) {
  return createEl("div", { class: "ou-card" }, [
    createEl("div", { class: "ou-cluster", style: "gap: var(--ou-space-2); margin-bottom: var(--ou-space-2);" }, [
      icon(iconName, { class: "ou-text-secondary" }),
      createEl("h3", { style: "margin: 0; font-size: var(--ou-fs-md);" }, [title]),
    ]),
    createEl("p", { class: "ou-card__subtitle", style: "margin: 0;" }, [body]),
  ]);
}

export async function render(container) {
  document.title = "About — OpenKnowledge";
  mount(container, createEl("div", { class: "ou-container ou-stack ou-stack--loose" }, [
    createEl("h1", {}, ["About OpenKnowledge"]),
    createEl("p", { class: "ou-hero-subtext", style: "max-width: 640px;" }, [
      "An open-source, text-first knowledge base. Free lessons, quizzes and progress tracking across core subjects — with no accounts and zero paywalls.",
    ]),
    createEl("div", { class: "ou-grid" }, PRINCIPLES.map(createPrincipleCard)),
    createEl("h2", {}, ["How it works"]),
    createEl("div", { class: "ou-stack" }, STACK.map(([label, body]) =>
      createEl("div", { class: "ou-cluster", style: "align-items: baseline;" }, [
        createEl("strong", { style: "min-width: 96px; flex-shrink: 0;" }, [label]),
        createEl("span", { class: "ou-text-secondary" }, [body]),
      ]),
    )),
    createEl("h2", {}, ["Get involved"]),
    createEl("p", { class: "ou-text-secondary" }, [
      "Every subject, lesson and quiz here was contributed by people like you. Writing a lesson is just a ",
      createEl("code", {}, [".zl"]),
      " text file — the contribution page validates it locally before you ever open a pull request.",
    ]),
    createEl("div", { class: "ou-cluster" }, [
      createEl("a", { href: "https://github.com/uxle/OpenUniversity", class: "ou-btn ou-btn--primary" }, [
        icon("code-branch"), "View source on GitHub",
      ]),
      createEl("a", { href: "#/contribute", class: "ou-btn ou-btn--secondary" }, [
        icon("code-branch"), "Contribute a lesson",
      ]),
      createEl("a", { href: "#/subjects", class: "ou-btn ou-btn--ghost" }, [
        icon("book-open"), "Browse subjects",
      ]),
    ]),
    createEl("p", { class: "ou-text-sm ou-text-muted" }, [
      "© The OpenKnowledge contributors · Apache License 2.0",
    ]),
  ]));
}
