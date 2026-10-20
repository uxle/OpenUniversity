// src/pdf/pdf-graphics.js — vector drawing layer on top of a page's content
// stream. Coordinates are TOP-DOWN (y grows downwards, like the layout code
// and SVG); the layer flips into PDF space internally.
//
// Design contract: every accent is a rounded rectangle — `roundedRect`,
// `roundedSquareMarker`, chips, frames. True circles only exist where the
// data itself is circular (pie/donut arcs), never as decoration.

const K = 0.5522847498307936; // circle → cubic bezier constant

function fmt(n) {
  // 2 decimals keeps streams compact; 0.01 pt precision is invisible at A4.
  return (Math.round(n * 100) / 100).toString();
}

function rgb(rgbArr) {
  return `${fmt(rgbArr[0])} ${fmt(rgbArr[1])} ${fmt(rgbArr[2])}`;
}

export function createGraphics(page, doc) {
  const ops = page.addOp;
  const H = page.height;
  const yOf = (y) => H - y; // top-down → PDF space

  // Path accumulator — flushed by fill()/stroke()/clip().
  let path = [];
  let start = null;
  let cur = null;

  function emitPath() {
    if (path.length) {
      ops(path.join(" "));
      path = [];
    }
  }

  const gfx = {
    page,
    /** Raw content-stream escape hatch (used by the text engine). */
    addOp(str) { ops(str); },
    save() { ops("q"); },
    restore() { ops("Q"); },

    setFill(c) { ops(`${rgb(c)} rg`); },
    setStroke(c) { ops(`${rgb(c)} RG`); },
    setLineWidth(w) { ops(`${fmt(w)} w`); },
    setDash(segments = [], phase = 0) {
      ops(segments.length
        ? `[${segments.map((s) => fmt(s)).join(" ")}] ${fmt(phase)} d`
        : `[] 0 d`);
    },
    setLineCap(cap) { ops(`${cap} J`); },       // 0 butt · 1 round · 2 square
    setLineJoin(join) { ops(`${join} j`); },    // 0 miter · 1 round · 2 bevel

    /** Constant alpha via a shared ExtGState (registered once per alpha). */
    setOpacity(alpha = 1) {
      if (alpha >= 0.999) return;
      const key = doc.addExtGState(alpha);
      ops(`/${key} gs`);
    },

    // ── Path building ───────────────────────────────────────────────────────
    moveTo(x, y) {
      emitPath();
      cur = start = [x, yOf(y)];
      path.push(`${fmt(cur[0])} ${fmt(cur[1])} m`);
      return gfx;
    },
    lineTo(x, y) {
      cur = [x, yOf(y)];
      path.push(`${fmt(cur[0])} ${fmt(cur[1])} l`);
      return gfx;
    },
    cubicTo(c1x, c1y, c2x, c2y, x, y) {
      cur = [x, yOf(y)];
      path.push(
        `${fmt(c1x)} ${fmt(yOf(c1y))} ${fmt(c2x)} ${fmt(yOf(c2y))} ${fmt(cur[0])} ${fmt(cur[1])} c`
      );
      return gfx;
    },
    /** Quadratic → cubic. */
    quadTo(qx, qy, x, y) {
      const cx = cur ? cur[0] : 0, cy = cur ? cur[1] : 0;
      const c1x = cx + (2 / 3) * (qx - cx);
      const c1y = cy + (2 / 3) * (yOf(qy) - cy);
      const c2x = x + (2 / 3) * (qx - x);
      const c2y = yOf(y) + (2 / 3) * (yOf(qy) - yOf(y));
      return gfx.cubicTo(c1x, c1y, c2x, c2y, x, y);
    },
    /**
     * Elliptical arc (SVG endpoint parameterisation → cubic segments).
     * Handles the two out-of-range-radii scale-up cases.
     */
    arcTo(x, y, rx, ry, rotationDeg = 0, largeArc = false, sweep = false) {
      if (!cur) return gfx;
      if (!rx || !ry) return gfx.lineTo(x, y);
      const x1 = cur[0], y1 = cur[1];
      const x2 = x, y2 = yOf(y);
      rx = Math.abs(rx); ry = Math.abs(ry);
      const phi = (rotationDeg * Math.PI) / 180;
      const cosP = Math.cos(phi), sinP = Math.sin(phi);
      const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2;
      const x1p = cosP * dx + sinP * dy;
      const y1p = -sinP * dx + cosP * dy;
      const l2 = x1p * x1p / (rx * rx) + y1p * y1p / (ry * ry);
      if (l2 > 1) {
        const s = Math.sqrt(l2);
        rx *= s; ry *= s;
      }
      const sign = largeArc !== sweep ? 1 : -1;
      const num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
      const den = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
      const co = sign * Math.sqrt(Math.max(0, num / (den || 1)));
      const cxp = (co * rx * y1p) / ry;
      const cyp = (-co * ry * x1p) / rx;
      const cx = cosP * cxp - sinP * cyp + (x1 + x2) / 2;
      const cy = sinP * cxp + cosP * cyp + (y1 + y2) / 2;

      const angle = (ux, uy, vx, vy) => {
        const dot = ux * vx + uy * vy;
        const len = Math.sqrt(ux * ux + uy * uy) * Math.sqrt(vx * vx + vy * vy);
        let a = Math.acos(Math.min(1, Math.max(-1, dot / (len || 1))));
        if (ux * vy - uy * vx < 0) a = -a;
        return a;
      };
      const theta1 = angle(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
      let dTheta = angle((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
      if (!sweep && dTheta > 0) dTheta -= 2 * Math.PI;
      if (sweep && dTheta < 0) dTheta += 2 * Math.PI;

      const segments = Math.ceil(Math.abs(dTheta) / (Math.PI / 2)) || 1;
      const delta = dTheta / segments;
      const t = (4 / 3) * Math.tan(delta / 4);
      let th = theta1;
      const px = (a) => cosP * rx * Math.cos(a) - sinP * ry * Math.sin(a) + cx;
      const py = (a) => sinP * rx * Math.cos(a) + cosP * ry * Math.sin(a) + cy;
      const pdx = (a) => -cosP * rx * Math.sin(a) - sinP * ry * Math.cos(a);
      const pdy = (a) => sinP * rx * Math.sin(a) + cosP * ry * Math.cos(a);
      for (let i = 0; i < segments; i++) {
        const a1 = th, a2 = th + delta;
        gfx.cubicTo(
          px(a1) + t * pdx(a1), py(a1) + t * pdy(a1),
          px(a2) - t * pdx(a2), py(a2) - t * pdy(a2),
          px(a2), py(a2)
        );
        th = a2;
      }
      return gfx;
    },
    close() {
      path.push("h");
      cur = start;
      return gfx;
    },

    /** Rounded-rectangle subpath (the house accent shape). */
    roundedRect(x, y, w, h, r) {
      r = Math.min(r, w / 2, h / 2);
      const k = K * r;
      gfx.moveTo(x + r, y);
      gfx.lineTo(x + w - r, y);
      gfx.cubicTo(x + w - r + k, y, x + w, y + r - k, x + w, y + r);
      gfx.lineTo(x + w, y + h - r);
      gfx.cubicTo(x + w, y + h - r + k, x + w - r + k, y + h, x + w - r, y + h);
      gfx.lineTo(x + r, y + h);
      gfx.cubicTo(x + r - k, y + h, x, y + h - r + k, x, y + h - r);
      gfx.lineTo(x, y + r);
      gfx.cubicTo(x, y + r - k, x - r + k, y, x + r, y);
      return gfx;
    },

    rect(x, y, w, h) {
      emitPath();
      ops(`${fmt(x)} ${fmt(yOf(y + h))} ${fmt(w)} ${fmt(h)} re`);
      return gfx;
    },

    line(x1, y1, x2, y2) {
      emitPath();
      ops(`${fmt(x1)} ${fmt(yOf(y1))} m ${fmt(x2)} ${fmt(yOf(y2))} l S`);
      return gfx;
    },

    fill(rule = "nz") {
      emitPath();
      ops(rule === "eo" ? "f*" : "f");
      return gfx;
    },
    stroke() {
      emitPath();
      ops("S");
      return gfx;
    },
    fillStroke(rule = "nz") {
      emitPath();
      ops(rule === "eo" ? "B*" : "B");
      return gfx;
    },
    /** Ends current path as a clipping region (consumes the path). */
    clip(rule = "nz") {
      emitPath();
      ops(rule === "eo" ? "W* n" : "W n");
      return gfx;
    },

    // ── Composite drawing helpers ────────────────────────────────────────────
    drawRoundedRect(x, y, w, h, r, { fill, strokeColor, lineWidth = 0.8, clip = false } = {}) {
      gfx.save();
      gfx.roundedRect(x, y, w, h, r);
      if (clip) {
        gfx.clip();
      } else if (fill && strokeColor) {
        gfx.setFill(fill);
        gfx.setStroke(strokeColor);
        gfx.setLineWidth(lineWidth);
        gfx.fillStroke();
      } else if (fill) {
        gfx.setFill(fill);
        gfx.fill();
      } else if (strokeColor) {
        gfx.setStroke(strokeColor);
        gfx.setLineWidth(lineWidth);
        gfx.stroke();
      }
      gfx.restore();
      return gfx;
    },

    /**
     * Rounded-square data marker — replaces SVG <circle> markers per the
     * design language ("rectangles with rounded corners instead of circles").
     */
    roundedSquareMarker(cx, cy, size, r, { fill, strokeColor, lineWidth = 1 } = {}) {
      gfx.drawRoundedRect(cx - size / 2, cy - size / 2, size, size, r, { fill, strokeColor, lineWidth });
      return gfx;
    },

    /** True circle — only for inherently circular data (rare). */
    circle(cx, cy, r, { fill, strokeColor, lineWidth = 1 } = {}) {
      gfx.save();
      gfx.moveTo(cx + r, cy);
      gfx.arcTo(cx, cy - r, r, r, 0, false, false);
      gfx.arcTo(cx - r, cy, r, r, 0, false, false);
      gfx.arcTo(cx, cy + r, r, r, 0, false, false);
      gfx.arcTo(cx + r, cy, r, r, 0, false, false);
      if (fill && strokeColor) {
        gfx.setFill(fill); gfx.setStroke(strokeColor); gfx.setLineWidth(lineWidth); gfx.fillStroke();
      } else if (fill) { gfx.setFill(fill); gfx.fill(); }
      else if (strokeColor) { gfx.setStroke(strokeColor); gfx.setLineWidth(lineWidth); gfx.stroke(); }
      gfx.restore();
      return gfx;
    },

    /** Thin horizontal rule with rounded ends (hairlines with soft caps). */
    hairline(x, y, w, color, thickness = 0.7) {
      gfx.save();
      gfx.setStroke(color);
      gfx.setLineWidth(thickness);
      gfx.setLineCap(1);
      gfx.line(x, y, x + w, y);
      gfx.restore();
      return gfx;
    },
  };

  return gfx;
}
