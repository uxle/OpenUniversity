// src/pdf/svg-vector.js — renders the lesson's chart/diagram SVG output as
// native PDF vector operators, so charts and diagrams are as crisp as the
// text at every zoom level ("never pixelates").
//
// Scope is deliberately matched to Zolto's machine-generated SVG:
//   g/defs/title, path (all commands incl. arcs), rect(+rx), line,
//   polyline/polygon, circle→rounded-square markers (design language:
//   "rectangles with rounded corners instead of circles"; large/true
//   circular data such as pie arcs stays circular), ellipse, text/tspan,
//   transforms, gradients→solid first-stop colour.

import { pushSegment, runsToCells, wrapCells, lineWidthPt, drawLine } from "./pdf-text.js";

// ── Mini XML parser ──────────────────────────────────────────────────────────

const ENTITIES = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: "\u00a0",
  times: "\u00d7", divide: "\u00f7", minus: "\u2212", plusmn: "\u00b1",
  deg: "\u00b0", middot: "\u00b7", hellip: "\u2026", mdash: "\u2014", ndash: "\u2013",
  alpha: "\u03b1", beta: "\u03b2", gamma: "\u03b3", theta: "\u03b8", lambda: "\u03bb",
  mu: "\u03bc", pi: "\u03c0", sigma: "\u03c3", phi: "\u03c6", omega: "\u03c9",
  infin: "\u221e", le: "\u2264", ge: "\u2265", ne: "\u2260", radic: "\u221a",
  rarr: "\u2192", larr: "\u2190", check: "\u2713",
};

function decodeEntities(s) {
  return String(s || "").replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (m, body) => {
    if (body[0] === "#") {
      const cp = body[1] === "x" || body[1] === "X"
        ? parseInt(body.slice(2), 16)
        : parseInt(body.slice(1), 10);
      return cp > 0 && cp < 0x110000 ? String.fromCodePoint(cp) : m;
    }
    return ENTITIES[body] ?? m;
  });
}

/** Parses an SVG string into { root, viewBox, gradients }. Throws on gross malformation. */
export function parseSvg(svgString) {
  const src = String(svgString);
  const gradients = {};
  const stack = [];
  let root = null;
  let i = 0;
  let textBuf = "";

  const flushText = () => {
    if (!textBuf.trim() || !stack.length) { textBuf = ""; return; }
    const parent = stack[stack.length - 1];
    parent.children.push({ tag: "#text", text: decodeEntities(textBuf).replace(/\s+/g, " ") });
    textBuf = "";
  };

  while (i < src.length) {
    const lt = src.indexOf("<", i);
    if (lt === -1) { textBuf += src.slice(i); break; }
    textBuf += src.slice(i, lt);
    if (src.startsWith("<!--", lt)) {
      i = src.indexOf("-->", lt);
      i = i === -1 ? src.length : i + 3;
      continue;
    }
    if (src.startsWith("<![CDATA[", lt)) {
      const end = src.indexOf("]]>", lt);
      textBuf += src.slice(lt + 9, end === -1 ? src.length : end);
      i = end === -1 ? src.length : end + 3;
      continue;
    }
    if (src.startsWith("<?", lt) || src.startsWith("<!", lt)) {
      i = src.indexOf(">", lt) + 1;
      continue;
    }
    const gt = findTagEnd(src, lt);
    if (gt === -1) break;
    const raw = src.slice(lt + 1, gt);
    i = gt + 1;
    if (raw.startsWith("/")) {
      flushText();
      stack.pop();
      continue;
    }
    const selfClose = raw.endsWith("/");
    const body = selfClose ? raw.slice(0, -1) : raw;
    const tag = (body.match(/^[a-zA-Z0-9:_-]+/) || ["unknown"])[0].toLowerCase();
    const attrs = parseAttrs(body.slice(tag.length));
    if (tag === "svg" && !root) {
      root = { tag, attrs, children: [] };
      stack.push(root);
      if (!selfClose) continue;
      stack.pop();
      continue;
    }
    const node = { tag, attrs, children: [] };
    if (!stack.length) continue;
    stack[stack.length - 1].children.push(node);
    if (tag === "lineargradient" || tag === "radialgradient") {
      const id = (attrs.id || "").replace(/^#/, "");
      if (id) gradients[id] = node;
    }
    if (tag === "style" || tag === "script" || tag === "title" || tag === "desc" || tag === "metadata") {
      // Swallow the raw text of these elements and do NOT push them on the
      // stack — everything after </title> must attach to the svg root, not
      // to the title node (renderNode skips title subtrees entirely).
      const closeTag = `</${tag}`;
      const closeIdx = src.toLowerCase().indexOf(closeTag, i);
      if (closeIdx !== -1) {
        i = src.indexOf(">", closeIdx) + 1;
      }
      continue;
    }
    if (!selfClose) stack.push(node);
  }
  if (!root) throw new Error("No <svg> root found");
  const vb = (root.attrs.viewBox || "").trim().split(/[\s,]+/).map(Number);
  const viewBox = vb.length === 4 && vb.every((n) => Number.isFinite(n))
    ? { x: vb[0], y: vb[1], w: vb[2], h: vb[3] }
    : null;
  return { root, viewBox, gradients };
}

function findTagEnd(src, from) {
  let inQuote = null;
  for (let i = from + 1; i < src.length; i++) {
    const c = src[i];
    if (inQuote) {
      if (c === inQuote) inQuote = null;
    } else if (c === '"' || c === "'") inQuote = c;
    else if (c === ">") return i;
  }
  return -1;
}

function parseAttrs(str) {
  const attrs = {};
  const re = /([a-zA-Z0-9:_-]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
  let m;
  while ((m = re.exec(str))) attrs[m[1]] = decodeEntities(m[3] ?? m[4] ?? "");
  return attrs;
}

// ── Style + geometry helpers ─────────────────────────────────────────────────

const NAMED_COLORS = {
  white: "#ffffff", black: "#000000", red: "#ef4444", green: "#22c55e", blue: "#3b82f6",
  gray: "#6b7280", grey: "#6b7280", yellow: "#eab308", orange: "#f97316",
  purple: "#a855f7", pink: "#ec4899", teal: "#14b8a6", cyan: "#06b6d4",
  transparent: null, none: null,
};

export function parseColor(value, gradients) {
  if (!value) return null;
  const v = String(value).trim();
  if (v === "none" || v === "transparent") return null;
  if (v.startsWith("url(")) {
    const id = (v.match(/url\(['"]?#([^)'"]+)/) || [])[1];
    if (id && gradients[id]) {
      const stop = findFirstStop(gradients[id]);
      return stop ? parseColor(stop, gradients) : [0.31, 0.275, 0.9];
    }
    return [0.31, 0.275, 0.9];
  }
  if (NAMED_COLORS[v] !== undefined) return NAMED_COLORS[v] === null ? null : parseColor(NAMED_COLORS[v]);
  if (v.startsWith("#")) {
    let hex = v.slice(1);
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    if (hex.length === 8) hex = hex.slice(0, 6);
    if (hex.length !== 6 || /[^0-9a-f]/i.test(hex)) return null;
    const n = parseInt(hex, 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  const rgb = v.match(/^rgba?\(([^)]+)\)$/i);
  if (rgb) {
    const parts = rgb[1].split(/[\s,]+/).map(parseFloat);
    return [parts[0] / 255, parts[1] / 255, parts[2] / 255];
  }
  return null;
}

function findFirstStop(node) {
  for (const child of node.children || []) {
    if (child.tag === "stop") return child.attrs["stop-color"] || child.attrs.stopColor;
    if (child.tag === "#text") continue;
    const nested = findFirstStop(child);
    if (nested) return nested;
  }
  return null;
}

// ── Path data scanner ────────────────────────────────────────────────────────

function* scanPathArgs(d) {
  let i = 0;
  const n = d.length;
  while (i < n) {
    while (i < n && /[\s,]/.test(d[i])) i++;
    if (i >= n) return;
    const start = i;
    if (/[+-]/.test(d[i])) i++;
    while (i < n && /[0-9.]/.test(d[i])) i++;
    if (i < n && /[eE]/.test(d[i])) {
      i++;
      if (i < n && /[+-]/.test(d[i])) i++;
      while (i < n && /[0-9]/.test(d[i])) i++;
    }
    if (i === start) { yield d[i++]; } // flag char (0/1) or unknown
    else yield parseFloat(d.slice(start, i));
  }
}

/**
 * Parses `d` and draws it through `gfx`, mapping user-space coordinates
 * through the current matrix `m` (charts use axis-aligned transforms).
 */
export function drawPathData(gfx, d, m = [1, 0, 0, 1, 0, 0]) {
  const dev = (x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
  const sx = Math.abs(m[0]) || 1;
  const sy = Math.abs(m[3]) || 1;
  const args = [...scanPathArgs(d)];
  let ai = 0;
  let cmd = null;
  let cx = 0, cy = 0; // current point (user space)
  let lastCtrlQ = null;
  const isCmd = (v) => typeof v === "string";
  const num = () => {
    const v = args[ai++];
    if (v === undefined) return 0;
    if (isCmd(v)) { ai--; return 0; }
    return v;
  };

  while (ai < args.length) {
    if (isCmd(args[ai])) cmd = args[ai++];
    if (cmd == null) break;
    const rel = cmd === cmd.toLowerCase();
    const C = cmd.toUpperCase();
    switch (C) {
      case "M": {
        const x = num(), y = num();
        if (rel) { cx += x; cy += y; } else { cx = x; cy = y; }
        const [dx, dy] = dev(cx, cy);
        gfx.moveTo(dx, dy);
        cmd = rel ? "l" : "L";
        break;
      }
      case "L": {
        const x = num(), y = num();
        cx = rel ? cx + x : x;
        cy = rel ? cy + y : y;
        const [dx, dy] = dev(cx, cy);
        gfx.lineTo(dx, dy);
        break;
      }
      case "H": {
        const x = num();
        cx = rel ? cx + x : x;
        const [dx, dy] = dev(cx, cy);
        gfx.lineTo(dx, dy);
        break;
      }
      case "V": {
        const y = num();
        cy = rel ? cy + y : y;
        const [dx, dy] = dev(cx, cy);
        gfx.lineTo(dx, dy);
        break;
      }
      case "C": {
        const x1 = num(), y1 = num(), x2 = num(), y2 = num(), x = num(), y = num();
        const X1 = rel ? cx + x1 : x1, Y1 = rel ? cy + y1 : y1;
        const X2 = rel ? cx + x2 : x2, Y2 = rel ? cy + y2 : y2;
        const X = rel ? cx + x : x, Y = rel ? cy + y : y;
        const [d1x, d1y] = dev(X1, Y1);
        const [d2x, d2y] = dev(X2, Y2);
        const [d3x, d3y] = dev(X, Y);
        gfx.cubicTo(d1x, d1y, d2x, d2y, d3x, d3y);
        cx = X; cy = Y;
        break;
      }
      case "S": {
        const x2 = num(), y2 = num(), x = num(), y = num();
        const X2 = rel ? cx + x2 : x2, Y2 = rel ? cy + y2 : y2;
        const X = rel ? cx + x : x, Y = rel ? cy + y : y;
        const [d2x, d2y] = dev(X2, Y2);
        const [d3x, d3y] = dev(X, Y);
        // smooth-cubic control reflection approximated by the current point
        const [dcx, dcy] = dev(cx, cy);
        gfx.cubicTo(dcx, dcy, d2x, d2y, d3x, d3y);
        cx = X; cy = Y;
        break;
      }
      case "Q": {
        const qx = num(), qy = num(), x = num(), y = num();
        const QX = rel ? cx + qx : qx, QY = rel ? cy + qy : qy;
        const X = rel ? cx + x : x, Y = rel ? cy + y : y;
        const [dqx, dqy] = dev(QX, QY);
        const [dx2, dy2] = dev(X, Y);
        gfx.quadTo(dqx, dqy, dx2, dy2);
        lastCtrlQ = [QX, QY];
        cx = X; cy = Y;
        break;
      }
      case "T": {
        const x = num(), y = num();
        const X = rel ? cx + x : x, Y = rel ? cy + y : y;
        const QX = lastCtrlQ ? 2 * cx - lastCtrlQ[0] : cx;
        const QY = lastCtrlQ ? 2 * cy - lastCtrlQ[1] : cy;
        const [dqx, dqy] = dev(QX, QY);
        const [dx2, dy2] = dev(X, Y);
        gfx.quadTo(dqx, dqy, dx2, dy2);
        lastCtrlQ = [QX, QY];
        cx = X; cy = Y;
        break;
      }
      case "A": {
        const rx = num(), ry = num(), rot = num();
        const laf = num(), sf = num();
        const x = num(), y = num();
        const X = rel ? cx + x : x, Y = rel ? cy + y : y;
        const [dx2, dy2] = dev(X, Y);
        gfx.arcTo(dx2, dy2, rx * sx, ry * sy, rot, !!laf, !!sf);
        cx = X; cy = Y;
        break;
      }
      case "Z":
        gfx.close();
        break;
      default:
        ai++; // unknown command — skip
        break;
    }
  }
}

// ── Tree renderer ────────────────────────────────────────────────────────────

function matMul(a, b) {
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5],
  ];
}

function parseTransform(str) {
  let m = [1, 0, 0, 1, 0, 0];
  if (!str) return m;
  const re = /(matrix|translate|scale|rotate)\s*\(([^)]*)\)/g;
  let match;
  while ((match = re.exec(str))) {
    const fn = match[1];
    const args = match[2].trim().split(/[\s,]+/).map(Number);
    let t;
    if (fn === "matrix") t = args;
    else if (fn === "translate") t = [1, 0, 0, 1, args[0] || 0, args[1] || 0];
    else if (fn === "scale") t = [args[0] ?? 1, 0, 0, args[1] ?? args[0] ?? 1, 0, 0];
    else { // rotate
      const a = ((args[0] || 0) * Math.PI) / 180;
      const cos = Math.cos(a), sin = Math.sin(a);
      t = [cos, sin, -sin, cos, 0, 0];
      if (args.length >= 3) {
        t = matMul(matMul([1, 0, 0, 1, args[1], args[2]], t), [1, 0, 0, 1, -args[1], -args[2]]);
      }
    }
    m = matMul(m, t);
  }
  return m;
}

function applyMat(m, x, y) {
  return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
}

function scaleOfMat(m) {
  return Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2])) || 1;
}

/**
 * Renders a parsed SVG into the PDF graphics context.
 * @param {object} opts
 *   svg      parsed svg ({root, viewBox, gradients}) from parseSvg()
 *   gfx      graphics from createGraphics()
 *   box      {x, y, w, h} target rect (top-down pt)
 *   crop     optional {x, w} horizontal sub-window of the viewBox (user
 *            units, relative to viewBox.x) — used to slice ultra-wide
 *            diagrams into stacked full-width panels
 *   style    base style {fontKeys, deva}
 */
export function renderSvg(gfx, svg, box, { fontKeys = {}, deva = null, crop = null } = {}) {
  const { root, viewBox, gradients } = svg;
  const vb = viewBox || { x: 0, y: 0, w: parseFloat(root.attrs.width) || 800, h: parseFloat(root.attrs.height) || 450 };
  const winX = vb.x + (crop ? crop.x : 0);
  const winW = crop ? crop.w : vb.w;
  const fit = Math.min(box.w / winW, box.h / vb.h);
  const offsetX = box.x + (box.w - winW * fit) / 2;
  const offsetY = box.y + (box.h - vb.h * fit) / 2;
  const base = matMul([fit, 0, 0, fit, offsetX - winX * fit, offsetY - vb.y * fit], [1, 0, 0, 1, 0, 0]);
  // clip to the box so overflowing charts can't bleed into margins
  gfx.save();
  gfx.roundedRect(box.x - 1, box.y - 1, box.w + 2, box.h + 2, 3);
  gfx.clip();
  renderNode(root, base, defaultState(), { gfx, fontKeys, deva, gradients });
  gfx.restore();
}

function defaultState() {
  return {
    fill: [0, 0, 0],
    stroke: null,
    strokeWidth: 1,
    opacity: 1,
    dash: [],
    fontSize: 14,
    fontWeight: 400,
    anchor: "start",
  };
}

function inheritState(state, attrs, gradients) {
  const s = { ...state };
  if (attrs.fill !== undefined) s.fill = parseColor(attrs.fill, gradients);
  if (attrs.stroke !== undefined) s.stroke = parseColor(attrs.stroke, gradients);
  if (attrs["stroke-width"] !== undefined) s.strokeWidth = parseFloat(attrs["stroke-width"]) || 0;
  if (attrs["fill-opacity"] !== undefined || attrs.opacity !== undefined) {
    s.opacity = (attrs["fill-opacity"] !== undefined ? parseFloat(attrs["fill-opacity"]) : 1) * (attrs.opacity !== undefined ? parseFloat(attrs.opacity) : 1);
  }
  if (attrs["stroke-dasharray"] !== undefined) {
    const d = String(attrs["stroke-dasharray"]).split(/[\s,]+/).map(Number).filter((n) => n > 0);
    s.dash = attrs["stroke-dasharray"] === "none" ? [] : d;
  }
  if (attrs["font-size"] !== undefined) s.fontSize = parseFloat(attrs["font-size"]) || s.fontSize;
  if (attrs["font-weight"] !== undefined) {
    s.fontWeight = String(attrs["font-weight"]) === "bold" || Number(attrs["font-weight"]) >= 600 ? 700 : 400;
  }
  if (attrs["text-anchor"] !== undefined) s.anchor = attrs["text-anchor"];
  return s;
}

function renderNode(node, mat, state, ctx) {
  if (!node || node.tag === "defs" || node.tag === "title" || node.tag === "script") return;
  const attrs = node.attrs || {};
  if (attrs.display === "none" || attrs.visibility === "hidden") return;
  const gfx = ctx.gfx;
  const s = inheritState(state, attrs, ctx.gradients);
  const m = attrs.transform ? matMul(mat, parseTransform(attrs.transform)) : mat;
  const k = scaleOfMat(m);
  const toXY = (x, y) => applyMat(m, x, y);
  const pt = (v) => v * k; // user units → pt

  switch (node.tag) {
    case "g":
    case "svg":
      gfxSave(gfx, s);
      for (const child of node.children || []) renderNode(child, m, s, ctx);
      gfx.restore();
      return;
    case "path": {
      if (!attrs.d) return;
      gfxSave(gfx, s);
      gfx.setStroke(s.stroke || [0, 0, 0]);
      gfx.setFill(s.fill || [0, 0, 0]);
      gfx.setLineWidth(pt(s.strokeWidth));
      if (s.dash.length) gfx.setDash(s.dash.map((d) => pt(d)));
      drawPathData(gfx, attrs.d, m);
      paintShape(gfx, s, attrs);
      gfx.restore();
      return;
    }
    case "rect": {
      const x = parseFloat(attrs.x || 0), y = parseFloat(attrs.y || 0);
      const w = parseFloat(attrs.width || 0), h = parseFloat(attrs.height || 0);
      if (w <= 0 || h <= 0) return;
      const rx = parseFloat(attrs.rx || attrs.ry || 0);
      gfxSave(gfx, s);
      const [X, Y] = toXY(x, y);
      gfx.roundedRect(X, Y, w * k, h * k, rx * k);
      gfx.setFill(s.fill || [0, 0, 0]);
      if (s.stroke) gfx.setStroke(s.stroke);
      gfx.setLineWidth(pt(s.strokeWidth));
      paintShape(gfx, s, attrs);
      gfx.restore();
      return;
    }
    case "line": {
      const [X1, Y1] = toXY(parseFloat(attrs.x1 || 0), parseFloat(attrs.y1 || 0));
      const [X2, Y2] = toXY(parseFloat(attrs.x2 || 0), parseFloat(attrs.y2 || 0));
      gfxSave(gfx, s);
      gfx.setStroke(s.stroke || s.fill || [0, 0, 0]);
      gfx.setLineWidth(pt(s.strokeWidth));
      gfx.line(X1, Y1, X2, Y2);
      gfx.restore();
      return;
    }
    case "polyline":
    case "polygon": {
      const pts = String(attrs.points || "").trim().split(/[\s,]+/).map(Number);
      if (pts.length < 4) return;
      gfxSave(gfx, s);
      pts.forEach((v, idx) => {
        if (idx % 2) return;
        const [X, Y] = toXY(pts[idx], pts[idx + 1]);
        if (idx === 0) gfx.moveTo(X, Y);
        else gfx.lineTo(X, Y);
      });
      if (node.tag === "polygon") gfx.close();
      gfx.setFill(s.fill || [0, 0, 0]);
      if (s.stroke) gfx.setStroke(s.stroke);
      gfx.setLineWidth(pt(s.strokeWidth));
      paintShape(gfx, s, attrs);
      gfx.restore();
      return;
    }
    case "circle":
    case "ellipse": {
      const cx = parseFloat(attrs.cx || 0), cy = parseFloat(attrs.cy || 0);
      const rx = parseFloat(node.tag === "circle" ? attrs.r : attrs.rx) || 0;
      const ry = parseFloat(node.tag === "circle" ? attrs.r : attrs.ry) || 0;
      if (rx <= 0 || ry <= 0) return;
      const [X, Y] = toXY(cx, cy);
      gfxSave(gfx, s);
      gfx.setFill(s.fill || [0, 0, 0]);
      if (s.stroke) gfx.setStroke(s.stroke);
      gfx.setLineWidth(pt(s.strokeWidth));
      const sizePt = Math.max(rx, ry) * k;
      if (sizePt <= 9) {
        // Data markers / dots → rounded squares (design language).
        gfx.roundedSquareMarker(X, Y, rx * k * 1.7, rx * k * 0.55);
      } else if (node.tag === "circle") {
        gfx.circle(X, Y, rx * k);
      } else {
        gfx.roundedRect(X - rx * k, Y - ry * k, rx * k * 2, ry * k * 2, Math.min(rx, ry) * k * 0.6);
      }
      paintShape(gfx, s, attrs);
      gfx.restore();
      return;
    }
    case "text":
      renderSvgText(node, m, s, ctx);
      return;
    default:
      for (const child of node.children || []) renderNode(child, m, s, ctx);
      return;
  }
}

/** Wraps opacity into q/…/Q and paints fill/stroke. */
function gfxSave(gfx, s) {
  gfx.save();
  if (s.opacity != null && s.opacity < 0.999) gfx.setOpacity(Math.max(0.05, Math.min(1, s.opacity)));
}

function paintShape(gfx, s, attrs) {
  const fillRule = attrs["fill-rule"] === "evenodd" ? "eo" : "nz";
  if (s.fill && s.stroke) gfx.fillStroke(fillRule);
  else if (s.fill) gfx.fill(fillRule);
  else if (s.stroke) gfx.stroke();
}

function renderSvgText(node, mat, state, ctx) {
  const gfx = ctx.gfx;
  const attrs = node.attrs || {};
  const s = inheritState(state, attrs, ctx.gradients);
  // Collect text content (node text + tspans). A tspan with x/dy starts a
  // new positioned segment (the way multi-line diagram labels are built).
  const parts = [];
  const collect = (n, inherited) => {
    let pendingText = inherited || "";
    for (const child of n.children || []) {
      if (child.tag === "#text") pendingText += child.text;
      else if (child.tag === "tspan") {
        if (pendingText.trim()) { parts.push({ text: pendingText, attrs: {} }); pendingText = ""; }
        collect(child, pendingText);
        pendingText = "";
      }
    }
    if (pendingText.trim()) parts.push({ text: pendingText, attrs: {} });
  };
  collect(node, "");
  if (!parts.length) { gfx.restore(); return; }

  gfxSave(gfx, s);
  const baseX = parseFloat(attrs.x || 0);
  const baseY = parseFloat(attrs.y || 0);
  const k = scaleOfMat(mat);
  const fontSizePt = s.fontSize * k;
  const style = {
    font: s.fontWeight >= 700 ? "helvB" : "helv",
    size: fontSizePt,
    color: s.fill || [0.059, 0.09, 0.161],
  };

  let curY = baseY;
  let curX = baseX;
  for (const part of parts) {
    const pAttrs = part.attrs || {};
    if (pAttrs.x !== undefined) curX = parseFloat(pAttrs.x) || curX;
    if (pAttrs.y !== undefined) curY = parseFloat(pAttrs.y) || curY;
    if (pAttrs.dx) curX += parseFloat(pAttrs.dx) || 0;
    if (pAttrs.dy) curY += parseFloat(pAttrs.dy) || 0;
    // Sanitise: drop glyphs the PDF fonts cannot show (emoji etc.).
    const clean = String(part.text).replace(/[\u{1f000}-\u{1ffff}\u{2600}-\u{27bf}\u{fe0f}\u{2b00}-\u{2bff}]/gu, "").replace(/\s+/g, " ").trim();
    if (!clean) continue;
    const runs = [];
    pushSegment(runs, clean, style);
    const cells = runsToCells(runs, { deva: ctx.deva });
    for (const cell of cells) {
      cell.style = { ...cell.style, fontKey: ctx.fontKeys[cell.style.font] || cell.style.font };
    }
    const visible = cells.filter((c) => c.t !== "br");
    const w = lineWidthPt(visible);
    const [X, Y] = applyMat(mat, curX, curY);
    let lx = X;
    if ((pAttrs["text-anchor"] || s.anchor) === "middle") lx = X - w / 2;
    else if ((pAttrs["text-anchor"] || s.anchor) === "end") lx = X - w;
    // SVG y is the BASELINE; drawLine expects the baseline too (top-down).
    drawLine(gfx, lx, Y, visible, { color: style.color, deva: ctx.deva, devaKey: ctx.fontKeys.deva });
  }
  gfx.restore();
}
