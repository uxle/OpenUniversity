// src/components/lesson/key-points.js
import { createEl } from "../../utils/dom.js";

/** @param {string[]} points */
export function createKeyPoints(points = []) {
  if (!points.length) return createEl("div");
  return createEl("div", { class: "ou-card" }, [
    createEl("div", { class: "ou-card__title" }, ["Key points"]),
    createEl("ul", { role: "list", class: "ou-stack" }, points.map((p) => createEl("li", {}, [p]))),
  ]);
}
