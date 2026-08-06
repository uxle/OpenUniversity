// src/components/progress/progress-chart.js — simple SVG bar chart, no
// external charting library (matches the project's zero-dependency goal).
/** @param {{ label: string, value: number }[]} data values expected 0..1 */
export function createProgressChart(data, { width = 320, barHeight = 20, gap = 8 } = {}) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const height = data.length * (barHeight + gap);
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Progress by subject");

  data.forEach((d, i) => {
    const y = i * (barHeight + gap);
    const track = document.createElementNS(svg.namespaceURI, "rect");
    track.setAttribute("x", "0"); track.setAttribute("y", String(y));
    track.setAttribute("width", String(width)); track.setAttribute("height", String(barHeight));
    track.setAttribute("fill", "var(--ou-border)"); track.setAttribute("rx", "4");

    const fill = document.createElementNS(svg.namespaceURI, "rect");
    fill.setAttribute("x", "0"); fill.setAttribute("y", String(y));
    fill.setAttribute("width", String(width * Math.min(1, Math.max(0, d.value))));
    fill.setAttribute("height", String(barHeight));
    fill.setAttribute("fill", "var(--ou-accent)"); fill.setAttribute("rx", "4");

    const title = document.createElementNS(svg.namespaceURI, "title");
    title.textContent = `${d.label}: ${Math.round(d.value * 100)}%`;

    const group = document.createElementNS(svg.namespaceURI, "g");
    group.append(track, fill, title);
    svg.appendChild(group);
  });

  return svg;
}
