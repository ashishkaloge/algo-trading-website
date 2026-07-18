# Contributing

Focused improvements are welcome. This repository is deliberately a plain
HTML, CSS, and JavaScript landing-page example, so changes should make that
approach clearer, safer, or easier to reuse.

## Before opening a change

- Keep private product code, credentials, customer data, environment files, and
  internal operating documents out of the repository.
- Prefer the existing stack and CSS layers.
- Do not add a framework, bundler, package manager, or runtime dependency
  without a concrete problem that the current structure cannot solve cleanly.
- Keep product claims and legal text evidence-based.
- Put reusable layout and interaction patterns in `primitives.css`; keep
  recognizable UI in components or page styles.
- Preserve keyboard behavior, focus visibility, reduced motion, and both color
  schemes.

Read [ARCHITECTURE.md](ARCHITECTURE.md) before changing structure or shared
styles.

## Local preview

```bash
python3 -m http.server 8101
```

Open `http://127.0.0.1:8101/`.

## Required checks

```bash
node --check _landing/js/site.js
node --check _landing/js/script.js
node --check _landing/js/mockup.js
node --check scripts/validate-static.mjs
node scripts/validate-static.mjs
git diff --check
```

Also test the affected page with a keyboard and at narrow and wide viewport
sizes. Theme-sensitive changes must be checked in both dark and light mode.

## Pull requests

Keep each pull request focused. Explain what changed, why the simpler existing
approach was insufficient, and which checks you ran. Screenshots are useful for
visible changes, but they do not replace responsive and keyboard verification.
