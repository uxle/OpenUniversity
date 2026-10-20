// src/pdf/pdf-doc.js — minimal, dependency-free PDF document writer.
//
// Builds a structurally valid PDF 1.7 file byte by byte:
//   catalog → page tree → pages (shared /Resources) → content streams,
//   classic xref table + trailer (universally supported), optional
//   FlateDecode via the platform CompressionStream (zlib-wrapped deflate,
//   exactly what FlateDecode expects).
//
// Everything rendered from lesson content is vector (text operators, path
// operators, embedded TrueType glyph programs) — the writer deliberately
// has NO image/XObject support at all, so an exported lesson PDF can never
// contain rasterised, pixelating content.

const FLATE_AVAILABLE = (() => {
  try {
    return typeof CompressionStream === "function";
  } catch {
    return false;
  }
})();

function latin1Bytes(str) {
  const out = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) out[i] = str.charCodeAt(i) & 0xff;
  return out;
}

function concatBytes(chunks) {
  let total = 0;
  for (const c of chunks) total += c.length;
  const out = new Uint8Array(total);
  let at = 0;
  for (const c of chunks) {
    out.set(c, at);
    at += c.length;
  }
  return out;
}

async function flate(bytes) {
  if (!FLATE_AVAILABLE) return null;
  try {
    const cs = new CompressionStream("deflate");
    const writer = cs.writable.getWriter();
    writer.write(bytes);
    writer.close();
    const buf = new Uint8Array(await new Response(cs.readable).arrayBuffer());
    return buf;
  } catch {
    return null;
  }
}

function pad(n, width) {
  return String(n).padStart(width, "0");
}

function pdfDate(d = new Date()) {
  return `D:${d.getFullYear()}${pad(d.getMonth() + 1, 2)}${pad(d.getDate(), 2)}${pad(d.getHours(), 2)}${pad(d.getMinutes(), 2)}${pad(d.getSeconds(), 2)}'00'`;
}

/** Escapes a raw WinAnsi byte string for use inside a PDF literal string (). */
export function escapeLiteral(bytesStr) {
  let out = "";
  for (let i = 0; i < bytesStr.length; i++) {
    const c = bytesStr.charCodeAt(i);
    if (c === 0x28 || c === 0x29 || c === 0x5c) out += "\\" + String.fromCharCode(c);
    else if (c < 0x20 || c > 0x7e) out += "\\" + c.toString(8).padStart(3, "0");
    else out += bytesStr[i];
  }
  return out;
}

/** Text-string → UTF-16BE hex string (used for document info metadata). */
export function unicodeHex(str) {
  let hex = "FEFF"; // BOM
  for (const ch of String(str)) {
    const cp = ch.codePointAt(0);
    if (cp > 0xffff) {
      const v = cp - 0x10000;
      hex += pad(((v >> 10) + 0xd800).toString(16), 4) + pad(((v & 0x3ff) + 0xdc00).toString(16), 4);
    } else {
      hex += pad(cp.toString(16), 4);
    }
  }
  return `<${hex}>`;
}

export function createPdfDoc({ title = "Lesson", author = "OpenKnowledge", subject = "" } = {}) {
  // Sparse object table: id → {dict} | {stream:{dictEntries, data, compress}}
  const objects = [];
  const allocateId = () => objects.push(null) && objects.length; // id = 1-based

  const catalogId = allocateId();
  const pagesId = allocateId();
  const infoId = allocateId();
  objects[catalogId - 1] = { dict: `<< /Type /Catalog /Pages ${pagesId} 0 R >>` };
  objects[infoId - 1] = {
    dict:
      `<< /Title ${unicodeHex(title)} /Author ${unicodeHex(author)}` +
      (subject ? ` /Subject ${unicodeHex(subject)}` : "") +
      ` /Producer (OpenKnowledge PDF writer) /Creator (OpenKnowledge) /CreationDate (${pdfDate()}) >>`,
  };

  const pageIds = [];
  const pageContents = []; // {id, ops: string[]}
  let extgstateCounter = 0;
  const extgstates = []; // {id, ca}
  const resourceRefs = { fonts: new Map(), gs: new Map() }; // logicalKey → objId

  function addDictObject(dict) {
    const id = allocateId();
    objects[id - 1] = { dict };
    return id;
  }

  function addStreamObject(dictEntries, data, compress) {
    const id = allocateId();
    objects[id - 1] = { stream: { dictEntries, data, compress } };
    return id;
  }

  // ── Public API ────────────────────────────────────────────────────────────
  return {
    pageWidth: 595.28,
    pageHeight: 841.89,

    /** Registers a simple /Type1 font object; returns its resource key (F1…). */
    addStandardFont(baseFont, { encoding = "WinAnsiEncoding" } = {}) {
      const existing = resourceRefs.fonts.get(`std:${baseFont}:${encoding}`);
      if (existing) return existing.key;
      const id = addDictObject(
        `<< /Type /Font /Subtype /Type1 /BaseFont /${baseFont}` +
          (encoding ? ` /Encoding /${encoding}` : "") +
          ` >>`
      );
      const key = `F${resourceRefs.fonts.size + 1}`;
      resourceRefs.fonts.set(`std:${baseFont}:${encoding}`, { id, key });
      return key;
    },

    /**
     * Registers an embedded TrueType font as a CID (Type0/Identity-H) font —
     * glyphs are addressed directly by GID, so shaped complex-script output
     * (Devanagari conjuncts, reordered matras) reproduces exactly.
     * @param {object} opts
     *   baseFont    PostScript name for the descriptor
     *   ttfBytes    Uint8Array — the (subset) font program for /FontFile2
     *   widths      Float per GID in 1000-unit glyph space (index = GID)
     *   toUnicode   (optional) string body of a CMap stream
     *   flags/italicAngle/ascent/descent/capHeight/stemV — descriptor metrics
     */
    addCIDTrueTypeFont(opts) {
      const {
        baseFont,
        ttfBytes,
        widths,
        toUnicode = "",
        flags = 4,
        italicAngle = 0,
        ascent = 900,
        descent = -200,
        capHeight = 700,
        stemV = 80,
      } = opts;
      const cacheKey = `cid:${baseFont}`;
      const existing = resourceRefs.fonts.get(cacheKey);
      if (existing) return existing.key;

      const descriptorId = allocateId();
      const cidFontId = allocateId();
      const type0Id = allocateId();
      let toUnicodeId = 0;
      if (toUnicode) {
        toUnicodeId = allocateId();
        objects[toUnicodeId - 1] = {
          stream: {
            dictEntries: ``,
            data: toUnicode,
            compress: true,
          },
        };
      }
      const fontFileId = addStreamObject(`/Length1 ${ttfBytes.length}`, ttfBytes, true);

      objects[descriptorId - 1] = {
        dict:
          `<< /Type /FontDescriptor /FontName /${baseFont} /Flags ${flags}` +
          ` /FontBBox [-200 -300 ${2000} ${1100}] /ItalicAngle ${italicAngle}` +
          ` /Ascent ${ascent} /Descent ${descent} /CapHeight ${capHeight} /StemV ${stemV}` +
          ` /FontFile2 ${fontFileId} 0 R >>`,
      };

      // /W array — DENSE coverage as an INDIRECT array object, using the
      // spec form `c [w1 … wn]` (widths for CIDs c..c+n-1). The triplet form
      // `c1 c2 [array]` is NOT valid PDF — poppler rightly rejects it with
      // "Bad widths array in Type 0 font". /DW and /CIDToGIDMap stay
      // omitted: the array covers every glyph, and both keys default to the
      // values we want (/DW 1000 is unreachable; map defaults to Identity).
      let wArrayRef = "";
      let lastGid = -1;
      for (let gid = 0; gid < widths.length; gid++) {
        if (widths[gid] != null) lastGid = gid;
      }
      if (lastGid >= 0) {
        const dense = [];
        for (let gid = 0; gid <= lastGid; gid++) {
          const w = widths[gid];
          dense.push(Math.max(0, Math.round(w == null ? 0 : w)));
        }
        const wArrayId = addDictObject(`[0 [${dense.join(" ")}]]`);
        wArrayRef = `${wArrayId} 0 R`;
      }

      objects[cidFontId - 1] = {
        dict:
          `<< /Type /Font /Subtype /CIDFontType2 /BaseFont /${baseFont}` +
          ` /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >>` +
          ` /FontDescriptor ${descriptorId} 0 R` +
          (wArrayRef ? ` /W ${wArrayRef}` : "") +
          ` >>`,
      };
      objects[type0Id - 1] = {
        dict:
          `<< /Type /Font /Subtype /Type0 /BaseFont /${baseFont} /Encoding /Identity-H` +
          ` /DescendantFonts [${cidFontId} 0 R]` +
          (toUnicodeId ? ` /ToUnicode ${toUnicodeId} 0 R` : "") +
          ` >>`,
      };

      const key = `F${resourceRefs.fonts.size + 1}`;
      resourceRefs.fonts.set(cacheKey, { id: type0Id, key });
      return key;
    },

    /** Registers an ExtGState with constant alpha; returns resource key. */
    addExtGState(ca = 1, CA = ca) {
      const k = `${ca.toFixed(3)}:${CA.toFixed(3)}`;
      const existing = resourceRefs.gs.get(k);
      if (existing) return existing.key;
      const id = addDictObject(`<< /Type /ExtGState /ca ${ca.toFixed(3)} /CA ${CA.toFixed(3)} >>`);
      const key = `GS${++extgstateCounter}`;
      resourceRefs.gs.set(k, { id, key });
      return key;
    },

    /** Adds a page; returns a handle the renderers draw into. */
    addPage() {
      const contentId = allocateId();
      const pageId = allocateId();
      const ops = [];
      pageContents[pageId] = { id: contentId, ops };
      pageIds.push(pageId);
      return {
        id: pageId,
        ops,
        width: 595.28,
        height: 841.89,
        addOp(str) { ops.push(str); },
      };
    },

    /** Serialises the whole file. Returns { bytes, size }. */
    async finalize() {
      // Shared /Resources for every page.
      const fontRefs = [...resourceRefs.fonts.values()].map((r) => `/${r.key} ${r.id} 0 R`).join(" ");
      const gsRefs = [...resourceRefs.gs.values()].map((r) => `/${r.key} ${r.id} 0 R`).join(" ");
      const resourcesId = addDictObject(
        `<< /Font << ${fontRefs} >>` + (gsRefs ? ` /ExtGState << ${gsRefs} >>` : "") + ` >>`
      );

      objects[catalogId - 1] = { dict: `<< /Type /Catalog /Pages ${pagesId} 0 R >>` };
      objects[pagesId - 1] = {
        dict: `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`,
      };

      for (const pageId of pageIds) {
        const { id: contentId, ops } = pageContents[pageId];
        objects[pageId - 1] = {
          dict:
            `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595.28 841.89]` +
            ` /Resources ${resourcesId} 0 R /Contents ${contentId} 0 R >>`,
        };
        const content = ops.join("\n");
        objects[contentId - 1] = { stream: { dictEntries: ``, data: content, compress: true } };
      }

      // ── Serialise ─────────────────────────────────────────────────────────
      const chunks = [];
      let offset = 0;
      const offsets = new Array(objects.length).fill(0);

      const push = (c) => {
        chunks.push(typeof c === "string" ? latin1Bytes(c) : c);
        offset += chunks[chunks.length - 1].length;
      };

      push("%PDF-1.7\n%\xE2\xE3\xCF\xD3\n");

      for (let i = 0; i < objects.length; i++) {
        const obj = objects[i];
        if (!obj) continue;
        const id = i + 1;
        offsets[i] = offset;
        push(`${id} 0 obj\n`);
        if (obj.dict != null) {
          push(obj.dict + "\nendobj\n");
        } else {
          let data = obj.stream.data;
          let filter = "";
          if (obj.stream.compress) {
            const compressed = await flate(typeof data === "string" ? latin1Bytes(data) : data);
            if (compressed) {
              data = compressed;
              filter = " /Filter /FlateDecode";
            }
          }
          const bytes = typeof data === "string" ? latin1Bytes(data) : data;
          push(
            `<< /Length ${bytes.length}${filter}` +
              (obj.stream.dictEntries ? ` ${obj.stream.dictEntries}` : "") +
            ` >>\nstream\n`
          );
          push(bytes);
          push("\nendstream\nendobj\n");
        }
      }

      const xrefOffset = offset;
      const size = objects.length + 1;
      let xref = `xref\n0 ${size}\n0000000000 65535 f \n`;
      for (let i = 0; i < objects.length; i++) {
        xref += `${pad(offsets[i] || 0, 10)} 00000 ${objects[i] ? "n" : "f"} \n`;
      }
      push(xref);
      push(`trailer\n<< /Size ${size} /Root ${catalogId} 0 R /Info ${infoId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);

      const bytes = concatBytes(chunks);
      return { bytes, size: bytes.length };
    },

    /** Debug/test hook: raw ops per page (page order). */
    getPageOps() {
      return pageIds.map((id) => (pageContents[id] ? [...pageContents[id].ops] : []));
    },

    /** Browser download helper (no-op data path in Node). */
    async download(filename) {
      const { bytes } = await this.finalize();
      const view = new Uint8Array(bytes); // copy — avoids detached-buffer surprises
      if (typeof Blob === "function" && typeof URL?.createObjectURL === "function") {
        const blob = new Blob([view], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
      }
      return bytes;
    },
  };
}
