#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, posix, resolve, sep } from 'node:path';

const root = process.cwd();

const requiredPaths = [
  'README.md',
  'ARCHITECTURE.md',
  'CONTRIBUTING.md',
  'LICENSE',
  'SECURITY.md',
  'THIRD_PARTY_NOTICES.md',
  'LICENSES/Inter-OFL-1.1.txt',
  'LICENSES/Plus-Jakarta-Sans-OFL-1.1.txt',
  'index.html',
  'robots.txt',
  'sitemap.xml',
  '_landing/assets/favicon.svg',
  '_landing/assets/og-cover.png',
  '_landing/assets/fonts/README.md',
  '_landing/assets/fonts/inter-latin.woff2',
  '_landing/assets/fonts/plus-jakarta-sans-latin.woff2',
  '_landing/styles/tokens.css',
  '_landing/styles/reset.css',
  '_landing/styles/primitives.css',
  '_landing/styles/components.css',
  '_landing/styles/pages.css',
  '_landing/styles/mockup.css',
  '_landing/js/site.js',
  '_landing/js/script.js',
  '_landing/js/mockup.js',
  'platform/about/index.html',
  'platform/exchanges/index.html',
  'platform/plans/index.html',
  'platform/security/index.html',
  'platform/system/index.html',
  'solutions/ai/index.html',
  'solutions/ai-agents/index.html',
  'solutions/community/index.html',
  'solutions/drag-and-drop/index.html',
  'resources/changelog/index.html',
  'resources/docs/index.html',
  'resources/faq/index.html',
  'resources/guides/index.html',
  'legal/privacy/index.html',
  'legal/risk/index.html',
  'legal/terms/index.html',
];

const publicRoots = ['_landing', 'platform', 'solutions', 'resources', 'legal'];
const failures = [];

function fail(message) {
  failures.push(message);
}

function pathExists(relativePath) {
  return existsSync(join(root, relativePath));
}

for (const requiredPath of requiredPaths) {
  if (!pathExists(requiredPath)) {
    fail(`Missing required public file: ${requiredPath}`);
  }
}

function trackedFiles() {
  try {
    return execFileSync('git', ['ls-files'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
      .split('\n')
      .filter(Boolean);
  } catch {
    return [];
  }
}

const forbiddenTrackedPatterns = [
  /^\.env(?:\.|$)/,
  /^\.gitlab-ci\.yml$/,
  /^AGENTS\.md$/,
  /^STORY\.md$/,
  /^accelerators(?:\/|$)/,
  /^deploy(?:\/|$)/,
  /^scripts\/deploy(?:\/|$)/,
  /\.private\.md$/,
  /(?:^|\/)(?:id_rsa|id_ed25519)(?:\.|$)/,
  /\.(?:pem|p12|pfx|key)$/i,
];

for (const file of trackedFiles()) {
  if (forbiddenTrackedPatterns.some((pattern) => pattern.test(file))) {
    fail(`Forbidden tracked file in public repository: ${file}`);
  }
}

function walk(dir, predicate = () => true) {
  if (!pathExists(dir)) {
    return [];
  }

  const output = [];
  for (const entry of readdirSync(join(root, dir), { withFileTypes: true })) {
    const relativePath = posix.join(dir.split(sep).join(posix.sep), entry.name);
    if (entry.isDirectory()) {
      output.push(...walk(relativePath, predicate));
    } else if (entry.isFile() && predicate(join(root, relativePath))) {
      output.push(relativePath);
    }
  }
  return output;
}

const htmlFiles = [
  'index.html',
  ...publicRoots.flatMap((dir) =>
    walk(dir, (file) => extname(file) === '.html'),
  ),
].filter((value, index, list) => list.indexOf(value) === index);

function pngSize(relativePath) {
  const buffer = readFileSync(join(root, relativePath));
  if (buffer.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
    fail(`${relativePath} is not a PNG`);
    return null;
  }
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

const ogSize = pathExists('_landing/assets/og-cover.png')
  ? pngSize('_landing/assets/og-cover.png')
  : null;

if (ogSize) {
  if (ogSize.width < 1200 || ogSize.height < 630) {
    fail(`OG image is too small: ${ogSize.width}x${ogSize.height}`);
  }
  const ratio = ogSize.width / ogSize.height;
  if (ratio < 1.7 || ratio > 1.95) {
    fail(`OG image ratio is unsuitable: ${ratio.toFixed(3)}`);
  }
}

const appOwnedPaths = [
  '/ai',
  '/auth',
  '/login',
  '/plan',
  '/proof',
  '/help',
  '/admin',
  '/settings',
  '/setting',
];

function localPathFromUrl(rawValue) {
  const value = rawValue.trim();
  if (
    !value ||
    value.startsWith('#') ||
    /^(?:mailto|tel|javascript|data):/i.test(value)
  ) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    const url = new URL(value);
    if (!['tradign.com', 'www.tradign.com'].includes(url.hostname)) {
      return null;
    }
    const pathname = url.pathname.replace(/\/{2,}/g, '/');
    if (pathname === '/' || pathname === '/robots.txt') {
      return pathname;
    }
    if (
      pathname.startsWith('/_landing/') ||
      /^\/(?:platform|solutions|resources|legal)(?:\/|$)/.test(pathname)
    ) {
      return pathname;
    }
    if (
      appOwnedPaths.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`),
      )
    ) {
      return null;
    }
    return null;
  }

  return value;
}

function resolveReference(fromHtml, rawReference) {
  const localPath = localPathFromUrl(rawReference);
  if (!localPath) {
    return null;
  }
  const withoutQuery = localPath.split('#')[0].split('?')[0];
  if (!withoutQuery) {
    return null;
  }

  const htmlDir = posix.dirname(fromHtml);
  let resolvedPath = withoutQuery.startsWith('/')
    ? withoutQuery.slice(1)
    : posix.normalize(
        posix.join(htmlDir === '.' ? '' : htmlDir, withoutQuery),
      );

  if (!resolvedPath || resolvedPath === '.') {
    resolvedPath = 'index.html';
  }
  if (resolvedPath.endsWith('/')) {
    resolvedPath = posix.join(resolvedPath, 'index.html');
  }

  const absolutePath = resolve(root, resolvedPath);
  if (!absolutePath.startsWith(`${root}${sep}`) && absolutePath !== root) {
    fail(`${fromHtml} references a path outside the repository: ${rawReference}`);
    return null;
  }
  return resolvedPath;
}

function referenceExists(relativePath) {
  if (pathExists(relativePath)) {
    return statSync(join(root, relativePath)).isFile();
  }
  return pathExists(posix.join(relativePath, 'index.html'));
}

const canonicalUrls = [];

for (const htmlFile of htmlFiles) {
  const html = readFileSync(join(root, htmlFile), 'utf8');
  if (!/<title>[^<]+<\/title>/i.test(html)) {
    fail(`${htmlFile} is missing a title`);
  }
  const canonicalMatch = html.match(
    /<link\s+[^>]*rel=["']canonical["'][^>]*href=["'](https:\/\/tradign\.com\/[^"']*)["']/i,
  );
  if (!canonicalMatch) {
    fail(`${htmlFile} is missing a tradign.com canonical URL`);
  } else {
    canonicalUrls.push(canonicalMatch[1]);
  }
  if (
    !/<meta\s+[^>]*property=["']og:url["'][^>]*content=["']https:\/\/tradign\.com\//i.test(
      html,
    )
  ) {
    fail(`${htmlFile} is missing a tradign.com og:url`);
  }

  const attributePattern = /\b(?:href|src)\s*=\s*["']([^"']+)["']/gi;
  for (const match of html.matchAll(attributePattern)) {
    const rawReference = match[1];
    const resolvedReference = resolveReference(htmlFile, rawReference);
    if (resolvedReference && !referenceExists(resolvedReference)) {
      fail(
        `${htmlFile} references a missing file: ${rawReference} -> ${resolvedReference}`,
      );
    }
  }
}

if (pathExists('sitemap.xml')) {
  const sitemap = readFileSync(join(root, 'sitemap.xml'), 'utf8');
  const sitemapUrls = [...sitemap.matchAll(/<loc>(https:\/\/tradign\.com\/[^<]*)<\/loc>/g)].map(
    (match) => match[1],
  );
  const uniqueSitemapUrls = new Set(sitemapUrls);

  if (!/<urlset\b[^>]*xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/i.test(sitemap)) {
    fail('sitemap.xml is missing the standard sitemap urlset');
  }
  if (uniqueSitemapUrls.size !== sitemapUrls.length) {
    fail('sitemap.xml contains duplicate URLs');
  }
  for (const canonicalUrl of canonicalUrls) {
    if (!uniqueSitemapUrls.has(canonicalUrl)) {
      fail(`sitemap.xml is missing canonical URL: ${canonicalUrl}`);
    }
  }
  for (const sitemapUrl of uniqueSitemapUrls) {
    if (!canonicalUrls.includes(sitemapUrl)) {
      fail(`sitemap.xml contains an unknown URL: ${sitemapUrl}`);
    }
  }
}

if (failures.length) {
  for (const message of failures) {
    console.error(`error: ${message}`);
  }
  process.exit(1);
}

console.log(`Static validation passed for ${htmlFiles.length} HTML files.`);
