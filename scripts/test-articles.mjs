import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const articles = JSON.parse(readFileSync(join(root, 'scripts/articles.json'), 'utf8'));
const home = readFileSync(join(root, 'index.html'), 'utf8');
const css = readFileSync(join(root, 'styles.css'), 'utf8');
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

check(articles.length === 8, `expected 8 articles, found ${articles.length}`);
check(css.includes('.article-site-header'), 'missing article header styles');
check(css.includes('.article-footer-inner'), 'missing article footer layout styles');
check(css.includes('overflow-wrap: anywhere'), 'missing narrow-screen overflow protection');

for (const article of articles) {
  const pagePath = join(root, 'articles', article.slug, 'index.html');
  check(existsSync(pagePath), `${article.slug}: page is missing`);
  if (!existsSync(pagePath)) continue;
  const page = readFileSync(pagePath, 'utf8');

  check(page.includes('<meta name="viewport"'), `${article.slug}: viewport metadata is missing`);
  check(page.includes('class="article-site-header"'), `${article.slug}: header is missing`);
  check(page.includes('class="article-tags"'), `${article.slug}: tags are missing`);
  check(page.includes('class="article-body"'), `${article.slug}: body is missing`);
  check(page.includes('src="../../scripts/article-companion.js" defer'), `${article.slug}: focus companion is missing`);
  check(!page.includes('class="article-deck"'), `${article.slug}: duplicates the opening paragraph in the header`);
  check(page.includes('class="next-article"'), `${article.slug}: next navigation is missing`);
  check(page.includes('article-footer-inner'), `${article.slug}: footer layout hook is missing`);
  check(page.includes('../../styles.css?v=medium-exit-2'), `${article.slug}: stylesheet is not branch-relative`);
  check(!/(?:src|href)="\/(?!\/)/.test(page), `${article.slug}: contains a root-relative asset or navigation URL`);
  check(!/<\/a><a\b|<\/span><a\b|<\/a><span\b|<\/small><a\b|<\/span><span\b/.test(page), `${article.slug}: adjacent inline elements lack structural spacing`);

  for (const match of page.matchAll(/(?:src|href)="((?:\.\.\/)+[^"?#]+)(?:[?#][^"]*)?"/g)) {
    const target = normalize(join(dirname(pagePath), match[1]));
    const resolved = target.endsWith('/') ? join(target, 'index.html') : target;
    check(existsSync(resolved), `${article.slug}: broken local reference ${match[1]}`);
  }

  for (const image of page.matchAll(/<img\b([^>]*)>/g)) {
    check(/loading="lazy"/.test(image[1]), `${article.slug}: image is not lazy-loaded`);
    check(/alt="[^"]*"/.test(image[1]), `${article.slug}: image alt attribute is missing`);
  }
}

for (const article of articles) {
  check(home.includes(`articles/${article.slug}/`), `${article.slug}: homepage link is missing`);
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log(`Passed ${articles.length} article pages: structure, responsive safeguards, links, styles, and media references.`);
