# Examples

Standalone demos, kept outside `src/` so they can be opened directly in a
browser (including via `file://`) without any build step.

- **mcq-demo/** — the original MCQ engine prototype (UX/UI Heuristics
  sample questions), useful for testing `src/engines/mcq-engine.js` in
  isolation from the rest of the app shell.

Note: this `examples/` folder isn't in `tree.md` yet — it was added to
preserve the original prototype content without forcing it into the
`src/subjects/` content taxonomy, where it doesn't cleanly fit any
existing subject. Worth a decision: fold it into `tree.md` officially, or
keep it as a dev-only convenience.
