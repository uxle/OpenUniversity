# Contributing to OpenKnowledge

Thanks for considering a contribution. OpenKnowledge is designed so you
don't need to touch the core engine to add value — most contributions are
plain `.zl` or `.json` files.

## Ways to contribute

- **Lessons** — add a `lesson*.zl` file under `src/subjects/<subject>/<sub-subject>/lessons/`.
- **MCQs** — add a matching `lesson*mcq.json` file under the sibling `mcq/` folder.
- **Corrections & translations** — edit existing content directly.
- **Code** — engines, components, services, and tooling under `src/`.
- **Accessibility & UI** — improvements to `src/styles/`, `src/accessibility/`.

## Content guidelines

- Every `.zl` file starts with a primary `# Title` heading.
- Block annotations (`@subject`, `@definition`, `@equation`, ...) must be
  correctly opened `{` and closed `}`.
- Subject and sub-subject `id`s are lowercase, alphanumeric, and unique.
- MCQ files must match `schemas/mcq.schema.json` — see that file (and the
  worked example at `src/subjects/science/physics/mcq/lesson1mcq.json`) for
  the exact field names the engine expects.

## Workflow

1. Fork and branch.
2. Add or edit content/code.
3. Run `npm run validate` (and `npm test` for code changes).
4. Open a pull request describing what changed and why.

Please also read `CODE_OF_CONDUCT.md` before contributing.
