# Repository structure

```
OpenKnowledge/
├── .github
│   └── social-preview.png
├── assets
│   ├── branding/  (17 files)
│   │   ├── screens/  (7 files)
│   │   │   ├── app-preview.png
│   │   │   ├── dark.png
│   │   │   ├── home.png
│   │   │   ├── lesson.png
│   │   │   ├── mobile.png
│   │   │   ├── quiz.png
│   │   │   └── subjects.png
│   │   ├── banner-readme.png
│   │   ├── logo-horizontal-dark.svg
│   │   ├── logo-horizontal.svg
│   │   ├── logo-mark-dark.svg
│   │   ├── logo-mark.svg
│   │   ├── mascot-owl.png
│   │   ├── poster-portrait.png
│   │   ├── poster-square.png
│   │   ├── poster-story.png
│   │   └── social-preview.png
├── examples
│   ├── mcq-demo
│   │   ├── index.html
│   │   └── lesson1mcq.json
│   └── README.md
├── public/  (9 files)
│   ├── fonts
│   │   └── README.md
│   ├── icons/  (5 files)
│   │   ├── icon-180.png
│   │   ├── icon-192.png
│   │   ├── icon-32.png
│   │   ├── icon-512-maskable.png
│   │   └── icon-512.png
│   ├── manifest.json
│   ├── robots.txt
│   └── sitemap.xml
├── schemas/  (6 files)
│   ├── contribution.schema.json
│   ├── lesson.schema.json
│   ├── mcq.schema.json
│   ├── sub-subject.schema.json
│   ├── subject.schema.json
│   └── user.schema.json
├── src/  (1044 files)
│   ├── accessibility/  (4 files)
│   │   ├── accessibility-settings.js
│   │   ├── focus-manager.js
│   │   ├── keyboard.js
│   │   └── screen-reader.js
│   ├── app/  (6 files)
│   │   ├── app.js
│   │   ├── bootstrap.js
│   │   ├── config.js
│   │   ├── constants.js
│   │   ├── routes.js
│   │   └── state.js
│   ├── components/  (65 files)
│   │   ├── account/  (5 files)
│   │   │   ├── account-settings.js
│   │   │   ├── login-form.js
│   │   │   ├── logout.js
│   │   │   ├── profile.js
│   │   │   └── register-form.js
│   │   ├── bookmarks/  (4 files)
│   │   │   ├── bookmark-button.js
│   │   │   ├── bookmark-folder.js
│   │   │   ├── bookmark-list.js
│   │   │   └── bookmark-manager.js
│   │   ├── common/  (12 files)
│   │   │   ├── accordion.js
│   │   │   ├── back-to-top.js
│   │   │   ├── button.js
│   │   │   ├── command-palette.js
│   │   │   ├── dialog.js
│   │   │   ├── dropdown.js
│   │   │   ├── empty-state.js
│   │   │   ├── modal.js
│   │   │   ├── spinner.js
│   │   │   ├── tabs.js
│   │   │   ├── toast.js
│   │   │   └── tooltip.js
│   │   ├── layout/  (5 files)
│   │   │   ├── breadcrumb.js
│   │   │   ├── footer.js
│   │   │   ├── header.js
│   │   │   ├── mobile-navigation.js
│   │   │   └── sidebar.js
│   │   ├── lesson/  (13 files)
│   │   │   ├── export-pdf-button.js
│   │   │   ├── glossary.js
│   │   │   ├── key-points.js
│   │   │   ├── language-switcher.js
│   │   │   ├── last-lesson.js
│   │   │   ├── lesson-content.js
│   │   │   ├── lesson-header.js
│   │   │   ├── lesson-navigation.js
│   │   │   ├── lesson-progress.js
│   │   │   ├── lesson-section.js
│   │   │   ├── quiz-cta.js
│   │   │   ├── reading-progress.js
│   │   │   └── related-lessons.js
│   │   ├── mcq/  (7 files)
│   │   │   ├── mcq-container.js
│   │   │   ├── mcq-feedback.js
│   │   │   ├── mcq-option.js
│   │   │   ├── mcq-progress.js
│   │   │   ├── mcq-question.js
│   │   │   ├── mcq-result.js
│   │   │   └── mcq-review.js
│   │   ├── notes/  (4 files)
│   │   │   ├── note-card.js
│   │   │   ├── note-editor.js
│   │   │   ├── note-list.js
│   │   │   └── notes-panel.js
│   │   ├── progress/  (5 files)
│   │   │   ├── achievements.js
│   │   │   ├── progress-card.js
│   │   │   ├── progress-chart.js
│   │   │   ├── progress-ring.js
│   │   │   └── streak.js
│   │   ├── search/  (5 files)
│   │   │   ├── search-box.js
│   │   │   ├── search-filters.js
│   │   │   ├── search-history.js
│   │   │   ├── search-results.js
│   │   │   └── search-suggestions.js
│   │   ├── subject/  (5 files)
│   │   │   ├── subject-card.js
│   │   │   ├── subject-header.js
│   │   │   ├── subject-identity.js
│   │   │   ├── subject-list.js
│   │   │   └── subject-progress.js
│   ├── core/  (8 files)
│   │   ├── cache.js
│   │   ├── error-handler.js
│   │   ├── event-bus.js
│   │   ├── loader.js
│   │   ├── logger.js
│   │   ├── router.js
│   │   ├── store.js
│   │   └── validator.js
│   ├── data/  (5 files)
│   │   ├── categories.json
│   │   ├── lesson-registry.json
│   │   ├── search-index.json
│   │   ├── site-details.json
│   │   └── subject-registry.json
│   ├── engines/  (193 files)
│   │   ├── zolto/  (182 files)
│   │   │   ├── vendor/  (180 files)
│   │   │   │   ├── zolto/  (180 files)
│   │   │   │   │   ├── animation/  (10 files)
│   │   │   │   │   │   ├── ast.js
│   │   │   │   │   │   ├── diagnostics.js
│   │   │   │   │   │   ├── easing.js
│   │   │   │   │   │   ├── index.js
│   │   │   │   │   │   ├── keyframes.js
│   │   │   │   │   │   ├── parser.js
│   │   │   │   │   │   ├── renderer.js
│   │   │   │   │   │   ├── styles.js
│   │   │   │   │   │   ├── tokenizer.js
│   │   │   │   │   │   └── validator.js
│   │   │   │   │   ├── chart/  (12 files)
│   │   │   │   │   │   ├── renderers
│   │   │   │   │   │   │   └── index.js
│   │   │   │   │   │   ├── ast.js
│   │   │   │   │   │   ├── datasets.js
│   │   │   │   │   │   ├── diagnostics.js
│   │   │   │   │   │   ├── index.js
│   │   │   │   │   │   ├── parser.js
│   │   │   │   │   │   ├── renderer.js
│   │   │   │   │   │   ├── statistics.js
│   │   │   │   │   │   ├── svg.js
│   │   │   │   │   │   ├── themes.js
│   │   │   │   │   │   ├── tokenizer.js
│   │   │   │   │   │   └── validator.js
│   │   │   │   │   ├── component/  (13 files)
│   │   │   │   │   │   ├── ast.js
│   │   │   │   │   │   ├── builtins.js
│   │   │   │   │   │   ├── diagnostics.js
│   │   │   │   │   │   ├── index.js
│   │   │   │   │   │   ├── macros.js
│   │   │   │   │   │   ├── parser.js
│   │   │   │   │   │   ├── props.js
│   │   │   │   │   │   ├── registry.js
│   │   │   │   │   │   ├── renderer.js
│   │   │   │   │   │   ├── slots.js
│   │   │   │   │   │   ├── templates.js
│   │   │   │   │   │   ├── tokenizer.js
│   │   │   │   │   │   └── validator.js
│   │   │   │   │   ├── diagram/  (20 files)
│   │   │   │   │   │   ├── layout/  (10 files)
│   │   │   │   │   │   │   ├── circular.js
│   │   │   │   │   │   │   ├── force.js
│   │   │   │   │   │   │   ├── grid.js
│   │   │   │   │   │   │   ├── hierarchical.js
│   │   │   │   │   │   │   ├── index.js
│   │   │   │   │   │   │   ├── manual.js
│   │   │   │   │   │   │   ├── orthogonal.js
│   │   │   │   │   │   │   ├── radial.js
│   │   │   │   │   │   │   ├── sequence.js
│   │   │   │   │   │   │   └── tree.js
│   │   │   │   │   │   ├── ast.js
│   │   │   │   │   │   ├── diagnostics.js
│   │   │   │   │   │   ├── graph.js
│   │   │   │   │   │   ├── index.js
│   │   │   │   │   │   ├── parser.js
│   │   │   │   │   │   ├── renderer.js
│   │   │   │   │   │   ├── svg.js
│   │   │   │   │   │   ├── themes.js
│   │   │   │   │   │   ├── tokenizer.js
│   │   │   │   │   │   └── validator.js
│   │   │   │   │   ├── ecosystem/  (16 files)
│   │   │   │   │   │   ├── access-control.js
│   │   │   │   │   │   ├── ast.js
│   │   │   │   │   │   ├── audit.js
│   │   │   │   │   │   ├── backup.js
│   │   │   │   │   │   ├── branching.js
│   │   │   │   │   │   ├── collaboration.js
│   │   │   │   │   │   ├── comments.js
│   │   │   │   │   │   ├── diagnostics.js
│   │   │   │   │   │   ├── export.js
│   │   │   │   │   │   ├── index.js
│   │   │   │   │   │   ├── packaging.js
│   │   │   │   │   │   ├── publishing.js
│   │   │   │   │   │   ├── sync.js
│   │   │   │   │   │   ├── validator.js
│   │   │   │   │   │   ├── versioning.js
│   │   │   │   │   │   └── workspace.js
│   │   │   │   │   ├── interactive/  (13 files)
│   │   │   │   │   │   ├── ast.js
│   │   │   │   │   │   ├── bindings.js
│   │   │   │   │   │   ├── diagnostics.js
│   │   │   │   │   │   ├── flashcards.js
│   │   │   │   │   │   ├── index.js
│   │   │   │   │   │   ├── parser.js
│   │   │   │   │   │   ├── polls.js
│   │   │   │   │   │   ├── quizzes.js
│   │   │   │   │   │   ├── renderer.js
│   │   │   │   │   │   ├── state.js
│   │   │   │   │   │   ├── styles.js
│   │   │   │   │   │   ├── tokenizer.js
│   │   │   │   │   │   └── validator.js
│   │   │   │   │   ├── layout/  (13 files)
│   │   │   │   │   │   ├── ast.js
│   │   │   │   │   │   ├── canvas.js
│   │   │   │   │   │   ├── css.js
│   │   │   │   │   │   ├── diagnostics.js
│   │   │   │   │   │   ├── flex.js
│   │   │   │   │   │   ├── grid.js
│   │   │   │   │   │   ├── index.js
│   │   │   │   │   │   ├── pages.js
│   │   │   │   │   │   ├── parser.js
│   │   │   │   │   │   ├── presentation.js
│   │   │   │   │   │   ├── renderer.js
│   │   │   │   │   │   ├── tokenizer.js
│   │   │   │   │   │   └── validator.js
│   │   │   │   │   ├── math/  (10 files)
│   │   │   │   │   │   ├── ast.js
│   │   │   │   │   │   ├── diagnostics.js
│   │   │   │   │   │   ├── index.js
│   │   │   │   │   │   ├── lexer.js
│   │   │   │   │   │   ├── mathml.js
│   │   │   │   │   │   ├── parser.js
│   │   │   │   │   │   ├── renderer.js
│   │   │   │   │   │   ├── svg.js
│   │   │   │   │   │   ├── tokenizer.js
│   │   │   │   │   │   └── validator.js
│   │   │   │   │   ├── plugin/  (15 files)
│   │   │   │   │   │   ├── api.js
│   │   │   │   │   │   ├── ast.js
│   │   │   │   │   │   ├── data-providers.js
│   │   │   │   │   │   ├── diagnostics.js
│   │   │   │   │   │   ├── directives.js
│   │   │   │   │   │   ├── hooks.js
│   │   │   │   │   │   ├── index.js
│   │   │   │   │   │   ├── lifecycle.js
│   │   │   │   │   │   ├── manifest.js
│   │   │   │   │   │   ├── permissions.js
│   │   │   │   │   │   ├── registry.js
│   │   │   │   │   │   ├── renderers.js
│   │   │   │   │   │   ├── sandbox.js
│   │   │   │   │   │   ├── themes.js
│   │   │   │   │   │   └── validator.js
│   │   │   │   │   ├── theme/  (10 files)
│   │   │   │   │   │   ├── accessibility.js
│   │   │   │   │   │   ├── ast.js
│   │   │   │   │   │   ├── diagnostics.js
│   │   │   │   │   │   ├── engine.js
│   │   │   │   │   │   ├── index.js
│   │   │   │   │   │   ├── packages.js
│   │   │   │   │   │   ├── palettes.js
│   │   │   │   │   │   ├── switching.js
│   │   │   │   │   │   ├── tokens.js
│   │   │   │   │   │   └── validator.js
│   │   │   │   │   ├── tooling/  (16 files)
│   │   │   │   │   │   ├── ast.js
│   │   │   │   │   │   ├── cache.js
│   │   │   │   │   │   ├── completion.js
│   │   │   │   │   │   ├── diagnostics-engine.js
│   │   │   │   │   │   ├── diagnostics.js
│   │   │   │   │   │   ├── editor.js
│   │   │   │   │   │   ├── formatter.js
│   │   │   │   │   │   ├── hover.js
│   │   │   │   │   │   ├── incremental.js
│   │   │   │   │   │   ├── index.js
│   │   │   │   │   │   ├── indexer.js
│   │   │   │   │   │   ├── linter.js
│   │   │   │   │   │   ├── lsp.js
│   │   │   │   │   │   ├── refactor.js
│   │   │   │   │   │   ├── search.js
│   │   │   │   │   │   └── watcher.js
│   │   │   │   │   ├── vector/  (11 files)
│   │   │   │   │   │   ├── ast.js
│   │   │   │   │   │   ├── diagnostics.js
│   │   │   │   │   │   ├── index.js
│   │   │   │   │   │   ├── parser.js
│   │   │   │   │   │   ├── renderer.js
│   │   │   │   │   │   ├── scene.js
│   │   │   │   │   │   ├── styles.js
│   │   │   │   │   │   ├── svg.js
│   │   │   │   │   │   ├── tokenizer.js
│   │   │   │   │   │   ├── transforms.js
│   │   │   │   │   │   └── validator.js
│   │   │   │   │   ├── ast.js
│   │   │   │   │   ├── diagnostics.js
│   │   │   │   │   ├── directive-lexer.js
│   │   │   │   │   ├── directive-renderer.js
│   │   │   │   │   ├── directives.js
│   │   │   │   │   ├── i18n.js
│   │   │   │   │   ├── inline-parser.js
│   │   │   │   │   ├── lexer.js
│   │   │   │   │   ├── math-ast.js
│   │   │   │   │   ├── math-mathml.js
│   │   │   │   │   ├── math-matrix.js
│   │   │   │   │   ├── math-parser.js
│   │   │   │   │   ├── math-renderer.js
│   │   │   │   │   ├── math-symbols.js
│   │   │   │   │   ├── math-tokenizer.js
│   │   │   │   │   ├── math-validator.js
│   │   │   │   │   ├── parser.js
│   │   │   │   │   ├── renderer.js
│   │   │   │   │   ├── tokenizer.js
│   │   │   │   │   ├── validator.js
│   │   │   │   │   └── zolto.js
│   │   │   ├── README.md
│   │   │   └── zolto-engine.js
│   │   ├── account-engine.js
│   │   ├── bookmark-engine.js
│   │   ├── contribution-engine.js
│   │   ├── lesson-engine.js
│   │   ├── mcq-engine.js
│   │   ├── navigation-engine.js
│   │   ├── notes-engine.js
│   │   ├── progress-engine.js
│   │   ├── recommendation-engine.js
│   │   ├── search-engine.js
│   │   └── subject-engine.js
│   ├── i18n
│   │   ├── en.json
│   │   ├── hi.json
│   │   └── i18n.js
│   ├── pages/  (15 files)
│   │   ├── about.js
│   │   ├── bookmarks.js
│   │   ├── contribute.js
│   │   ├── home.js
│   │   ├── lesson.js
│   │   ├── mcq.js
│   │   ├── not-found.js
│   │   ├── notes.js
│   │   ├── profile.js
│   │   ├── progress.js
│   │   ├── search.js
│   │   ├── settings.js
│   │   ├── sub-subject.js
│   │   ├── subject.js
│   │   └── subjects.js
│   ├── services/  (11 files)
│   │   ├── account-service.js
│   │   ├── bookmark-service.js
│   │   ├── content-service.js
│   │   ├── contribution-service.js
│   │   ├── lesson-title-service.js
│   │   ├── notes-service.js
│   │   ├── progress-service.js
│   │   ├── search-service.js
│   │   ├── sync-service.js
│   │   ├── translation-service.js
│   │   └── zolto-service.js
│   ├── storage/  (6 files)
│   │   ├── bookmark-storage.js
│   │   ├── indexed-db.js
│   │   ├── local-storage.js
│   │   ├── notes-storage.js
│   │   ├── progress-storage.js
│   │   └── user-storage.js
│   ├── styles/  (37 files)
│   │   ├── account
│   │   │   └── account.css
│   │   ├── components/  (13 files)
│   │   │   ├── accents.css
│   │   │   ├── bottom-nav.css
│   │   │   ├── buttons.css
│   │   │   ├── cards.css
│   │   │   ├── command-palette.css
│   │   │   ├── dropdown.css
│   │   │   ├── modal.css
│   │   │   ├── navbar.css
│   │   │   ├── progress.css
│   │   │   ├── reading-extras.css
│   │   │   ├── sidebar.css
│   │   │   ├── tabs.css
│   │   │   └── toast.css
│   │   ├── lesson/  (5 files)
│   │   │   ├── glossary.css
│   │   │   ├── lesson-content.css
│   │   │   ├── lesson-navigation.css
│   │   │   ├── lesson.css
│   │   │   └── zolto-content.css
│   │   ├── mcq/  (4 files)
│   │   │   ├── mcq.css
│   │   │   ├── options.css
│   │   │   ├── question.css
│   │   │   └── results.css
│   │   ├── search
│   │   │   └── search.css
│   │   ├── themes
│   │   │   ├── dark.css
│   │   │   ├── high-contrast.css
│   │   │   └── light.css
│   │   ├── accessibility.css
│   │   ├── animations.css
│   │   ├── layout.css
│   │   ├── main.bundle.css
│   │   ├── main.css
│   │   ├── print.css
│   │   ├── reset.css
│   │   ├── responsive.css
│   │   ├── typography.css
│   │   └── variables.css
│   ├── subjects/  (678 files)
│   │   ├── civics/  (38 files)
│   │   │   ├── lessons/  (18 files)
│   │   │   │   ├── citizenship.zl
│   │   │   │   ├── constituent-assembly.zl
│   │   │   │   ├── directive-principles-of-state-policy.zl
│   │   │   │   ├── election-commission.zl
│   │   │   │   ├── fundamental-duties.zl
│   │   │   │   ├── fundamental-rights.zl
│   │   │   │   ├── judiciary.zl
│   │   │   │   ├── local-self-government.zl
│   │   │   │   ├── making-of-the-constitution.zl
│   │   │   │   ├── parliament.zl
│   │   │   │   ├── parts-of-the-constitution.zl
│   │   │   │   ├── preamble.zl
│   │   │   │   ├── president-and-vice-president.zl
│   │   │   │   ├── prime-minister-and-council-of-ministers.zl
│   │   │   │   ├── schedules.zl
│   │   │   │   ├── sources-of-the-constitution.zl
│   │   │   │   ├── state-legislature-and-governor.zl
│   │   │   │   └── union-and-its-territory.zl
│   │   │   ├── mcq/  (18 files)
│   │   │   │   ├── citizenshipmcq.json
│   │   │   │   ├── constituent-assemblymcq.json
│   │   │   │   ├── directive-principles-of-state-policymcq.json
│   │   │   │   ├── election-commissionmcq.json
│   │   │   │   ├── fundamental-dutiesmcq.json
│   │   │   │   ├── fundamental-rightsmcq.json
│   │   │   │   ├── judiciarymcq.json
│   │   │   │   ├── local-self-governmentmcq.json
│   │   │   │   ├── making-of-the-constitutionmcq.json
│   │   │   │   ├── parliamentmcq.json
│   │   │   │   ├── parts-of-the-constitutionmcq.json
│   │   │   │   ├── preamblemcq.json
│   │   │   │   ├── president-and-vice-presidentmcq.json
│   │   │   │   ├── prime-minister-and-council-of-ministersmcq.json
│   │   │   │   ├── schedulesmcq.json
│   │   │   │   ├── sources-of-the-constitutionmcq.json
│   │   │   │   ├── state-legislature-and-governormcq.json
│   │   │   │   └── union-and-its-territorymcq.json
│   │   │   ├── details.zl
│   │   │   └── index.json
│   │   ├── computer-science/  (52 files)
│   │   │   ├── ai-reasoning/  (8 files)
│   │   │   │   ├── lessons
│   │   │   │   │   ├── blood-relation-reasoning.zl
│   │   │   │   │   ├── clock-reasoning.zl
│   │   │   │   │   └── directions-and-distance-reasoning.zl
│   │   │   │   ├── mcq
│   │   │   │   │   ├── blood-relation-reasoningmcq.json
│   │   │   │   │   ├── clock-reasoningmcq.json
│   │   │   │   │   └── directions-and-distance-reasoningmcq.json
│   │   │   │   ├── details.zl
│   │   │   │   └── index.json
│   │   │   ├── algorithms/  (12 files)
│   │   │   │   ├── lessons/  (5 files)
│   │   │   │   │   ├── dynamic-programming-and-greedy.zl
│   │   │   │   │   ├── graph-algorithms.zl
│   │   │   │   │   ├── lesson1.zl
│   │   │   │   │   ├── recursion-and-divide-and-conquer.zl
│   │   │   │   │   └── sorting-algorithms.zl
│   │   │   │   ├── mcq/  (5 files)
│   │   │   │   │   ├── dynamic-programming-and-greedymcq.json
│   │   │   │   │   ├── graph-algorithmsmcq.json
│   │   │   │   │   ├── lesson1mcq.json
│   │   │   │   │   ├── recursion-and-divide-and-conquermcq.json
│   │   │   │   │   └── sorting-algorithmsmcq.json
│   │   │   │   ├── details.zl
│   │   │   │   └── index.json
│   │   │   ├── networking/  (10 files)
│   │   │   │   ├── lessons/  (4 files)
│   │   │   │   │   ├── application-protocols-and-security.zl
│   │   │   │   │   ├── ip-addressing-and-routing.zl
│   │   │   │   │   ├── lesson1.zl
│   │   │   │   │   └── osi-and-tcp-ip-models.zl
│   │   │   │   ├── mcq/  (4 files)
│   │   │   │   │   ├── application-protocols-and-securitymcq.json
│   │   │   │   │   ├── ip-addressing-and-routingmcq.json
│   │   │   │   │   ├── lesson1mcq.json
│   │   │   │   │   └── osi-and-tcp-ip-modelsmcq.json
│   │   │   │   ├── details.zl
│   │   │   │   └── index.json
│   │   │   ├── operating-systems/  (10 files)
│   │   │   │   ├── lessons/  (4 files)
│   │   │   │   │   ├── file-systems-deadlocks-and-virtualization.zl
│   │   │   │   │   ├── lesson1.zl
│   │   │   │   │   ├── memory-management.zl
│   │   │   │   │   └── processes-and-scheduling.zl
│   │   │   │   ├── mcq/  (4 files)
│   │   │   │   │   ├── file-systems-deadlocks-and-virtualizationmcq.json
│   │   │   │   │   ├── lesson1mcq.json
│   │   │   │   │   ├── memory-managementmcq.json
│   │   │   │   │   └── processes-and-schedulingmcq.json
│   │   │   │   ├── details.zl
│   │   │   │   └── index.json
│   │   │   ├── programming/  (10 files)
│   │   │   │   ├── lessons/  (4 files)
│   │   │   │   │   ├── data-structures.zl
│   │   │   │   │   ├── debugging-and-development-tools.zl
│   │   │   │   │   ├── lesson1.zl
│   │   │   │   │   └── object-oriented-programming.zl
│   │   │   │   ├── mcq/  (4 files)
│   │   │   │   │   ├── data-structuresmcq.json
│   │   │   │   │   ├── debugging-and-development-toolsmcq.json
│   │   │   │   │   ├── lesson1mcq.json
│   │   │   │   │   └── object-oriented-programmingmcq.json
│   │   │   │   ├── details.zl
│   │   │   │   └── index.json
│   │   │   ├── details.zl
│   │   │   └── index.json
│   │   ├── economics/  (28 files)
│   │   │   ├── lessons/  (13 files)
│   │   │   │   ├── banking-and-rbi.zl
│   │   │   │   ├── demand-and-supply.zl
│   │   │   │   ├── elasticity.zl
│   │   │   │   ├── fiscal-policy-and-budget.zl
│   │   │   │   ├── inflation.zl
│   │   │   │   ├── international-trade.zl
│   │   │   │   ├── lesson1.zl
│   │   │   │   ├── market-structures.zl
│   │   │   │   ├── monetary-policy.zl
│   │   │   │   ├── money.zl
│   │   │   │   ├── national-income.zl
│   │   │   │   ├── poverty-and-employment.zl
│   │   │   │   └── production-and-costs.zl
│   │   │   ├── mcq/  (13 files)
│   │   │   │   ├── banking-and-rbimcq.json
│   │   │   │   ├── demand-and-supplymcq.json
│   │   │   │   ├── elasticitymcq.json
│   │   │   │   ├── fiscal-policy-and-budgetmcq.json
│   │   │   │   ├── inflationmcq.json
│   │   │   │   ├── international-trademcq.json
│   │   │   │   ├── lesson1mcq.json
│   │   │   │   ├── market-structuresmcq.json
│   │   │   │   ├── monetary-policymcq.json
│   │   │   │   ├── moneymcq.json
│   │   │   │   ├── national-incomemcq.json
│   │   │   │   ├── poverty-and-employmentmcq.json
│   │   │   │   └── production-and-costsmcq.json
│   │   │   ├── details.zl
│   │   │   └── index.json
│   │   ├── geography/  (28 files)
│   │   │   ├── lessons/  (13 files)
│   │   │   │   ├── atmosphere-and-insolation.zl
│   │   │   │   ├── earthquakes-and-volcanoes.zl
│   │   │   │   ├── indian-rivers-and-lakes.zl
│   │   │   │   ├── interior-of-the-earth.zl
│   │   │   │   ├── landforms-and-geomorphic-processes.zl
│   │   │   │   ├── lesson1.zl
│   │   │   │   ├── monsoon-climate-of-india.zl
│   │   │   │   ├── ocean-currents-and-tides.zl
│   │   │   │   ├── oceans-relief-and-properties.zl
│   │   │   │   ├── pressure-and-winds.zl
│   │   │   │   ├── rocks-and-minerals.zl
│   │   │   │   ├── soils-and-natural-vegetation.zl
│   │   │   │   └── world-population-and-settlement.zl
│   │   │   ├── mcq/  (13 files)
│   │   │   │   ├── atmosphere-and-insolationmcq.json
│   │   │   │   ├── earthquakes-and-volcanoesmcq.json
│   │   │   │   ├── indian-rivers-and-lakesmcq.json
│   │   │   │   ├── interior-of-the-earthmcq.json
│   │   │   │   ├── landforms-and-geomorphic-processesmcq.json
│   │   │   │   ├── lesson1mcq.json
│   │   │   │   ├── monsoon-climate-of-indiamcq.json
│   │   │   │   ├── ocean-currents-and-tidesmcq.json
│   │   │   │   ├── oceans-relief-and-propertiesmcq.json
│   │   │   │   ├── pressure-and-windsmcq.json
│   │   │   │   ├── rocks-and-mineralsmcq.json
│   │   │   │   ├── soils-and-natural-vegetationmcq.json
│   │   │   │   └── world-population-and-settlementmcq.json
│   │   │   ├── details.zl
│   │   │   └── index.json
│   │   ├── history/  (30 files)
│   │   │   ├── lessons/  (14 files)
│   │   │   │   ├── british-conquest-and-1857.zl
│   │   │   │   ├── delhi-sultanate.zl
│   │   │   │   ├── gandhian-era-1919-1947.zl
│   │   │   │   ├── gupta-empire-and-classical-india.zl
│   │   │   │   ├── indian-national-movement-1885-1919.zl
│   │   │   │   ├── indus-valley-civilization.zl
│   │   │   │   ├── lesson1.zl
│   │   │   │   ├── marathas-and-the-18th-century.zl
│   │   │   │   ├── mauryan-empire.zl
│   │   │   │   ├── mughal-empire.zl
│   │   │   │   ├── religious-movements-buddhism-jainism.zl
│   │   │   │   ├── vedic-age.zl
│   │   │   │   ├── world-revolutions.zl
│   │   │   │   └── world-wars-and-the-cold-war.zl
│   │   │   ├── mcq/  (14 files)
│   │   │   │   ├── british-conquest-and-1857mcq.json
│   │   │   │   ├── delhi-sultanatemcq.json
│   │   │   │   ├── gandhian-era-1919-1947mcq.json
│   │   │   │   ├── gupta-empire-and-classical-indiamcq.json
│   │   │   │   ├── indian-national-movement-1885-1919mcq.json
│   │   │   │   ├── indus-valley-civilizationmcq.json
│   │   │   │   ├── lesson1mcq.json
│   │   │   │   ├── marathas-and-the-18th-centurymcq.json
│   │   │   │   ├── mauryan-empiremcq.json
│   │   │   │   ├── mughal-empiremcq.json
│   │   │   │   ├── religious-movements-buddhism-jainismmcq.json
│   │   │   │   ├── vedic-agemcq.json
│   │   │   │   ├── world-revolutionsmcq.json
│   │   │   │   └── world-wars-and-the-cold-warmcq.json
│   │   │   ├── details.zl
│   │   │   └── index.json
│   │   ├── languages/  (108 files)
│   │   │   ├── english/  (46 files)
│   │   │   │   ├── lessons/  (22 files)
│   │   │   │   │   ├── active_passive_voice.zl
│   │   │   │   │   ├── adjective.zl
│   │   │   │   │   ├── adverb.zl
│   │   │   │   │   ├── articles.zl
│   │   │   │   │   ├── conjunctions.zl
│   │   │   │   │   ├── idioms_and_phrases.zl
│   │   │   │   │   ├── modals.zl
│   │   │   │   │   ├── narration_direct_indirect.zl
│   │   │   │   │   ├── noun.zl
│   │   │   │   │   ├── one_word_substitution.zl
│   │   │   │   │   ├── prepositions.zl
│   │   │   │   │   ├── pronoun.zl
│   │   │   │   │   ├── question_tag.zl
│   │   │   │   │   ├── reading_comprehension.zl
│   │   │   │   │   ├── subject_verb_agreement_advanced.zl
│   │   │   │   │   ├── subject_verb_agreement_basics.zl
│   │   │   │   │   ├── tense_future.zl
│   │   │   │   │   ├── tense_past.zl
│   │   │   │   │   ├── tense_present.zl
│   │   │   │   │   ├── verbs_finite_non_finite.zl
│   │   │   │   │   ├── vocabulary_antonyms.zl
│   │   │   │   │   └── vocabulary_synonyms.zl
│   │   │   │   ├── mcq/  (22 files)
│   │   │   │   │   ├── active_passive_voicemcq.json
│   │   │   │   │   ├── adjectivemcq.json
│   │   │   │   │   ├── adverbmcq.json
│   │   │   │   │   ├── articlesmcq.json
│   │   │   │   │   ├── conjunctionsmcq.json
│   │   │   │   │   ├── idioms_and_phrasesmcq.json
│   │   │   │   │   ├── modalsmcq.json
│   │   │   │   │   ├── narration_direct_indirectmcq.json
│   │   │   │   │   ├── nounmcq.json
│   │   │   │   │   ├── one_word_substitutionmcq.json
│   │   │   │   │   ├── prepositionsmcq.json
│   │   │   │   │   ├── pronounmcq.json
│   │   │   │   │   ├── question_tagmcq.json
│   │   │   │   │   ├── reading_comprehensionmcq.json
│   │   │   │   │   ├── subject_verb_agreement_advancedmcq.json
│   │   │   │   │   ├── subject_verb_agreement_basicsmcq.json
│   │   │   │   │   ├── tense_futuremcq.json
│   │   │   │   │   ├── tense_pastmcq.json
│   │   │   │   │   ├── tense_presentmcq.json
│   │   │   │   │   ├── verbs_finite_non_finitemcq.json
│   │   │   │   │   ├── vocabulary_antonymsmcq.json
│   │   │   │   │   └── vocabulary_synonymsmcq.json
│   │   │   │   ├── details.zl
│   │   │   │   └── index.json
│   │   │   ├── hindi/  (58 files)
│   │   │   │   ├── lessons/  (28 files)
│   │   │   │   │   ├── alankar.zl
│   │   │   │   │   ├── anekarthi.zl
│   │   │   │   │   ├── avyaya.zl
│   │   │   │   │   ├── chhand.zl
│   │   │   │   │   ├── kaal.zl
│   │   │   │   │   ├── karak.zl
│   │   │   │   │   ├── kriya.zl
│   │   │   │   │   ├── ling.zl
│   │   │   │   │   ├── muhavare_lokokti.zl
│   │   │   │   │   ├── paryayvachi.zl
│   │   │   │   │   ├── ras.zl
│   │   │   │   │   ├── samas.zl
│   │   │   │   │   ├── samshrut_bhinnarthak.zl
│   │   │   │   │   ├── samucchaybodhak.zl
│   │   │   │   │   ├── sandhi.zl
│   │   │   │   │   ├── sanghya.zl
│   │   │   │   │   ├── sarvnam.zl
│   │   │   │   │   ├── tatsam_tadbhav.zl
│   │   │   │   │   ├── vachan.zl
│   │   │   │   │   ├── vachya.zl
│   │   │   │   │   ├── vakya.zl
│   │   │   │   │   ├── vakyansh_ek_shabd.zl
│   │   │   │   │   ├── varnmala.zl
│   │   │   │   │   ├── vartani_prashasnik.zl
│   │   │   │   │   ├── vigyan_prodyogiki.zl
│   │   │   │   │   ├── vilom.zl
│   │   │   │   │   ├── viram_chinh.zl
│   │   │   │   │   └── visheshana.zl
│   │   │   │   ├── mcq/  (28 files)
│   │   │   │   │   ├── alankarmcq.json
│   │   │   │   │   ├── anekarthimcq.json
│   │   │   │   │   ├── avyayamcq.json
│   │   │   │   │   ├── chhandmcq.json
│   │   │   │   │   ├── kaalmcq.json
│   │   │   │   │   ├── karakmcq.json
│   │   │   │   │   ├── kriyamcq.json
│   │   │   │   │   ├── lingmcq.json
│   │   │   │   │   ├── muhavare_lokoktimcq.json
│   │   │   │   │   ├── paryayvachimcq.json
│   │   │   │   │   ├── rasmcq.json
│   │   │   │   │   ├── samasmcq.json
│   │   │   │   │   ├── samshrut_bhinnarthakmcq.json
│   │   │   │   │   ├── samucchaybodhakmcq.json
│   │   │   │   │   ├── sandhimcq.json
│   │   │   │   │   ├── sanghyamcq.json
│   │   │   │   │   ├── sarvnammcq.json
│   │   │   │   │   ├── tatsam_tadbhavmcq.json
│   │   │   │   │   ├── vachanmcq.json
│   │   │   │   │   ├── vachyamcq.json
│   │   │   │   │   ├── vakyamcq.json
│   │   │   │   │   ├── vakyansh_ek_shabdmcq.json
│   │   │   │   │   ├── varnmalamcq.json
│   │   │   │   │   ├── vartani_prashasnikmcq.json
│   │   │   │   │   ├── vigyan_prodyogikimcq.json
│   │   │   │   │   ├── vilommcq.json
│   │   │   │   │   ├── viram_chinhmcq.json
│   │   │   │   │   └── visheshanamcq.json
│   │   │   │   ├── details.zl
│   │   │   │   └── index.json
│   │   │   ├── lessons
│   │   │   │   └── lesson1.zl
│   │   │   ├── mcq
│   │   │   │   └── lesson1mcq.json
│   │   │   ├── details.zl
│   │   │   └── index.json
│   │   ├── mathematics/  (50 files)
│   │   │   ├── algebra/  (10 files)
│   │   │   │   ├── lessons/  (4 files)
│   │   │   │   │   ├── lesson1.zl
│   │   │   │   │   ├── linear-equations.zl
│   │   │   │   │   ├── polynomials-and-factorisation.zl
│   │   │   │   │   └── quadratic-equations.zl
│   │   │   │   ├── mcq/  (4 files)
│   │   │   │   │   ├── lesson1mcq.json
│   │   │   │   │   ├── linear-equationsmcq.json
│   │   │   │   │   ├── polynomials-and-factorisationmcq.json
│   │   │   │   │   └── quadratic-equationsmcq.json
│   │   │   │   ├── details.zl
│   │   │   │   └── index.json
│   │   │   ├── calculus/  (8 files)
│   │   │   │   ├── lessons
│   │   │   │   │   ├── derivatives.zl
│   │   │   │   │   ├── integration-basics.zl
│   │   │   │   │   └── lesson1.zl
│   │   │   │   ├── mcq
│   │   │   │   │   ├── derivativesmcq.json
│   │   │   │   │   ├── integration-basicsmcq.json
│   │   │   │   │   └── lesson1mcq.json
│   │   │   │   ├── details.zl
│   │   │   │   └── index.json
│   │   │   ├── geometry/  (10 files)
│   │   │   │   ├── lessons/  (4 files)
│   │   │   │   │   ├── circles-and-their-properties.zl
│   │   │   │   │   ├── circles.zl
│   │   │   │   │   ├── lesson1.zl
│   │   │   │   │   └── triangles-properties.zl
│   │   │   │   ├── mcq/  (4 files)
│   │   │   │   │   ├── circles-and-their-propertiesmcq.json
│   │   │   │   │   ├── circlesmcq.json
│   │   │   │   │   ├── lesson1mcq.json
│   │   │   │   │   └── triangles-propertiesmcq.json
│   │   │   │   ├── details.zl
│   │   │   │   └── index.json
│   │   │   ├── numbers/  (10 files)
│   │   │   │   ├── lessons/  (4 files)
│   │   │   │   │   ├── fractions-and-decimals.zl
│   │   │   │   │   ├── lcm-and-hcf.zl
│   │   │   │   │   ├── numbers.zl
│   │   │   │   │   └── percentages-and-ratios.zl
│   │   │   │   ├── mcq/  (4 files)
│   │   │   │   │   ├── fractions-and-decimalsmcq.json
│   │   │   │   │   ├── lcm-and-hcfmcq.json
│   │   │   │   │   ├── numbersmcq.json
│   │   │   │   │   └── percentages-and-ratiosmcq.json
│   │   │   │   ├── details.zl
│   │   │   │   └── index.json
│   │   │   ├── statistics/  (10 files)
│   │   │   │   ├── lessons/  (4 files)
│   │   │   │   │   ├── data-interpretation-and-correlation.zl
│   │   │   │   │   ├── lesson1.zl
│   │   │   │   │   ├── probability-basics.zl
│   │   │   │   │   └── probability.zl
│   │   │   │   ├── mcq/  (4 files)
│   │   │   │   │   ├── data-interpretation-and-correlationmcq.json
│   │   │   │   │   ├── lesson1mcq.json
│   │   │   │   │   ├── probability-basicsmcq.json
│   │   │   │   │   └── probabilitymcq.json
│   │   │   │   ├── details.zl
│   │   │   │   └── index.json
│   │   │   ├── details.zl
│   │   │   └── index.json
│   │   ├── philosophy/  (24 files)
│   │   │   ├── lessons/  (11 files)
│   │   │   │   ├── buddhist-philosophy.zl
│   │   │   │   ├── carvaka-and-heterodox-schools.zl
│   │   │   │   ├── ethics-theories.zl
│   │   │   │   ├── greek-philosophy.zl
│   │   │   │   ├── jain-philosophy.zl
│   │   │   │   ├── kant-to-existentialism.zl
│   │   │   │   ├── lesson1.zl
│   │   │   │   ├── logic-and-argumentation.zl
│   │   │   │   ├── medieval-to-early-modern-philosophy.zl
│   │   │   │   ├── six-orthodox-schools.zl
│   │   │   │   └── upanishads-and-vedanta.zl
│   │   │   ├── mcq/  (11 files)
│   │   │   │   ├── buddhist-philosophymcq.json
│   │   │   │   ├── carvaka-and-heterodox-schoolsmcq.json
│   │   │   │   ├── ethics-theoriesmcq.json
│   │   │   │   ├── greek-philosophymcq.json
│   │   │   │   ├── jain-philosophymcq.json
│   │   │   │   ├── kant-to-existentialismmcq.json
│   │   │   │   ├── lesson1mcq.json
│   │   │   │   ├── logic-and-argumentationmcq.json
│   │   │   │   ├── medieval-to-early-modern-philosophymcq.json
│   │   │   │   ├── six-orthodox-schoolsmcq.json
│   │   │   │   └── upanishads-and-vedantamcq.json
│   │   │   ├── details.zl
│   │   │   └── index.json
│   │   ├── reasoning/  (242 files)
│   │   │   ├── analogy-and-classification/  (60 files)
│   │   │   │   ├── lessons/  (29 files)
│   │   │   │   │   ├── analogy-and-classification-reasoning.zl
│   │   │   │   │   ├── analogy-detailed-part-1.zl
│   │   │   │   │   ├── analogy-detailed-part-10.zl
│   │   │   │   │   ├── analogy-detailed-part-11.zl
│   │   │   │   │   ├── analogy-detailed-part-12.zl
│   │   │   │   │   ├── analogy-detailed-part-2.zl
│   │   │   │   │   ├── analogy-detailed-part-3.zl
│   │   │   │   │   ├── analogy-detailed-part-4.zl
│   │   │   │   │   ├── analogy-detailed-part-5.zl
│   │   │   │   │   ├── analogy-detailed-part-6.zl
│   │   │   │   │   ├── analogy-detailed-part-7.zl
│   │   │   │   │   ├── analogy-detailed-part-8.zl
│   │   │   │   │   ├── analogy-detailed-part-9.zl
│   │   │   │   │   ├── classification-detailed-part-1.zl
│   │   │   │   │   ├── classification-detailed-part-10.zl
│   │   │   │   │   ├── classification-detailed-part-11.zl
│   │   │   │   │   ├── classification-detailed-part-12.zl
│   │   │   │   │   ├── classification-detailed-part-13.zl
│   │   │   │   │   ├── classification-detailed-part-14.zl
│   │   │   │   │   ├── classification-detailed-part-15.zl
│   │   │   │   │   ├── classification-detailed-part-16.zl
│   │   │   │   │   ├── classification-detailed-part-2.zl
│   │   │   │   │   ├── classification-detailed-part-3.zl
│   │   │   │   │   ├── classification-detailed-part-4.zl
│   │   │   │   │   ├── classification-detailed-part-5.zl
│   │   │   │   │   ├── classification-detailed-part-6.zl
│   │   │   │   │   ├── classification-detailed-part-7.zl
│   │   │   │   │   ├── classification-detailed-part-8.zl
│   │   │   │   │   └── classification-detailed-part-9.zl
│   │   │   │   ├── mcq/  (29 files)
│   │   │   │   │   ├── analogy-and-classification-reasoningmcq.json
│   │   │   │   │   ├── analogy-detailed-part-10mcq.json
│   │   │   │   │   ├── analogy-detailed-part-11mcq.json
│   │   │   │   │   ├── analogy-detailed-part-12mcq.json
│   │   │   │   │   ├── analogy-detailed-part-1mcq.json
│   │   │   │   │   ├── analogy-detailed-part-2mcq.json
│   │   │   │   │   ├── analogy-detailed-part-3mcq.json
│   │   │   │   │   ├── analogy-detailed-part-4mcq.json
│   │   │   │   │   ├── analogy-detailed-part-5mcq.json
│   │   │   │   │   ├── analogy-detailed-part-6mcq.json
│   │   │   │   │   ├── analogy-detailed-part-7mcq.json
│   │   │   │   │   ├── analogy-detailed-part-8mcq.json
│   │   │   │   │   ├── analogy-detailed-part-9mcq.json
│   │   │   │   │   ├── classification-detailed-part-10mcq.json
│   │   │   │   │   ├── classification-detailed-part-11mcq.json
│   │   │   │   │   ├── classification-detailed-part-12mcq.json
│   │   │   │   │   ├── classification-detailed-part-13mcq.json
│   │   │   │   │   ├── classification-detailed-part-14mcq.json
│   │   │   │   │   ├── classification-detailed-part-15mcq.json
│   │   │   │   │   ├── classification-detailed-part-16mcq.json
│   │   │   │   │   ├── classification-detailed-part-1mcq.json
│   │   │   │   │   ├── classification-detailed-part-2mcq.json
│   │   │   │   │   ├── classification-detailed-part-3mcq.json
│   │   │   │   │   ├── classification-detailed-part-4mcq.json
│   │   │   │   │   ├── classification-detailed-part-5mcq.json
│   │   │   │   │   ├── classification-detailed-part-6mcq.json
│   │   │   │   │   ├── classification-detailed-part-7mcq.json
│   │   │   │   │   ├── classification-detailed-part-8mcq.json
│   │   │   │   │   └── classification-detailed-part-9mcq.json
│   │   │   │   ├── details.zl
│   │   │   │   └── index.json
│   │   │   ├── blood-relation/  (10 files)
│   │   │   │   ├── lessons/  (4 files)
│   │   │   │   │   ├── blood-relation-reasoning-part-1.zl
│   │   │   │   │   ├── blood-relation-reasoning-part-2.zl
│   │   │   │   │   ├── blood-relation-reasoning-part-3.zl
│   │   │   │   │   └── blood-relation-reasoning-part-4.zl
│   │   │   │   ├── mcq/  (4 files)
│   │   │   │   │   ├── blood-relation-reasoning-part-1mcq.json
│   │   │   │   │   ├── blood-relation-reasoning-part-2mcq.json
│   │   │   │   │   ├── blood-relation-reasoning-part-3mcq.json
│   │   │   │   │   └── blood-relation-reasoning-part-4mcq.json
│   │   │   │   ├── details.zl
│   │   │   │   └── index.json
│   │   │   ├── clock/  (22 files)
│   │   │   │   ├── lessons/  (10 files)
│   │   │   │   │   ├── clock-reasoning-part-1.zl
│   │   │   │   │   ├── clock-reasoning-part-10.zl
│   │   │   │   │   ├── clock-reasoning-part-2.zl
│   │   │   │   │   ├── clock-reasoning-part-3.zl
│   │   │   │   │   ├── clock-reasoning-part-4.zl
│   │   │   │   │   ├── clock-reasoning-part-5.zl
│   │   │   │   │   ├── clock-reasoning-part-6.zl
│   │   │   │   │   ├── clock-reasoning-part-7.zl
│   │   │   │   │   ├── clock-reasoning-part-8.zl
│   │   │   │   │   └── clock-reasoning-part-9.zl
│   │   │   │   ├── mcq/  (10 files)
│   │   │   │   │   ├── clock-reasoning-part-10mcq.json
│   │   │   │   │   ├── clock-reasoning-part-1mcq.json
│   │   │   │   │   ├── clock-reasoning-part-2mcq.json
│   │   │   │   │   ├── clock-reasoning-part-3mcq.json
│   │   │   │   │   ├── clock-reasoning-part-4mcq.json
│   │   │   │   │   ├── clock-reasoning-part-5mcq.json
│   │   │   │   │   ├── clock-reasoning-part-6mcq.json
│   │   │   │   │   ├── clock-reasoning-part-7mcq.json
│   │   │   │   │   ├── clock-reasoning-part-8mcq.json
│   │   │   │   │   └── clock-reasoning-part-9mcq.json
│   │   │   │   ├── details.zl
│   │   │   │   └── index.json
│   │   │   ├── coding-decoding/  (48 files)
│   │   │   │   ├── lessons/  (23 files)
│   │   │   │   │   ├── coding-decoding-detailed-part-1.zl
│   │   │   │   │   ├── coding-decoding-detailed-part-10.zl
│   │   │   │   │   ├── coding-decoding-detailed-part-11.zl
│   │   │   │   │   ├── coding-decoding-detailed-part-12.zl
│   │   │   │   │   ├── coding-decoding-detailed-part-13.zl
│   │   │   │   │   ├── coding-decoding-detailed-part-14.zl
│   │   │   │   │   ├── coding-decoding-detailed-part-15.zl
│   │   │   │   │   ├── coding-decoding-detailed-part-16.zl
│   │   │   │   │   ├── coding-decoding-detailed-part-17.zl
│   │   │   │   │   ├── coding-decoding-detailed-part-18.zl
│   │   │   │   │   ├── coding-decoding-detailed-part-19.zl
│   │   │   │   │   ├── coding-decoding-detailed-part-2.zl
│   │   │   │   │   ├── coding-decoding-detailed-part-20.zl
│   │   │   │   │   ├── coding-decoding-detailed-part-21.zl
│   │   │   │   │   ├── coding-decoding-detailed-part-22.zl
│   │   │   │   │   ├── coding-decoding-detailed-part-3.zl
│   │   │   │   │   ├── coding-decoding-detailed-part-4.zl
│   │   │   │   │   ├── coding-decoding-detailed-part-5.zl
│   │   │   │   │   ├── coding-decoding-detailed-part-6.zl
│   │   │   │   │   ├── coding-decoding-detailed-part-7.zl
│   │   │   │   │   ├── coding-decoding-detailed-part-8.zl
│   │   │   │   │   ├── coding-decoding-detailed-part-9.zl
│   │   │   │   │   └── coding-decoding-reasoning.zl
│   │   │   │   ├── mcq/  (23 files)
│   │   │   │   │   ├── coding-decoding-detailed-part-10mcq.json
│   │   │   │   │   ├── coding-decoding-detailed-part-11mcq.json
│   │   │   │   │   ├── coding-decoding-detailed-part-12mcq.json
│   │   │   │   │   ├── coding-decoding-detailed-part-13mcq.json
│   │   │   │   │   ├── coding-decoding-detailed-part-14mcq.json
│   │   │   │   │   ├── coding-decoding-detailed-part-15mcq.json
│   │   │   │   │   ├── coding-decoding-detailed-part-16mcq.json
│   │   │   │   │   ├── coding-decoding-detailed-part-17mcq.json
│   │   │   │   │   ├── coding-decoding-detailed-part-18mcq.json
│   │   │   │   │   ├── coding-decoding-detailed-part-19mcq.json
│   │   │   │   │   ├── coding-decoding-detailed-part-1mcq.json
│   │   │   │   │   ├── coding-decoding-detailed-part-20mcq.json
│   │   │   │   │   ├── coding-decoding-detailed-part-21mcq.json
│   │   │   │   │   ├── coding-decoding-detailed-part-22mcq.json
│   │   │   │   │   ├── coding-decoding-detailed-part-2mcq.json
│   │   │   │   │   ├── coding-decoding-detailed-part-3mcq.json
│   │   │   │   │   ├── coding-decoding-detailed-part-4mcq.json
│   │   │   │   │   ├── coding-decoding-detailed-part-5mcq.json
│   │   │   │   │   ├── coding-decoding-detailed-part-6mcq.json
│   │   │   │   │   ├── coding-decoding-detailed-part-7mcq.json
│   │   │   │   │   ├── coding-decoding-detailed-part-8mcq.json
│   │   │   │   │   ├── coding-decoding-detailed-part-9mcq.json
│   │   │   │   │   └── coding-decoding-reasoningmcq.json
│   │   │   │   ├── details.zl
│   │   │   │   └── index.json
│   │   │   ├── counting-of-figures/  (26 files)
│   │   │   │   ├── lessons/  (12 files)
│   │   │   │   │   ├── counting-of-figures-part-1.zl
│   │   │   │   │   ├── counting-of-figures-part-10.zl
│   │   │   │   │   ├── counting-of-figures-part-11.zl
│   │   │   │   │   ├── counting-of-figures-part-12.zl
│   │   │   │   │   ├── counting-of-figures-part-2.zl
│   │   │   │   │   ├── counting-of-figures-part-3.zl
│   │   │   │   │   ├── counting-of-figures-part-4.zl
│   │   │   │   │   ├── counting-of-figures-part-5.zl
│   │   │   │   │   ├── counting-of-figures-part-6.zl
│   │   │   │   │   ├── counting-of-figures-part-7.zl
│   │   │   │   │   ├── counting-of-figures-part-8.zl
│   │   │   │   │   └── counting-of-figures-part-9.zl
│   │   │   │   ├── mcq/  (12 files)
│   │   │   │   │   ├── counting-of-figures-part-10mcq.json
│   │   │   │   │   ├── counting-of-figures-part-11mcq.json
│   │   │   │   │   ├── counting-of-figures-part-12mcq.json
│   │   │   │   │   ├── counting-of-figures-part-1mcq.json
│   │   │   │   │   ├── counting-of-figures-part-2mcq.json
│   │   │   │   │   ├── counting-of-figures-part-3mcq.json
│   │   │   │   │   ├── counting-of-figures-part-4mcq.json
│   │   │   │   │   ├── counting-of-figures-part-5mcq.json
│   │   │   │   │   ├── counting-of-figures-part-6mcq.json
│   │   │   │   │   ├── counting-of-figures-part-7mcq.json
│   │   │   │   │   ├── counting-of-figures-part-8mcq.json
│   │   │   │   │   └── counting-of-figures-part-9mcq.json
│   │   │   │   ├── details.zl
│   │   │   │   └── index.json
│   │   │   ├── dice-reasoning/  (22 files)
│   │   │   │   ├── lessons/  (10 files)
│   │   │   │   │   ├── dice-reasoning-part-1.zl
│   │   │   │   │   ├── dice-reasoning-part-10.zl
│   │   │   │   │   ├── dice-reasoning-part-2.zl
│   │   │   │   │   ├── dice-reasoning-part-3.zl
│   │   │   │   │   ├── dice-reasoning-part-4.zl
│   │   │   │   │   ├── dice-reasoning-part-5.zl
│   │   │   │   │   ├── dice-reasoning-part-6.zl
│   │   │   │   │   ├── dice-reasoning-part-7.zl
│   │   │   │   │   ├── dice-reasoning-part-8.zl
│   │   │   │   │   └── dice-reasoning-part-9.zl
│   │   │   │   ├── mcq/  (10 files)
│   │   │   │   │   ├── dice-reasoning-part-10mcq.json
│   │   │   │   │   ├── dice-reasoning-part-1mcq.json
│   │   │   │   │   ├── dice-reasoning-part-2mcq.json
│   │   │   │   │   ├── dice-reasoning-part-3mcq.json
│   │   │   │   │   ├── dice-reasoning-part-4mcq.json
│   │   │   │   │   ├── dice-reasoning-part-5mcq.json
│   │   │   │   │   ├── dice-reasoning-part-6mcq.json
│   │   │   │   │   ├── dice-reasoning-part-7mcq.json
│   │   │   │   │   ├── dice-reasoning-part-8mcq.json
│   │   │   │   │   └── dice-reasoning-part-9mcq.json
│   │   │   │   ├── details.zl
│   │   │   │   └── index.json
│   │   │   ├── directions-and-distance/  (22 files)
│   │   │   │   ├── lessons/  (10 files)
│   │   │   │   │   ├── directions-and-distance-reasoning-part-1.zl
│   │   │   │   │   ├── directions-and-distance-reasoning-part-10.zl
│   │   │   │   │   ├── directions-and-distance-reasoning-part-2.zl
│   │   │   │   │   ├── directions-and-distance-reasoning-part-3.zl
│   │   │   │   │   ├── directions-and-distance-reasoning-part-4.zl
│   │   │   │   │   ├── directions-and-distance-reasoning-part-5.zl
│   │   │   │   │   ├── directions-and-distance-reasoning-part-6.zl
│   │   │   │   │   ├── directions-and-distance-reasoning-part-7.zl
│   │   │   │   │   ├── directions-and-distance-reasoning-part-8.zl
│   │   │   │   │   └── directions-and-distance-reasoning-part-9.zl
│   │   │   │   ├── mcq/  (10 files)
│   │   │   │   │   ├── directions-and-distance-reasoning-part-10mcq.json
│   │   │   │   │   ├── directions-and-distance-reasoning-part-1mcq.json
│   │   │   │   │   ├── directions-and-distance-reasoning-part-2mcq.json
│   │   │   │   │   ├── directions-and-distance-reasoning-part-3mcq.json
│   │   │   │   │   ├── directions-and-distance-reasoning-part-4mcq.json
│   │   │   │   │   ├── directions-and-distance-reasoning-part-5mcq.json
│   │   │   │   │   ├── directions-and-distance-reasoning-part-6mcq.json
│   │   │   │   │   ├── directions-and-distance-reasoning-part-7mcq.json
│   │   │   │   │   ├── directions-and-distance-reasoning-part-8mcq.json
│   │   │   │   │   └── directions-and-distance-reasoning-part-9mcq.json
│   │   │   │   ├── details.zl
│   │   │   │   └── index.json
│   │   │   ├── seating-arrangement/  (8 files)
│   │   │   │   ├── lessons
│   │   │   │   │   ├── circular-seating-arrangement.zl
│   │   │   │   │   ├── linear-seating-arrangement.zl
│   │   │   │   │   └── seating-arrangement-reasoning.zl
│   │   │   │   ├── mcq
│   │   │   │   │   ├── circular-seating-arrangementmcq.json
│   │   │   │   │   ├── linear-seating-arrangementmcq.json
│   │   │   │   │   └── seating-arrangement-reasoningmcq.json
│   │   │   │   ├── details.zl
│   │   │   │   └── index.json
│   │   │   ├── sentence-rearrangement/  (6 files)
│   │   │   │   ├── lessons
│   │   │   │   │   ├── para-jumble-strategies.zl
│   │   │   │   │   └── sentence-rearrangement.zl
│   │   │   │   ├── mcq
│   │   │   │   │   ├── para-jumble-strategiesmcq.json
│   │   │   │   │   └── sentence-rearrangementmcq.json
│   │   │   │   ├── details.zl
│   │   │   │   └── index.json
│   │   │   ├── series/  (8 files)
│   │   │   │   ├── lessons
│   │   │   │   │   ├── alphabet-and-mixed-series.zl
│   │   │   │   │   ├── number-series-patterns.zl
│   │   │   │   │   └── series-reasoning.zl
│   │   │   │   ├── mcq
│   │   │   │   │   ├── alphabet-and-mixed-seriesmcq.json
│   │   │   │   │   ├── number-series-patternsmcq.json
│   │   │   │   │   └── series-reasoningmcq.json
│   │   │   │   ├── details.zl
│   │   │   │   └── index.json
│   │   │   ├── syllogism/  (8 files)
│   │   │   │   ├── lessons
│   │   │   │   │   ├── reverse-syllogism-and-new-patterns.zl
│   │   │   │   │   ├── syllogism-possibility-and-venn-methods.zl
│   │   │   │   │   └── syllogism-reasoning.zl
│   │   │   │   ├── mcq
│   │   │   │   │   ├── reverse-syllogism-and-new-patternsmcq.json
│   │   │   │   │   ├── syllogism-possibility-and-venn-methodsmcq.json
│   │   │   │   │   └── syllogism-reasoningmcq.json
│   │   │   │   ├── details.zl
│   │   │   │   └── index.json
│   │   │   ├── details.zl
│   │   │   └── index.json
│   │   ├── science/  (78 files)
│   │   │   ├── biology/  (28 files)
│   │   │   │   ├── lessons/  (13 files)
│   │   │   │   │   ├── animal-classification.zl
│   │   │   │   │   ├── biology-introduction.zl
│   │   │   │   │   ├── blood.zl
│   │   │   │   │   ├── cell-biology.zl
│   │   │   │   │   ├── circulatory-system.zl
│   │   │   │   │   ├── ecology-and-diseases.zl
│   │   │   │   │   ├── endocrine-system.zl
│   │   │   │   │   ├── lesson1.zl
│   │   │   │   │   ├── nutrition-and-vitamins.zl
│   │   │   │   │   ├── plant-biology.zl
│   │   │   │   │   ├── reproductive-system.zl
│   │   │   │   │   ├── respiratory-system.zl
│   │   │   │   │   └── skeleton-and-muscular-system.zl
│   │   │   │   ├── mcq/  (13 files)
│   │   │   │   │   ├── animal-classificationmcq.json
│   │   │   │   │   ├── biology-introductionmcq.json
│   │   │   │   │   ├── bloodmcq.json
│   │   │   │   │   ├── cell-biologymcq.json
│   │   │   │   │   ├── circulatory-systemmcq.json
│   │   │   │   │   ├── ecology-and-diseasesmcq.json
│   │   │   │   │   ├── endocrine-systemmcq.json
│   │   │   │   │   ├── lesson1mcq.json
│   │   │   │   │   ├── nutrition-and-vitaminsmcq.json
│   │   │   │   │   ├── plant-biologymcq.json
│   │   │   │   │   ├── reproductive-systemmcq.json
│   │   │   │   │   ├── respiratory-systemmcq.json
│   │   │   │   │   └── skeleton-and-muscular-systemmcq.json
│   │   │   │   ├── details.zl
│   │   │   │   └── index.json
│   │   │   ├── chemistry/  (24 files)
│   │   │   │   ├── lessons/  (11 files)
│   │   │   │   │   ├── acids-bases-and-salts.zl
│   │   │   │   │   ├── atomic-structure.zl
│   │   │   │   │   ├── carbon-and-its-compounds.zl
│   │   │   │   │   ├── chemical-bonding.zl
│   │   │   │   │   ├── chemical-reactions-and-equilibrium.zl
│   │   │   │   │   ├── electrochemistry.zl
│   │   │   │   │   ├── lesson1.zl
│   │   │   │   │   ├── metals-and-nonmetals.zl
│   │   │   │   │   ├── mole-concept-and-stoichiometry.zl
│   │   │   │   │   ├── nuclear-chemistry-and-everyday-chemistry.zl
│   │   │   │   │   └── periodic-table.zl
│   │   │   │   ├── mcq/  (11 files)
│   │   │   │   │   ├── acids-bases-and-saltsmcq.json
│   │   │   │   │   ├── atomic-structuremcq.json
│   │   │   │   │   ├── carbon-and-its-compoundsmcq.json
│   │   │   │   │   ├── chemical-bondingmcq.json
│   │   │   │   │   ├── chemical-reactions-and-equilibriummcq.json
│   │   │   │   │   ├── electrochemistrymcq.json
│   │   │   │   │   ├── lesson1mcq.json
│   │   │   │   │   ├── metals-and-nonmetalsmcq.json
│   │   │   │   │   ├── mole-concept-and-stoichiometrymcq.json
│   │   │   │   │   ├── nuclear-chemistry-and-everyday-chemistrymcq.json
│   │   │   │   │   └── periodic-tablemcq.json
│   │   │   │   ├── details.zl
│   │   │   │   └── index.json
│   │   │   ├── physics/  (24 files)
│   │   │   │   ├── lessons/  (11 files)
│   │   │   │   │   ├── electricity-and-magnetism.zl
│   │   │   │   │   ├── gravitation.zl
│   │   │   │   │   ├── heat-and-thermodynamics.zl
│   │   │   │   │   ├── laws-of-motion.zl
│   │   │   │   │   ├── lesson1.hi.zl
│   │   │   │   │   ├── lesson1.zl
│   │   │   │   │   ├── light-and-optics.zl
│   │   │   │   │   ├── space-and-defence-technology.zl
│   │   │   │   │   ├── units-and-measurement.zl
│   │   │   │   │   ├── waves-and-sound.zl
│   │   │   │   │   └── work-energy-and-power.zl
│   │   │   │   ├── mcq/  (11 files)
│   │   │   │   │   ├── electricity-and-magnetismmcq.json
│   │   │   │   │   ├── gravitationmcq.json
│   │   │   │   │   ├── heat-and-thermodynamicsmcq.json
│   │   │   │   │   ├── laws-of-motionmcq.json
│   │   │   │   │   ├── lesson1mcq.hi.json
│   │   │   │   │   ├── lesson1mcq.json
│   │   │   │   │   ├── light-and-opticsmcq.json
│   │   │   │   │   ├── space-and-defence-technologymcq.json
│   │   │   │   │   ├── units-and-measurementmcq.json
│   │   │   │   │   ├── waves-and-soundmcq.json
│   │   │   │   │   └── work-energy-and-powermcq.json
│   │   │   │   ├── details.zl
│   │   │   │   └── index.json
│   │   │   ├── details.zl
│   │   │   └── index.json
│   ├── utils/  (13 files)
│   │   ├── accessibility.js
│   │   ├── active-nav.js
│   │   ├── dates.js
│   │   ├── debounce.js
│   │   ├── dom.js
│   │   ├── format.js
│   │   ├── icon.js
│   │   ├── icons.js
│   │   ├── ids.js
│   │   ├── prefetch.js
│   │   ├── sanitize.js
│   │   ├── text.js
│   │   └── theme.js
├── tests/  (12 files)
│   ├── content/  (5 files)
│   │   ├── index-json-consistency.test.js
│   │   ├── lesson-validation.test.js
│   │   ├── mcq-validation.test.js
│   │   ├── search-index.test.js
│   │   └── zolto-validation.test.js
│   ├── core
│   │   └── router.test.js
│   ├── engines/  (5 files)
│   │   ├── bookmark-engine.test.js
│   │   ├── mcq-engine.test.js
│   │   ├── progress-engine.test.js
│   │   ├── search-engine.test.js
│   │   └── zolto-engine.test.js
│   ├── services
│   │   └── content-service.test.js
├── tools/  (7 files)
│   ├── build-search-index.js
│   ├── bundle-css.js
│   ├── check-duplicates.js
│   ├── check-links.js
│   ├── generate-registry.js
│   ├── validate-content.js
│   └── validate-zolto.js
├── 404.html
├── BRANDING.md
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── index.html
├── LICENSE
├── package-lock.json
├── package.json
├── README.md
├── SECURITY.md
├── sw.js
└── tree.md
```

_Generated from the actual tree — regenerate after restructuring._