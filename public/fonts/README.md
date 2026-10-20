# Fonts

This app deliberately ships **no bundled webfont files**.

Typography uses the CSS system-font stack defined in
`src/styles/variables.css` (`--ou-font-sans` / `--ou-font-mono`), so text
renders instantly with zero network requests — no FOUT, no layout shift,
no font files to license or host.

Icons are the only external typography asset: Font Awesome Free (solid)
loads from a CDN via `<link>` in `index.html`, and is consumed through
the helper in `src/utils/icon.js`. Note that `src/engines/mcq-engine.js`
intentionally avoids it (plain ✓/✕ glyphs) so that file works offline via
`file://`.

To self-host a custom typeface instead:

1. Drop the `.woff2` files in this folder.
2. Add `@font-face` rules to `src/styles/typography.css`.
3. Update `--ou-font-sans` in `src/styles/variables.css`.
4. Keep files subsetted and preloaded (`<link rel="preload" as="font">`)
   to protect load performance.
