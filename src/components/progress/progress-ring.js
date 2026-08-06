// src/components/progress/progress-ring.js — SVG ring with a centered
// label (percentage, or "Start" when there's nothing to show yet — an
// empty ring with no context wasn't meaningful on its own).
import { createEl } from "../../utils/dom.js";

const RADIUS = 28;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** @param {number} ratio 0..1 */
function buildSvg(ratio) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "64");
  svg.setAttribute("height", "64");
  svg.setAttribute("viewBox", "0 0 64 64");

  const track = document.createElementNS(svg.namespaceURI, "circle");
  track.setAttribute("cx", "32"); track.setAttribute("cy", "32"); track.setAttribute("r", String(RADIUS));
  track.setAttribute("fill", "none"); track.setAttribute("stroke", "var(--ou-border-strong)"); track.setAttribute("stroke-width", "6");

  const fill = document.createElementNS(svg.namespaceURI, "circle");
  fill.setAttribute("cx", "32"); fill.setAttribute("cy", "32"); fill.setAttribute("r", String(RADIUS));
  fill.setAttribute("fill", "none"); fill.setAttribute("stroke", "var(--ou-accent)"); fill.setAttribute("stroke-width", "6");
  fill.setAttribute("stroke-linecap", "round");
  fill.setAttribute("stroke-dasharray", String(CIRCUMFERENCE));
  fill.setAttribute("stroke-dashoffset", String(CIRCUMFERENCE * (1 - Math.min(1, Math.max(0, ratio)))));
  fill.setAttribute("transform", "rotate(-90 32 32)");

  svg.append(track, fill);
  return svg;
}

/** @param {number} ratio 0..1 */
export function createProgressRing(ratio = 0) {
  const label = ratio > 0
    ? createEl("span", { class: "ou-progress-ring__label ou-tabular-nums" }, [`${Math.round(ratio * 100)}%`])
    : createEl("span", { class: "ou-progress-ring__label ou-progress-ring__label--muted" }, ["Start"]);
  return createEl("div", { class: "ou-progress-ring" }, [buildSvg(ratio), label]);
}
