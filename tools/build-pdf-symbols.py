#!/usr/bin/env python3
"""build-pdf-symbols.py — build-time symbol font for lesson PDF exports.

Why
---
The PDF writer uses the PDF standard-14 fonts (vector, never pixelate) plus
the Symbol font for math glyphs. Neither can show characters the lessons
actually use: box-drawing art in code blocks (─ │ ├ └ …), the rupee sign,
sub/superscript digits (H₂SO₄, x⁴), check/cross marks, and arrows the
Symbol map lacks (↑ ↓ ↕ ▼ ▶ …). Today those codepoints are silently DROPPED.

What it does
------------
1. Scans every lesson (.zl) and MCQ bank for non-WinAnsi, non-Symbol,
   non-Devanagari codepoints (content-driven coverage).
2. Unions them with a guaranteed base set (full box-drawing block, common
   arrows/geometric shapes, full sub/superscript digits, checks, rupee).
3. Subsets DejaVu Sans to exactly those glyphs (cmap kept) and writes
   public/fonts/pdf-symbols-subset.ttf. No sidecar JSON is needed: the
   runtime reads the cmap directly via parseTtf().

Run `npm run build:pdf-symbols` after adding content that uses new symbols.
Requires: fontTools (preinstalled).
"""

import glob
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SUBJECTS = os.path.join(ROOT, "src", "subjects")
OUT_FONT = os.path.join(ROOT, "public", "fonts", "pdf-symbols-subset.ttf")
REPORT = os.path.join(ROOT, "src", "pdf", "data", "symbol-coverage.json")
SOURCE_FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

# WinAnsi special-area codepoints the standard fonts already cover.
WINANSI_SPECIALS = {
    0x20AC, 0x201A, 0x0192, 0x201E, 0x2026, 0x2020, 0x2021, 0x02C6, 0x2030,
    0x0160, 0x2039, 0x0152, 0x017D, 0x2018, 0x2019, 0x201C, 0x201D, 0x2022,
    0x2013, 0x2014, 0x02DC, 0x2122, 0x0161, 0x203A, 0x0153, 0x017E, 0x0178,
}

# Base coverage regardless of what the corpus currently uses.
BASE_CODEPOINTS = (
    list(range(0x2500, 0x2580))            # box drawing (full block)
    + list(range(0x2190, 0x2195))          # arrows ← ↑ → ↓ ↔ ↕ (→/←/↔ also in Symbol; harmless overlap)
    + [0x2195, 0x2196, 0x2197, 0x2198, 0x2199]
    + [0x25B2, 0x25BC, 0x25B6, 0x25C0, 0x25B8, 0x25C2]      # ▲ ▶ ◀ ▸ ◂ triangles
    + [0x25A0, 0x25A1, 0x25AA, 0x25AB, 0x25CF, 0x25CB, 0x25CE, 0x25C6, 0x25C7, 0x2605, 0x2606]
    + list(range(0x2713, 0x2719))          # ✓ ✓ ✗ ✘ checks/crosses
    + list(range(0x2080, 0x209C))          # subscript digits + letters ₀-₉ ₐ-ₜ
    + [0x2070, 0x2074, 0x2075, 0x2076, 0x2077, 0x2078, 0x2079, 0x207B, 0x207C, 0x207D, 0x207E, 0x207F]
    + [0x20B9]                             # ₹ rupee
    + [0x2206, 0x2205, 0x2208, 0x2209, 0x221D, 0x2260, 0x2261, 0x2264, 0x2265, 0x2248, 0x221E]
    + [0x22A5, 0x2220, 0x222B, 0x2211, 0x221A, 0x221E, 0x2236, 0x2237]
    + [0x00B0, 0x00B7, 0x2011, 0x2015, 0x2044, 0x2043, 0x00A0]
    + [0x2705, 0x274C, 0x2714, 0x2716]     # heavy check/cross (kept for safety)
)


def collect_text():
    texts = []
    for dirpath, _dirs, files in os.walk(SUBJECTS):
        for name in files:
            if name.endswith(".zl") or ("mcq" in name and name.endswith(".json")):
                try:
                    texts.append(open(os.path.join(dirpath, name), encoding="utf-8").read())
                except OSError as err:
                    print(f"  ! skipped {name}: {err}", file=sys.stderr)
    return texts


SYMBOL_WIDTHS_JS = os.path.join(ROOT, "src", "pdf", "data", "standard-font-widths.js")
_symbol_keys_cache = None


def is_symbol_mapped(cp):
    """Codepoints already served by the PDF Symbol standard font."""
    global _symbol_keys_cache
    if _symbol_keys_cache is None:
        import re
        src = open(SYMBOL_WIDTHS_JS, encoding="utf-8").read()
        body = src.split("SYMBOL_MAP", 1)[1]
        _symbol_keys_cache = set(int(k) for k in re.findall(r'"(\d+)"\s*:', body))
    return cp in _symbol_keys_cache


def main():
    texts = collect_text()
    used = set()
    for t in texts:
        for ch in t:
            cp = ord(ch)
            if cp < 0xA0:
                continue
            if cp in WINANSI_SPECIALS:
                continue
            if 0x0900 <= cp <= 0x097F:
                continue  # Devanagari — served by the shaped Noto subset
            if 0x1F000 <= cp <= 0x1AFFF or cp in (0xFE0F, 0x200D):
                continue  # emoji — deliberately dropped at render time
            if is_symbol_mapped(cp):
                continue
            used.add(cp)

    codepoints = sorted(used | set(BASE_CODEPOINTS))
    print(f"content uses {len(used)} extra codepoints; building subset with {len(codepoints)} glyphs")

    from fontTools import subset
    from fontTools.ttLib import TTFont

    options = subset.Options()
    options.layout_features = []
    options.drop_tables += ["GSUB", "GPOS", "GDEF", "BASE", "kern"]
    options.hinting = False
    options.glyph_names = False
    options.notdef_outline = True
    options.recalc_bounds = True

    font = TTFont(SOURCE_FONT)
    cmap = font.getBestCmap()
    missing = [cp for cp in codepoints if cp not in cmap]
    if missing:
        print(f"  ! {len(missing)} codepoints not in DejaVu Sans (skipped): "
              + " ".join(f"U+{cp:04X}" for cp in missing[:24]))
    present = [cp for cp in codepoints if cp in cmap]

    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=present)
    subsetter.subset(font)

    os.makedirs(os.path.dirname(OUT_FONT), exist_ok=True)
    font.save(OUT_FONT)
    size = os.path.getsize(OUT_FONT)
    print(f"wrote {OUT_FONT} ({size / 1024:.1f} KB, {len(present)} codepoints)")

    os.makedirs(os.path.dirname(REPORT), exist_ok=True)
    with open(REPORT, "w", encoding="utf-8") as fh:
        json.dump({
            "source": "DejaVu Sans (build-time subset; cmap-only, no shaping needed)",
            "license": "DejaVu Sans — Bitstream Vera license (free redistribution, embedding permitted)",
            "codepoints": [f"U+{cp:04X}" for cp in present],
        }, fh, indent=1)
    print(f"wrote {REPORT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
