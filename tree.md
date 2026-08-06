```
OpenUniversity/
│
├── index.html
├── 404.html
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── CHANGELOG.md
├── package.json
├── .gitignore
│
├── public/
│   ├── manifest.json
│   ├── robots.txt
│   ├── sitemap.xml
│   │
│   ├── icons/
│   │   ├── icon-72.png
│   │   ├── icon-96.png
│   │   ├── icon-128.png
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   │
│   └── fonts/
│       └── README.md
│
├── src/
│   │
│   ├── app/
│   │   ├── app.js
│   │   ├── bootstrap.js
│   │   ├── config.js
│   │   ├── constants.js
│   │   ├── routes.js
│   │   └── state.js
│   │
│   ├── engines/
│   │   ├── subject-engine.js
│   │   ├── lesson-engine.js
│   │   ├── mcq-engine.js
│   │   │
│   │   ├── zolto/
│   │   │   ├── zolto-engine.js
│   │   │   ├── parser.js
│   │   │   ├── tokenizer.js
│   │   │   ├── lexer.js
│   │   │   ├── ast.js
│   │   │   ├── renderer.js
│   │   │   ├── validator.js
│   │   │   ├── errors.js
│   │   │   │
│   │   │   ├── blocks/
│   │   │   │   ├── text.js
│   │   │   │   ├── heading.js
│   │   │   │   ├── paragraph.js
│   │   │   │   ├── list.js
│   │   │   │   ├── equation.js
│   │   │   │   ├── diagram.js
│   │   │   │   ├── graph.js
│   │   │   │   ├── table.js
│   │   │   │   ├── example.js
│   │   │   │   ├── definition.js
│   │   │   │   ├── callout.js
│   │   │   │   ├── timeline.js
│   │   │   │   ├── concept-map.js
│   │   │   │   ├── code.js
│   │   │   │   └── interactive.js
│   │   │   │
│   │   │   └── extensions/
│   │   │       ├── math.js
│   │   │       ├── svg.js
│   │   │       ├── media.js
│   │   │       └── custom.js
│   │   │
│   │   ├── search-engine.js
│   │   ├── progress-engine.js
│   │   ├── bookmark-engine.js
│   │   ├── notes-engine.js
│   │   ├── account-engine.js
│   │   ├── navigation-engine.js
│   │   ├── recommendation-engine.js
│   │   └── contribution-engine.js
│   │
│   ├── core/
│   │   ├── event-bus.js
│   │   ├── router.js
│   │   ├── store.js
│   │   ├── loader.js
│   │   ├── cache.js
│   │   ├── validator.js
│   │   ├── error-handler.js
│   │   └── logger.js
│   │
│   ├── data/
│   │   ├── subject-registry.json
│   │   ├── lesson-registry.json
│   │   ├── search-index.json
│   │   ├── categories.json
│   │   └── site-details.json
│   │
│   ├── subjects/
│   │   │
│   │   ├── science/
│   │   │   ├── details.zl
│   │   │   │
│   │   │   ├── physics/
│   │   │   │   ├── details.zl
│   │   │   │   ├── index.json
│   │   │   │   │
│   │   │   │   ├── lessons/
│   │   │   │   │   ├── lesson1.zl
│   │   │   │   │   ├── lesson2.zl
│   │   │   │   │   └── ...
│   │   │   │   │
│   │   │   │   └── mcq/
│   │   │   │       ├── lesson1mcq.json
│   │   │   │       ├── lesson2mcq.json
│   │   │   │       └── ...
│   │   │   │
│   │   │   ├── chemistry/
│   │   │   │   ├── details.zl
│   │   │   │   ├── index.json
│   │   │   │   ├── lessons/
│   │   │   │   │   ├── lesson1.zl
│   │   │   │   │   └── ...
│   │   │   │   └── mcq/
│   │   │   │       ├── lesson1mcq.json
│   │   │   │       └── ...
│   │   │   │
│   │   │   └── biology/
│   │   │       ├── details.zl
│   │   │       ├── index.json
│   │   │       ├── lessons/
│   │   │       │   ├── lesson1.zl
│   │   │       │   └── ...
│   │   │       └── mcq/
│   │   │           ├── lesson1mcq.json
│   │   │           └── ...
│   │   │
│   │   ├── mathematics/
│   │   │   ├── details.zl
│   │   │   ├── index.json
│   │   │   │
│   │   │   ├── algebra/
│   │   │   │   ├── details.zl
│   │   │   │   ├── index.json
│   │   │   │   ├── lessons/
│   │   │   │   │   ├── lesson1.zl
│   │   │   │   │   └── ...
│   │   │   │   └── mcq/
│   │   │   │       ├── lesson1mcq.json
│   │   │   │       └── ...
│   │   │   │
│   │   │   ├── geometry/
│   │   │   │   ├── details.zl
│   │   │   │   ├── index.json
│   │   │   │   ├── lessons/
│   │   │   │   │   ├── lesson1.zl
│   │   │   │   │   └── ...
│   │   │   │   └── mcq/
│   │   │   │       ├── lesson1mcq.json
│   │   │   │       └── ...
│   │   │   │
│   │   │   ├── calculus/
│   │   │   │   ├── details.zl
│   │   │   │   ├── index.json
│   │   │   │   ├── lessons/
│   │   │   │   │   ├── lesson1.zl
│   │   │   │   │   └── ...
│   │   │   │   └── mcq/
│   │   │   │       ├── lesson1mcq.json
│   │   │   │       └── ...
│   │   │   │
│   │   │   └── statistics/
│   │   │       ├── details.zl
│   │   │       ├── index.json
│   │   │       ├── lessons/
│   │   │       │   ├── lesson1.zl
│   │   │       │   └── ...
│   │   │       └── mcq/
│   │   │           ├── lesson1mcq.json
│   │   │           └── ...
│   │   │
│   │   ├── computer-science/
│   │   │   ├── details.zl
│   │   │   ├── index.json
│   │   │   │
│   │   │   ├── programming/
│   │   │   │   ├── details.zl
│   │   │   │   ├── index.json
│   │   │   │   ├── lessons/
│   │   │   │   │   ├── lesson1.zl
│   │   │   │   │   └── ...
│   │   │   │   └── mcq/
│   │   │   │       ├── lesson1mcq.json
│   │   │   │       └── ...
│   │   │   │
│   │   │   ├── algorithms/
│   │   │   │   ├── details.zl
│   │   │   │   ├── index.json
│   │   │   │   ├── lessons/
│   │   │   │   │   ├── lesson1.zl
│   │   │   │   │   └── ...
│   │   │   │   └── mcq/
│   │   │   │       ├── lesson1mcq.json
│   │   │   │       └── ...
│   │   │   │
│   │   │   ├── operating-systems/
│   │   │   │   ├── details.zl
│   │   │   │   ├── index.json
│   │   │   │   ├── lessons/
│   │   │   │   │   ├── lesson1.zl
│   │   │   │   │   └── ...
│   │   │   │   └── mcq/
│   │   │   │       ├── lesson1mcq.json
│   │   │   │       └── ...
│   │   │   │
│   │   │   └── networking/
│   │   │       ├── details.zl
│   │   │       ├── index.json
│   │   │       ├── lessons/
│   │   │       │   ├── lesson1.zl
│   │   │       │   └── ...
│   │   │       └── mcq/
│   │   │           ├── lesson1mcq.json
│   │   │           └── ...
│   │   │
│   │   ├── history/
│   │   │   ├── details.zl
│   │   │   ├── index.json
│   │   │   ├── lessons/
│   │   │   │   ├── lesson1.zl
│   │   │   │   └── ...
│   │   │   └── mcq/
│   │   │       └── ...
│   │   │
│   │   ├── geography/
│   │   │   ├── details.zl
│   │   │   ├── index.json
│   │   │   ├── lessons/
│   │   │   │   ├── lesson1.zl
│   │   │   │   └── ...
│   │   │   └── mcq/
│   │   │       └── ...
│   │   │
│   │   ├── economics/
│   │   │   ├── details.zl
│   │   │   ├── index.json
│   │   │   ├── lessons/
│   │   │   │   ├── lesson1.zl
│   │   │   │   └── ...
│   │   │   └── mcq/
│   │   │       └── ...
│   │   │
│   │   ├── philosophy/
│   │   │   ├── details.zl
│   │   │   ├── index.json
│   │   │   ├── lessons/
│   │   │   │   ├── lesson1.zl
│   │   │   │   └── ...
│   │   │   └── mcq/
│   │   │       └── ...
│   │   │
│   │   └── languages/
│   │       ├── details.zl
│   │       ├── index.json
│   │       ├── lessons/
│   │       │   ├── lesson1.zl
│   │       │   └── ...
│   │       └── mcq/
│   │           └── ...
│   │
│   ├── components/
│   │   │
│   │   ├── layout/
│   │   │   ├── header.js
│   │   │   ├── sidebar.js
│   │   │   ├── footer.js
│   │   │   ├── breadcrumb.js
│   │   │   └── mobile-navigation.js
│   │   │
│   │   ├── subject/
│   │   │   ├── subject-card.js
│   │   │   ├── subject-header.js
│   │   │   ├── subject-progress.js
│   │   │   └── subject-list.js
│   │   │
│   │   ├── lesson/
│   │   │   ├── lesson-header.js
│   │   │   ├── lesson-content.js
│   │   │   ├── lesson-section.js
│   │   │   ├── lesson-navigation.js
│   │   │   ├── lesson-progress.js
│   │   │   ├── key-points.js
│   │   │   ├── glossary.js
│   │   │   └── related-lessons.js
│   │   │
│   │   ├── mcq/
│   │   │   ├── mcq-container.js
│   │   │   ├── mcq-question.js
│   │   │   ├── mcq-option.js
│   │   │   ├── mcq-feedback.js
│   │   │   ├── mcq-progress.js
│   │   │   ├── mcq-result.js
│   │   │   └── mcq-review.js
│   │   │
│   │   ├── search/
│   │   │   ├── search-box.js
│   │   │   ├── search-results.js
│   │   │   ├── search-filters.js
│   │   │   ├── search-history.js
│   │   │   └── search-suggestions.js
│   │   │
│   │   ├── bookmarks/
│   │   │   ├── bookmark-button.js
│   │   │   ├── bookmark-list.js
│   │   │   ├── bookmark-folder.js
│   │   │   └── bookmark-manager.js
│   │   │
│   │   ├── notes/
│   │   │   ├── notes-panel.js
│   │   │   ├── note-editor.js
│   │   │   ├── note-card.js
│   │   │   └── note-list.js
│   │   │
│   │   ├── progress/
│   │   │   ├── progress-card.js
│   │   │   ├── progress-ring.js
│   │   │   ├── progress-chart.js
│   │   │   ├── streak.js
│   │   │   └── achievements.js
│   │   │
│   │   ├── account/
│   │   │   ├── login-form.js
│   │   │   ├── register-form.js
│   │   │   ├── profile.js
│   │   │   ├── account-settings.js
│   │   │   └── logout.js
│   │   │
│   │   └── common/
│   │       ├── button.js
│   │       ├── modal.js
│   │       ├── dialog.js
│   │       ├── toast.js
│   │       ├── tooltip.js
│   │       ├── dropdown.js
│   │       ├── tabs.js
│   │       ├── accordion.js
│   │       ├── spinner.js
│   │       └── empty-state.js
│   │
│   ├── pages/
│   │   ├── home.js
│   │   ├── subjects.js
│   │   ├── subject.js
│   │   ├── sub-subject.js
│   │   ├── lesson.js
│   │   ├── mcq.js
│   │   ├── search.js
│   │   ├── bookmarks.js
│   │   ├── notes.js
│   │   ├── progress.js
│   │   ├── profile.js
│   │   ├── settings.js
│   │   ├── about.js
│   │   ├── contribute.js
│   │   └── not-found.js
│   │
│   ├── services/
│   │   ├── content-service.js
│   │   ├── zolto-service.js
│   │   ├── search-service.js
│   │   ├── progress-service.js
│   │   ├── bookmark-service.js
│   │   ├── notes-service.js
│   │   ├── account-service.js
│   │   ├── sync-service.js
│   │   └── contribution-service.js
│   │
│   ├── storage/
│   │   ├── local-storage.js
│   │   ├── indexed-db.js
│   │   ├── user-storage.js
│   │   ├── progress-storage.js
│   │   ├── bookmark-storage.js
│   │   └── notes-storage.js
│   │
│   ├── utils/
│   │   ├── dom.js
│   │   ├── format.js
│   │   ├── dates.js
│   │   ├── ids.js
│   │   ├── text.js
│   │   ├── sanitize.js
│   │   ├── accessibility.js
│   │   └── debounce.js
│   │
│   ├── accessibility/
│   │   ├── keyboard.js
│   │   ├── screen-reader.js
│   │   ├── focus-manager.js
│   │   └── accessibility-settings.js
│   │
│   ├── i18n/
│   │   ├── i18n.js
│   │   ├── en.json
│   │   └── hi.json
│   │
│   └── styles/
│       ├── main.css
│       ├── reset.css
│       ├── variables.css
│       ├── typography.css
│       ├── layout.css
│       ├── responsive.css
│       ├── accessibility.css
│       │
│       ├── components/
│       │   ├── buttons.css
│       │   ├── cards.css
│       │   ├── navbar.css
│       │   ├── sidebar.css
│       │   ├── modal.css
│       │   ├── toast.css
│       │   ├── tabs.css
│       │   ├── dropdown.css
│       │   └── progress.css
│       │
│       ├── lesson/
│       │   ├── lesson.css
│       │   ├── lesson-content.css
│       │   ├── lesson-navigation.css
│       │   ├── glossary.css
│       │   └── zolto-content.css
│       │
│       ├── mcq/
│       │   ├── mcq.css
│       │   ├── question.css
│       │   ├── options.css
│       │   └── results.css
│       │
│       ├── search/
│       │   └── search.css
│       │
│       ├── account/
│       │   └── account.css
│       │
│       └── themes/
│           ├── light.css
│           ├── dark.css
│           └── high-contrast.css
│
├── assets/
│   ├── illustrations/
│   ├── diagrams/
│   ├── backgrounds/
│   ├── avatars/
│   └── branding/
│       ├── logo.svg
│       └── wordmark.svg
│
├── schemas/
│   ├── subject.schema.json
│   ├── sub-subject.schema.json
│   ├── lesson.schema.json
│   ├── mcq.schema.json
│   ├── user.schema.json
│   └── contribution.schema.json
│
├── tools/
│   ├── validate-content.js
│   ├── validate-zolto.js
│   ├── build-search-index.js
│   ├── generate-registry.js
│   ├── check-links.js
│   └── check-duplicates.js
│
├── tests/
│   ├── engines/
│   │   ├── mcq-engine.test.js
│   │   ├── search-engine.test.js
│   │   ├── progress-engine.test.js
│   │   ├── bookmark-engine.test.js
│   │   └── zolto-engine.test.js
│   │
│   ├── content/
│   │   ├── lesson-validation.test.js
│   │   ├── zolto-validation.test.js
│   │   └── mcq-validation.test.js
│   │
│   └── components/
│       └── ...
│
└── .github/
    ├── workflows/
    │   ├── validate.yml
    │   ├── test.yml
    │   └── deploy.yml
    │
    ├── ISSUE_TEMPLATE/
    │   ├── bug.yml
    │   ├── lesson.yml
    │   └── feature.yml
    │
    └── PULL_REQUEST_TEMPLATE.md
```
