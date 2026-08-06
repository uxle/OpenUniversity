// src/components/layout/footer.js — small, secondary — the app's real
// navigation is the header + bottom nav; this is just a closing credit
// line, not another navigation surface (per real feedback: an earlier,
// more prominent footer visually competed with the bottom nav).
import { createEl } from "../../utils/dom.js";

export function createFooter() {
  return createEl("footer", { class: "ou-app-shell__footer" }, [
    "OpenKnowledge — open source, ",
    createEl("a", { href: "https://github.com/uxle/OpenUniversity", class: "ou-footer-link" }, ["contribute on GitHub"]),
    ".",
  ]);
}
