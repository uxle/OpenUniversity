// src/pdf/pdf-theme.js — design tokens for the lesson PDF exporter.
//
// The PDF is a designed artefact, not a page dump: one restrained palette,
// a single whitespace scale on a 4 pt grid, and rounded rectangles (never
// circles) for every accent — chips, option boxes, markers, page numbers.
//
// Whitespace philosophy (calibrated, not generous, not cramped):
//   margins 56 pt sides / 64 pt top+bottom on A4 (~20 mm), vertical rhythm
//   in multiples of 4 pt, paragraph gap 8, section gap 24, leading ~1.45.

export const PAGE = Object.freeze({
  width: 595.28,   // A4 portrait, pt
  height: 841.89,
  marginTop: 64,
  marginBottom: 64,
  marginLeft: 56,
  marginRight: 56,
  // Derived helpers — kept in sync with the values above.
  get contentWidth() { return this.width - this.marginLeft - this.marginRight; },   // 483.28
  get contentHeight() { return this.height - this.marginTop - this.marginBottom; }, // 713.89
});

// 4 pt-based spacing scale. Only these values may be used for gaps.
export const SPACE = Object.freeze({
  xs: 4,
  sm: 8,    // paragraph gap
  md: 12,   // grouped-block inner gap
  lg: 16,   // card padding / list-group gap
  xl: 24,   // section gap (h2 space-before)
  xxl: 32,  // major part boundary (e.g. before practice section)
});

export const INK = Object.freeze({
  // text
  heading:  [0.059, 0.090, 0.161],  // #0F172A slate-900
  body:     [0.118, 0.161, 0.231],  // #1E293B slate-800
  muted:    [0.392, 0.455, 0.545],  // #64748B slate-500
  faint:    [0.580, 0.639, 0.722],  // #94A3B8 slate-400
  // surfaces & lines
  hairline: [0.886, 0.910, 0.941],  // #E2E8F0 slate-200
  panel:    [0.973, 0.980, 0.988],  // #F8FAFC slate-50
  panel2:   [0.945, 0.961, 0.976],  // #F1F5F9 slate-100
  white:    [1, 1, 1],
  // accent (indigo family — matches the app's primary)
  accent:       [0.310, 0.275, 0.898], // #4F46E5 indigo-600
  accentSoft:   [0.933, 0.949, 1.0],   // #EEF2FF indigo-50
  accentInk:    [0.216, 0.188, 0.639], // #3730A3 indigo-800
  // admonition tints: [text-ink, bg, bar]
  amber:  { ink: [0.706, 0.325, 0.035], bg: [0.996, 0.953, 0.780], bar: [0.965, 0.686, 0.216] },
  red:    { ink: [0.725, 0.110, 0.110], bg: [0.996, 0.886, 0.886], bar: [0.937, 0.318, 0.314] },
  green:  { ink: [0.016, 0.471, 0.341], bg: [0.820, 0.980, 0.898], bar: [0.322, 0.769, 0.541] },
  sky:    { ink: [0.012, 0.412, 0.631], bg: [0.878, 0.949, 0.996], bar: [0.357, 0.702, 0.902] },
  violet: { ink: [0.427, 0.157, 0.851], bg: [0.929, 0.914, 0.996], bar: [0.643, 0.404, 0.937] },
  slate:  { ink: [0.278, 0.333, 0.412], bg: [0.973, 0.980, 0.988], bar: [0.580, 0.639, 0.722] },
  indigo: { ink: [0.216, 0.188, 0.639], bg: [0.933, 0.949, 1.0],   bar: [0.310, 0.275, 0.898] },
});

// Admonition kinds → tint family + default label.
export const ADMONITION_KINDS = Object.freeze({
  definition: { tint: INK.indigo, label: "Definition" },
  important:  { tint: INK.amber,  label: "Important" },
  warning:    { tint: INK.red,    label: "Warning" },
  caution:    { tint: INK.red,    label: "Caution" },
  tip:        { tint: INK.green,  label: "Tip" },
  note:       { tint: INK.slate,  label: "Note" },
  info:       { tint: INK.sky,    label: "Info" },
  example:    { tint: INK.violet, label: "Example" },
  summary:    { tint: INK.indigo, label: "Summary" },
});

// Corner radii — rounded rectangles only, no circles anywhere.
export const RADIUS = Object.freeze({
  chip: 4,     // letter chips, small markers
  box: 7,      // option boxes, math panels
  card: 10,    // admonitions, table frames, intro panel
  media: 11,   // chart/diagram frames
});

// Typography scale (pt). One family per role; sizes tuned for A4 reading.
export const TYPE = Object.freeze({
  title:    { size: 23,   leading: 29 },  // lesson h1
  meta:     { size: 8.8,  leading: 13 },
  h2:       { size: 14.5, leading: 19 },
  h3:       { size: 11.8, leading: 16 },
  body:     { size: 10.2, leading: 14.8 },
  small:    { size: 8.8,  leading: 12.6 },
  caption:  { size: 8.3,  leading: 11.5 },
  option:   { size: 10.0, leading: 14 },
  rationale:{ size: 8.8,  leading: 12.4 },
});

// Localised section labels (keys mirror app languages; unknown → English).
export const LABELS = Object.freeze({
  en: Object.freeze({
    practice: "Practice Questions",
    practiceBadge: "Practice",
    practiceHint: "Answer every question before checking the key on the last page.",
    answerKey: "Answer Key",
    answerBadge: "Answers",
    exported: "Exported",
    minRead: "min read",
    questions: "questions",
  }),
  hi: Object.freeze({
    practice: "अभ्यास प्रश्न",
    practiceBadge: "अभ्यास",
    practiceHint: "अंतिम पृष्ठ पर उत्तर देखने से पहले हर प्रश्न का उत्तर स्वयं दें।",
    answerKey: "उत्तर कुंजी",
    answerBadge: "उत्तर",
    exported: "निर्यात",
    minRead: "मिनट पढ़ें",
    questions: "प्रश्न",
  }),
});

export function labelsFor(lang) {
  return LABELS[lang] || LABELS.en;
}

export function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || "").trim());
  if (!m) return [0, 0, 0];
  const n = parseInt(m[1], 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
