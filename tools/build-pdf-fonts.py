#!/usr/bin/env python3
"""build-pdf-fonts.py — build-time Devanagari pipeline for lesson PDF exports.

What it does
------------
1. Collects every Devanagari string in the repo's Hindi content
   (`*.hi.zl` lessons, `*mcq.hi.json` banks) plus the PDF section labels.
2. Shapes each unique word with HarfBuzz (uharfbuzz) — matra reordering,
   conjunct ligatures, mark positioning — exactly as a browser would.
3. Additionally shapes a conjunct safety net: consonant+matra and
   consonant+virama+consonant clusters, so unseen future words still
   render correctly (word → cluster → single-char fallback at runtime).
4. Subsets Noto Sans Devanagari to exactly the glyphs used (layout tables
   dropped — shaping is precomputed) and writes it to public/fonts/.
5. Emits src/pdf/data/devanagari-shaping.json consumed by pdf-fonts.js.

Run `npm run build:pdf-fonts` after adding or editing any Hindi lesson.
Requires: fontTools (preinstalled), uharfbuzz (pip install uharfbuzz).
"""

import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SUBJECTS = os.path.join(ROOT, "src", "subjects")
OUT_JSON = os.path.join(ROOT, "src", "pdf", "data", "devanagari-shaping.json")
OUT_FONT = os.path.join(ROOT, "public", "fonts", "noto-devanagari-pdf-subset.ttf")
SOURCE_FONT = os.path.join(ROOT, "tools", "vendor-fonts", "NotoSansDevanagari-Regular.ttf")
FALLBACK_FONT_URL = (
    "https://github.com/notofonts/notofonts.github.io/raw/main/fonts/"
    "NotoSansDevanagari/hinted/ttf/NotoSansDevanagari-Regular.ttf"
)

# Keep in sync with LABELS.hi in src/pdf/pdf-theme.js — the PDF's own
# section headers must be shapeable even for brand-new Hindi lessons.
UI_WORDS = [
    "अभ्यास", "प्रश्न", "अंतिम", "पृष्ठ", "पर", "उत्तर", "देखने", "से",
    "पहले", "हर", "प्रश्न", "का", "उत्तर", "स्वयं", "दें", "कुंजी",
    "मिनट", "पढ़ें", "निर्यात",
]

DEVA_RE = re.compile(r"[\u0900-\u097f]+")
TOKEN_SPLIT_RE = re.compile(r"(\s+)")

CONSONANTS = list(range(0x915, 0x93a)) + list(range(0x958, 0x960)) + list(range(0x978, 0x980))
MATRAS = list(range(0x93e, 0x94d)) + [0x901, 0x902, 0x903]
VIRAMA = 0x94D


def collect_text():
    # Scan EVERY lesson and MCQ bank, not just *.hi.zl: a large share of the
    # corpus is natively Hindi under default file names (civics, biology, …),
    # and even "English" lessons embed Devanagari glosses. The DEVA_RE filter
    # below makes scanning everything cheap and complete.
    texts = set(UI_WORDS)
    lessons = mcqs = 0
    for dirpath, _dirs, files in os.walk(SUBJECTS):
        for name in files:
            path = os.path.join(dirpath, name)
            try:
                if name.endswith(".zl"):
                    lessons += 1
                    texts.add(open(path, encoding="utf-8").read())
                elif name.endswith(".json") and "mcq" in name:
                    mcqs += 1
                    texts.add(open(path, encoding="utf-8").read())
            except OSError as err:
                print(f"  ! skipped {name}: {err}", file=sys.stderr)
    return texts, lessons, mcqs


def split_clusters(token):
    """Python port of splitDevaClusters() in src/pdf/pdf-text.js.

    The runtime looks up whole clusters with lookupCluster(), so the build
    MUST produce identical cluster strings or the lookup silently degrades
    to per-character (halant-form) rendering."""
    out = []
    cur = ""
    pending_virama = False
    for ch in token:
        cp = ord(ch)
        is_consonant = (0x0915 <= cp <= 0x0939) or (0x0958 <= cp <= 0x095f) or (0x0978 <= cp <= 0x097f)
        is_matra = (0x093e <= cp <= 0x094c) or cp in (0x0945, 0x0946, 0x0949, 0x094a, 0x094b, 0x094e)
        is_virama = cp == 0x094d
        is_mark = cp in (0x0901, 0x0902, 0x0903, 0x093c, 0x0951, 0x0952)
        is_independent = (0x0904 <= cp <= 0x0914) or cp in (
            0x0972, 0x0973, 0x0974, 0x0975, 0x0976, 0x0977, 0x0979,
            0x097a, 0x097b, 0x097c, 0x097e, 0x097f)
        is_digit = 0x0966 <= cp <= 0x096f

        if is_virama:
            cur += ch
            pending_virama = True
            continue
        if pending_virama:
            cur += ch
            pending_virama = False
            continue
        if is_consonant or is_independent or is_digit:
            if cur:
                out.append(cur)
            cur = ch
            continue
        if is_matra or is_mark:
            if not cur:
                out.append(ch)
                continue
            cur += ch
            continue
        if cur:
            out.append(cur)
            cur = ""
        out.append(ch)
    if cur:
        out.append(cur)
    return out


def extract_clusters(words):
    """Every maximal cluster that splitDevaClusters can produce for the
    collected vocabulary — guarantees exact runtime lookupCluster hits."""
    clusters = set()
    for w in words:
        for c in split_clusters(w):
            if c and DEVA_RE.fullmatch(c):
                clusters.add(c)
    return clusters


def extract_tokens(texts):
    words = set()
    for text in texts:
        for run in DEVA_RE.findall(text):
            # split runs into whitespace-ish tokens (runs exclude spaces already)
            for piece in TOKEN_SPLIT_RE.split(run):
                if piece and DEVA_RE.search(piece):
                    words.add(piece)
    # strip surrounding punctuation from tokens
    cleaned = set()
    for w in words:
        cleaned.add(w.strip(".,;:!?\"'()[]{}«»—–-"))
    cleaned.discard("")
    return cleaned


def shape_words(hb, font, words):
    buf = hb.Buffer()
    buf.script = "Deva"
    buf.language = "hin"
    buf.direction = "ltr"
    buf.cluster_level = 1

    def shape(text):
        # NOTE: reuse a single buffer with clear_contents() — uharfbuzz 0.56
        # breaks shaping after clear_contents (add_str then bypasses cmap).
        # Fresh buffers per call are cheap and always correct.
        buf = hb.Buffer()
        buf.script = "Deva"
        buf.language = "hin"
        buf.direction = "ltr"
        buf.add_str(text)
        hb.shape(font, buf)
        out = []
        for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
            out.append([info.codepoint, pos.x_offset, pos.y_offset, pos.x_advance])
        return out

    return shape


def main():
    try:
        import uharfbuzz as hb
    except ImportError:
        print("error: uharfbuzz is required (pip install uharfbuzz)", file=sys.stderr)
        return 1

    if not os.path.exists(SOURCE_FONT):
        import urllib.request
        print("source font missing — downloading…")
        os.makedirs(os.path.dirname(SOURCE_FONT), exist_ok=True)
        urllib.request.urlretrieve(FALLBACK_FONT_URL, SOURCE_FONT)

    texts, lessons, mcqs = collect_text()
    tokens = extract_tokens(texts)
    print(f"collected {len(tokens)} unique Devanagari tokens from {lessons} lesson(s), {mcqs} MCQ bank(s)")
    content_clusters = extract_clusters(tokens)
    print(f"derived {len(content_clusters)} clusters from the vocabulary")

    blob = hb.Blob.from_file_path(SOURCE_FONT)
    face = hb.Face(blob)
    font = hb.Font(face)
    upem = face.upem
    shape = shape_words(hb, font, tokens)

    # ── shape words ──
    words_out = {}
    used_gids = {0}
    for token in sorted(tokens):
        glyphs = shape(token)
        if not glyphs:
            continue
        words_out[token] = glyphs
        for g in glyphs:
            used_gids.add(g[0])

    # ── content-derived clusters (exact runtime lookups) ──
    clusters_out = {}
    for key in sorted(content_clusters):
        glyphs = shape(key)
        if not glyphs:
            continue
        clusters_out[key] = glyphs
        for g in glyphs:
            used_gids.add(g[0])

    # ── conjunct safety net: C+M and C+halant+C (future-proofing) ──
    def cluster_key(cps):
        return "".join(chr(cp) for cp in cps)

    combos = []
    for c in CONSONANTS:
        combos.append([c])
        for m in MATRAS:
            combos.append([c, m])
        for c2 in CONSONANTS:
            combos.append([c, VIRAMA, c2])
    print(f"shaping {len(combos)} conjunct safety-net clusters…")
    for cps in combos:
        key = cluster_key(cps)
        if key in clusters_out:
            continue
        glyphs = shape(key)
        if not glyphs:
            continue
        clusters_out[key] = glyphs
        for g in glyphs:
            used_gids.add(g[0])

    # ── subset the font ──
    from fontTools import subset
    from fontTools.ttLib import TTFont

    options = subset.Options()
    options.layout_features = []          # shaping is precomputed
    options.drop_tables += ["GSUB", "GPOS", "GDEF", "BASE", "JSTF", "kern", "morx", "mort"]
    options.hinting = False
    options.desubroutinize = True
    options.glyph_names = False           # post format 3
    options.notdef_outline = True
    options.recalc_bounds = True
    options.passthrough_tables = False

    font_ttf = TTFont(SOURCE_FONT)
    glyph_order = font_ttf.getGlyphOrder()
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(
        glyphs=[glyph_order[g] for g in sorted(used_gids) if g < len(glyph_order)],
        unicodes=[0x20],  # keep the real space glyph for PDF space emission
    )
    subsetter.subset(font_ttf)
    os.makedirs(os.path.dirname(OUT_FONT), exist_ok=True)
    font_ttf.save(OUT_FONT)

    # ── REMAP shaped glyph IDs to the SUBSET font's glyph order ──
    # Subsetting renumbers glyphs; the runtime addresses glyphs by GID in
    # the embedded file, so every shaped entry must be translated.
    new_order = {name: idx for idx, name in enumerate(font_ttf.getGlyphOrder())}

    def remap(glyphs):
        remapped = []
        for gid, dx, dy, adv in glyphs:
            name = glyph_order[gid] if gid < len(glyph_order) else None
            new_gid = new_order.get(name)
            if new_gid is None:
                return None  # glyph dropped by subsetting — drop the entry
            remapped.append([new_gid, dx, dy, adv])
        return remapped

    words_remapped = {}
    for token, glyphs in words_out.items():
        g = remap(glyphs)
        if g:
            words_remapped[token] = g
    clusters_remapped = {}
    for key, glyphs in clusters_out.items():
        g = remap(glyphs)
        if g:
            clusters_remapped[key] = g

    # ── cmap fallback map (char → gid) for single-char rendering ──
    char_map = {}
    cmap_table = font_ttf.getBestCmap()
    name_to_gid = font_ttf.getReverseGlyphMap()
    for cp, glyph_name in cmap_table.items():
        gid = name_to_gid.get(glyph_name)
        if gid is not None:
            char_map[cp] = gid

    # ── vertical metrics ──
    hhea = font_ttf["hhea"]
    space_gid = char_map.get(0x20)
    space_entry = None
    if space_gid is not None:
        hmtx = font_ttf["hmtx"]
        space_entry = [space_gid, 0, 0, hmtx[font_ttf.getGlyphName(space_gid)][0]]

    data = {
        "source": "Noto Sans Devanagari (build-time subset; shaping precomputed with HarfBuzz)",
        "upem": upem,
        "ascent": hhea.ascent,
        "descent": hhea.descent,
        "space": space_entry,
        "chars": {str(k): v for k, v in sorted(char_map.items())},
        "words": words_remapped,
        "clusters": clusters_remapped,
    }
    os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
    with open(OUT_JSON, "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, separators=(",", ":"))

    size_json = os.path.getsize(OUT_JSON)
    size_font = os.path.getsize(OUT_FONT)
    print(f"wrote {OUT_JSON} ({size_json / 1024:.0f} KB, {len(words_remapped)} words, {len(clusters_remapped)} clusters)")
    print(f"wrote {OUT_FONT} ({size_font / 1024:.0f} KB, {len(new_order)} glyphs)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
