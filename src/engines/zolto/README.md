# src/engines/zolto/

`zolto-engine.js` is the integration point between OpenKnowledge and
the [Zolto](https://github.com/uxle/Zolto) markup engine
([`zolto` on npm, v1.0.2+](https://www.npmjs.com/package/zolto)).
It re-exports the parts OpenKnowledge needs under clearer names
(`compileLesson`, `parseLesson`, `renderLesson`, `parseLessonInteractive`,
`renderLessonInteractive`) and extends Zolto's own no-throw guarantee
to cover non-string input (e.g. a lesson fetch that returns `undefined`).

## vendor/zolto/

The real Zolto source is **vendored** here rather than loaded from npm or a
CDN, to preserve the repo's zero-install, zero-network-call-at-runtime
property for static hosting (GitHub Pages, `file://` double-click, etc.).
The vendored copy corresponds to `zolto@1.0.2`. To update it, copy the
`src/` directory of the new release over `vendor/zolto/` and run
`npm test` to confirm nothing broke.

## History

Before `zolto@1.0.2` was published to npm, this folder contained
`mini-zolto.js` — a hand-written, intentionally partial implementation
covering Phases 1/2/4 of the Zolto spec (headings, paragraphs, lists,
tables, admonitions, basic math). It served the same purpose as the
vendored copy does now, but only covered a subset of the syntax. It's
been removed now that the real, complete package is available.
