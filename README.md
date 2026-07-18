# Algo Trading Website

[![Validate public website](https://github.com/ashishkaloge/algo-trading-website/actions/workflows/validate.yml/badge.svg)](https://github.com/ashishkaloge/algo-trading-website/actions/workflows/validate.yml)
[![MIT License](https://img.shields.io/github/license/ashishkaloge/algo-trading-website)](LICENSE)

A clean, framework-free landing-page starter built with semantic HTML, modern
CSS, and vanilla JavaScript.

This is the public source for the marketing website at
[tradign.com](https://tradign.com) and a real-world example that you can adapt
for your own product. The included copy, routes, legal pages, and brand assets
are specific to Tradign; replace them before publishing a derivative site.

![Tradign landing-page preview](_landing/assets/og-cover.png)

## Why this starter

- No framework, package manager, build step, or runtime environment variables.
- Responsive pages built from a small set of CSS tokens and primitives.
- Self-hosted fonts, social metadata, legal-page structure, and a sitemap.
- Dependency-free validation for public files and internal links.
- Optional product-demo styles and JavaScript stay isolated from the reusable
  landing-page core.
- One read-only GitHub Actions job; no deployment or production credentials.

The private product application, deployment automation, production
configuration, credentials, customer data, and internal operating documents
are intentionally not included.

## Learn the architecture

[ARCHITECTURE.md](ARCHITECTURE.md) explains the design in detail:

- why a no-build stack is a strong default for a landing page;
- how HTML, CSS, assets, shared navigation, and optional interactions fit
  together;
- how tokens, resets, primitives, components, and page styles stay separate;
- how to promote repeated styles into reusable primitives;
- how to add a page without breaking accessibility, metadata, links, or the
  sitemap; and
- when the site has grown enough to justify a static-site generator or
  framework.

The goal is not “never use a framework.” The goal is to add complexity only
when the product actually needs it.

## Quick start

Node.js is needed only for validation, not to run the site.

```bash
git clone https://github.com/ashishkaloge/algo-trading-website.git
cd algo-trading-website
python3 -m http.server 8101
```

Then open `http://127.0.0.1:8101/`.

## Project structure

| Path | Purpose |
| --- | --- |
| `index.html` | Homepage and interactive product walkthrough |
| `_landing/` | Shared styles, scripts, fonts, favicon, and social image |
| `platform/` | Product, plans, exchange, security, and system pages |
| `solutions/` | AI, visual builder, agents, and community pages |
| `resources/` | Documentation, guides, FAQ, and changelog pages |
| `legal/` | Tradign-specific legal pages; examples only, not legal advice |
| `sitemap.xml` | Canonical public page list for search engines |
| `ARCHITECTURE.md` | Design, CSS layering, primitives, pages, and deployment guide |
| `scripts/validate-static.mjs` | Public-file and internal-link validation |
| `CONTRIBUTING.md` | Small, reviewable contribution rules |

## Customize before publishing

1. Replace the Tradign name, wordmark, product copy, and contact details.
2. Replace every `tradign.com` canonical URL, social URL, and application CTA.
3. Update the colors, type, spacing, and layout tokens in
   `_landing/styles/tokens.css`.
4. Replace the favicon and `_landing/assets/og-cover.png` social image.
5. Remove pages you do not need, then update `sitemap.xml` and the validator's
   required-file list.
6. Have qualified counsel write or review your privacy policy, terms, and risk
   disclosures. Do not publish the included legal text unchanged for another
   business.

This command lists the main product-specific references to replace:

```bash
git grep -n -Ei 'tradign|tradign\.com|mailto:'
```

## Validation

```bash
node --check _landing/js/site.js
node --check _landing/js/script.js
node --check _landing/js/mockup.js
node --check scripts/validate-static.mjs
node scripts/validate-static.mjs
git diff --check
```

GitHub Actions runs the same checks for every push and pull request. This
repository does not contain a production deployment workflow.

## Security

Report suspected vulnerabilities privately as described in
[SECURITY.md](SECURITY.md). Never include credentials, private account data, or
exploit details in a public issue.

## License

The repository source is available under the [MIT License](LICENSE). The license
does not grant rights to use the Tradign name or trademarks; replace the brand
before publishing your own site.

The bundled Inter and Plus Jakarta Sans font files remain under the SIL Open
Font License terms recorded in [LICENSES](LICENSES/).
