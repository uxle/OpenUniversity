// src/pdf/pdf-fonts.js — font registry and metrics for the PDF exporter.
//
// Latin text uses the PDF standard-14 fonts (no embedding needed): they
// render as real vector outlines in every viewer, at every zoom — the
// "never pixelates" guarantee. Math glyphs WinAnsi can't show (√, π, ≤, …)
// switch to the Symbol standard font. Devanagari uses an embedded,
// build-time-subsetted TrueType font drawn as positioned glyph IDs
// (Type0/Identity-H), so shaped conjuncts and matras reproduce exactly.

import { STD_FONT_WIDTHS, SYMBOL_MAP } from "./data/standard-font-widths.js";

// ── Standard-14 font styles ──────────────────────────────────────────────────

export const STD_STYLES = Object.freeze({
  helv:    { base: "Helvetica",           widths: STD_FONT_WIDTHS.Helv,    bold: false, italic: false },
  helvB:   { base: "Helvetica-Bold",      widths: STD_FONT_WIDTHS.HelvB,   bold: true,  italic: false },
  helvI:   { base: "Helvetica-Oblique",   widths: STD_FONT_WIDTHS.HelvI,   bold: false, italic: true  },
  helvBI:  { base: "Helvetica-BoldOblique", widths: STD_FONT_WIDTHS.HelvBI, bold: true, italic: true  },
  times:   { base: "Times-Roman",         widths: STD_FONT_WIDTHS.Times,   bold: false, italic: false },
  timesB:  { base: "Times-Bold",          widths: STD_FONT_WIDTHS.TimesB,  bold: true,  italic: false },
  timesI:  { base: "Times-Italic",        widths: STD_FONT_WIDTHS.TimesI,  bold: false, italic: true  },
  timesBI: { base: "Times-BoldItalic",    widths: STD_FONT_WIDTHS.TimesBI, bold: true,  italic: true  },
  courier: { base: "Courier",             widths: STD_FONT_WIDTHS.Courier, bold: false, italic: false },
  symbol:  { base: "Symbol",              widths: null,                    bold: false, italic: false, isSymbol: true },
});

const SPECIALS_WINANSI = Object.freeze({
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85,
  0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a,
  0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92,
  0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
  0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c,
  0x017e: 0x9e, 0x0178: 0x9f,
});

/** Unicode codepoint → WinAnsi byte (0 = not representable). */
export function winAnsiByte(cp) {
  if (cp >= 0x20 && cp <= 0x7e) return cp;
  if (cp === 0x09 || cp === 0x0a || cp === 0x0d) return 0x20;
  if (cp >= 0xa0 && cp <= 0xff) return cp;
  return SPECIALS_WINANSI[cp] || 0;
}

/** Unicode codepoint → Symbol-font byte for math glyphs, else 0. */
export function symbolByte(cp) {
  const entry = SYMBOL_MAP[cp];
  return entry ? entry[0] : 0;
}

/** Width (1/1000 em) of a WinAnsi byte in a standard style. */
export function stdWidth(byte, styleKey) {
  const style = STD_STYLES[styleKey];
  if (!style || !style.widths || byte < 32) return 0;
  return style.widths[byte - 32] || 0;
}

/** Width (1/1000 em) of a Symbol-font byte. */
export function symbolWidth(byte) {
  const raw = STD_FONT_WIDTHS.SymbolRaw || {};
  return raw[byte] || 600;
}

/** Registers every standard style in the doc; returns styleKey → resourceKey. */
export function registerStandardFonts(doc) {
  const map = {};
  for (const [styleKey, style] of Object.entries(STD_STYLES)) {
    map[styleKey] = doc.addStandardFont(style.base, { encoding: style.isSymbol ? null : "WinAnsiEncoding" });
  }
  return map;
}

// ── Embedded Devanagari (TrueType subset, built by tools/build-pdf-fonts.py) ─

function readU16(dv, off) { return dv.getUint16(off); }
function readI16(dv, off) { return dv.getInt16(off); }
function readU32(dv, off) { return dv.getUint32(off); }

/** Minimal TrueType table reader — only what embedding + widths need. */
export function parseTtf(bytes) {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.length < 12 || readU32(dv, 0) !== 0x00010000) {
    // Also accept 'true'/OTTO tag for robustness
    const tag = dv.getUint32(0);
    if (tag !== 0x74727565 && tag !== 0x4f54544f) throw new Error("Not a TrueType font");
  }
  const numTables = readU16(dv, 4);
  const tables = {};
  for (let i = 0; i < numTables; i++) {
    const rec = 12 + i * 16;
    const tag = String.fromCharCode(bytes[rec], bytes[rec + 1], bytes[rec + 2], bytes[rec + 3]);
    tables[tag] = { offset: readU32(dv, rec + 8), length: readU32(dv, rec + 12) };
  }
  for (const t of ["head", "hhea", "maxp", "hmtx", "cmap"]) {
    if (!tables[t]) throw new Error(`Font missing ${t} table`);
  }
  const head = tables.head.offset;
  const hhea = tables.hhea.offset;
  const maxp = tables.maxp.offset;
  const unitsPerEm = readU16(dv, head + 18) || 1000;
  const ascent = readI16(dv, hhea + 4);
  const descent = readI16(dv, hhea + 6);
  const numGlyphs = readU16(dv, maxp + 4);
  const numHMetrics = readU16(dv, hhea + 34);
  const hmtx = tables.hmtx.offset;
  const advanceOf = (gid) => {
    if (gid < 0) return 0;
    const idx = Math.min(gid, numHMetrics - 1);
    return readU16(dv, hmtx + idx * 4);
  };

  // cmap — prefer format 12 (3/10), then format 4 (3/1 or 0/x).
  const cmapOff = tables.cmap.offset;
  const nSub = readU16(dv, cmapOff + 2);
  let sub12 = 0, sub4 = 0;
  for (let i = 0; i < nSub; i++) {
    const rec = cmapOff + 4 + i * 8;
    const pid = readU16(dv, rec), eid = readU16(dv, rec + 2);
    const off = cmapOff + readU32(dv, rec + 4);
    const format = readU16(dv, off);
    if (format === 12 && pid === 3 && eid === 10) sub12 = off;
    if (format === 4 && ((pid === 3 && eid === 1) || pid === 0)) sub4 = sub4 || off;
  }
  const charMap = new Map();
  if (sub12) {
    const nGroups = readU32(dv, sub12 + 12);
    for (let g = 0; g < nGroups; g++) {
      const go = sub12 + 16 + g * 12;
      const start = readU32(dv, go), end = readU32(dv, go + 4), sGid = readU32(dv, go + 8);
      for (let cp = start; cp <= end && cp - start < 65536; cp++) {
        charMap.set(cp, sGid + (cp - start));
      }
    }
  }
  if (sub4 && charMap.size < 256) {
    const segCountX2 = readU16(dv, sub4 + 6);
    const segCount = segCountX2 >> 1;
    const endOff = sub4 + 14;
    const startOff = endOff + segCountX2 + 2;
    const deltaOff = startOff + segCountX2;
    const rangeOff = deltaOff + segCountX2;
    for (let s = 0; s < segCount; s++) {
      const end = readU16(dv, endOff + s * 2);
      const start = readU16(dv, startOff + s * 2);
      const delta = readI16(dv, deltaOff + s * 2);
      const range = readU16(dv, rangeOff + s * 2);
      if (start === 0xffff) continue;
      for (let cp = start; cp <= end; cp++) {
        let gid;
        if (range === 0) gid = (cp + delta) & 0xffff;
        else {
          const gi = rangeOff + s * 2 + range + (cp - start) * 2;
          gid = readU16(dv, gi);
          if (gid) gid = (gid + delta) & 0xffff;
        }
        if (gid && !charMap.has(cp)) charMap.set(cp, gid);
      }
    }
  }
  return { unitsPerEm, ascent, descent, numGlyphs, advanceOf, charMap };
}

function toUnicodeHex(str) {
  let hex = "";
  for (const ch of str) {
    const cp = ch.codePointAt(0);
    if (cp > 0xffff) {
      const v = cp - 0x10000;
      hex += ((v >> 10) + 0xd800).toString(16).padStart(4, "0") + ((v & 0x3ff) + 0xdc00).toString(16).padStart(4, "0");
    } else hex += cp.toString(16).padStart(4, "0");
  }
  return hex;
}

/**
 * Embeds the subsetted Devanagari font and wires up the shaping lookups.
 * @returns runtime object { resourceKey, upem, space, lookupWord, lookupCluster, lookupChar }
 *   where lookups return arrays of [gid, dx, dy, advance] in font units.
 */
export function createDevanagariFont(doc, { ttfBytes, shaping }) {
  const font = parseTtf(ttfBytes);
  const upem = font.unitsPerEm;
  const scale = 1000 / upem;

  // Per-GID widths (1000-unit space) for the /W array.
  const maxGid = font.numGlyphs;
  const widths = new Array(maxGid).fill(null);
  for (let gid = 0; gid < maxGid; gid++) {
    const adv = font.advanceOf(gid);
    if (adv) widths[gid] = Math.round(adv * scale);
  }

  // ToUnicode CMap — map every shaped gid back to its source text so the
  // PDF stays searchable/copyable for Devanagari too. Recording order
  // matters: base consonants/matras are shared by thousands of words, so
  // single CHAR mappings (one glyph → one character) must win, then
  // clusters, and whole WORDS only for glyphs nothing smaller explains.
  const gidText = new Map();
  const recordText = (glyphs, text) => {
    if (!glyphs || !text) return;
    for (const g of glyphs) {
      const gid = g[0];
      if (gid && !gidText.has(gid)) gidText.set(gid, text);
    }
  };
  for (const [cpStr, gid] of Object.entries(shaping.chars || {})) {
    const cp = Number(cpStr);
    const ch = String.fromCodePoint(cp);
    if (gid && !gidText.has(gid)) gidText.set(gid, ch);
  }
  for (const [cluster, glyphs] of Object.entries(shaping.clusters || {})) {
    recordText(glyphs, [...cluster].join(""));
  }
  for (const [word, glyphs] of Object.entries(shaping.words || {})) recordText(glyphs, word);

  const bfEntries = [...gidText.entries()]
    .filter(([gid]) => gid > 0)
    .slice(0, 5000)
    .map(([gid, text]) => `<${gid.toString(16).padStart(4, "0")}> <${toUnicodeHex(text)}>`);
  const blocks = [];
  for (let i = 0; i < bfEntries.length; i += 100) {
    blocks.push(`${Math.min(100, bfEntries.length - i)} beginbfchar\n${bfEntries.slice(i, i + 100).join("\n")}\nendbfchar`);
  }
  const toUnicode = blocks.length
    ? `/CIDInit /ProcSet findresource begin\n12 dict begin\nbegincmap\n/CMapName /OKDevanagari def\n/CMapType 2 def\n1 begincodespacerange\n<0000> <FFFF>\nendcodespacerange\n${blocks.join("\n")}\nendcmap\nCMapName currentdict /CMap defineresource pop\nend\nend`
    : "";

  const resourceKey = doc.addCIDTrueTypeFont({
    baseFont: "NotoSansDevanagari-PDF",
    ttfBytes,
    widths,
    toUnicode,
    flags: 4,
    ascent: Math.round(font.ascent * scale),
    descent: Math.round(font.descent * scale),
    capHeight: Math.round(font.ascent * scale * 0.72),
    stemV: 76,
  });

  const words = shaping.words || {};
  const clusters = shaping.clusters || {};
  const charMapStatic = shaping.chars || {};

  return {
    resourceKey,
    upem,
    ascent: font.ascent,
    descent: font.descent,
    space: shaping.space || null,
    lookupWord(text) {
      const g = words[text];
      return g ? g.map((x) => x.slice()) : null;
    },
    lookupCluster(text) {
      const g = clusters[text];
      return g ? g.map((x) => x.slice()) : null;
    },
    lookupChar(cp) {
      const gid = charMapStatic[cp] ?? font.charMap.get(cp) ?? 0;
      if (!gid) return null;
      return [[gid, 0, 0, font.advanceOf(gid)]];
    },
    gidWidth(gid) {
      return (font.advanceOf(gid) || 0) * scale; // 1000-unit space
    },
  };
}

/**
 * Embeds the build-time symbol subset (tools/build-pdf-symbols.py) for
 * glyphs the standard-14 fonts cannot show: box-drawing art, ₹,
 * sub/superscript digits, ✓/✗, arrows. Glyphs are addressed by GID
 * (Type0/Identity-H); the cmap is read straight from the file — no sidecar
 * shaping data needed since these codepoints have no complex shaping.
 * @returns runtime { resourceKey, upem, has(cp), lookup(cp) → [gid,dx,dy,adv] }
 */
export function createSymbolExtraFont(doc, ttfBytes) {
  const font = parseTtf(ttfBytes);
  const upem = font.unitsPerEm;
  const scale = 1000 / upem;

  const maxGid = font.numGlyphs;
  const widths = new Array(maxGid).fill(null);
  for (let gid = 0; gid < maxGid; gid++) {
    const adv = font.advanceOf(gid);
    if (adv) widths[gid] = Math.round(adv * scale);
  }

  // ToUnicode so copied symbols come out as the real characters.
  const gidText = new Map();
  for (const [cp, gid] of font.charMap) {
    if (gid && !gidText.has(gid)) gidText.set(gid, String.fromCodePoint(cp));
  }
  const bfEntries = [...gidText.entries()]
    .filter(([gid]) => gid > 0)
    .map(([gid, text]) => `<${gid.toString(16).padStart(4, "0")}> <${toUnicodeHex(text)}>`);
  const blocks = [];
  for (let i = 0; i < bfEntries.length; i += 100) {
    blocks.push(`${Math.min(100, bfEntries.length - i)} beginbfchar\n${bfEntries.slice(i, i + 100).join("\n")}\nendbfchar`);
  }
  const toUnicode = blocks.length
    ? `/CIDInit /ProcSet findresource begin\n12 dict begin\nbegincmap\n/CMapName /OKSymbols def\n/CMapType 2 def\n1 begincodespacerange\n<0000> <FFFF>\nendcodespacerange\n${blocks.join("\n")}\nendcmap\nCMapName currentdict /CMap defineresource pop\nend\nend`
    : "";

  const resourceKey = doc.addCIDTrueTypeFont({
    baseFont: "DejaVuSans-PDFSymbols",
    ttfBytes,
    widths,
    toUnicode,
    flags: 4,
    ascent: Math.round(font.ascent * scale),
    descent: Math.round(font.descent * scale),
    capHeight: Math.round(font.ascent * scale * 0.72),
    stemV: 76,
  });

  return {
    resourceKey,
    upem,
    has(cp) { return font.charMap.has(cp); },
    lookup(cp) {
      const gid = font.charMap.get(cp);
      if (!gid) return null;
      return [gid, 0, 0, font.advanceOf(gid)];
    },
  };
}
